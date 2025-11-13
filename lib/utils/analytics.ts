/**
 * Analytics utilities for computing mentor metrics
 * Used for syncing computed fields to Airtable and admin dashboards
 */

import { db } from "@/lib/db";
import { mentors, officeSessions, reviews, availability, users } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, ne } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@/lib/db/schema";

type Database = NodePgDatabase<typeof schema>;

/**
 * Calculate mentor utilization percentage
 * Utilization = (booked sessions / available slots) * 100
 * 
 * @param mentorId - Mentor ID
 * @param days - Number of days to look back (default: 30)
 * @returns Utilization percentage (0-100)
 */
export async function calculateMentorUtilization(
  mentorId: string,
  days: number = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get total available slots in the time period
  const availableSlots = await db
    .select({
      total: sql<number>`COALESCE(SUM(${availability.capacity}), 0)`,
    })
    .from(availability)
    .where(
      and(
        eq(availability.mentorId, mentorId),
        gte(availability.startsAt, cutoffDate)
      )
    );

  const totalAvailable = Number(availableSlots[0]?.total || 0);

  // Get booked sessions in the time period
  const bookedSessions = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(officeSessions)
    .where(
      and(
        eq(officeSessions.mentorId, mentorId),
        gte(officeSessions.startsAt, cutoffDate),
        sql`${officeSessions.status} IN ('scheduled', 'completed')`
      )
    );

  const totalBooked = Number(bookedSessions[0]?.count || 0);

  // Calculate utilization percentage
  if (totalAvailable === 0) {
    return 0;
  }

  return Math.round((totalBooked / totalAvailable) * 100 * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate average feedback rating for a mentor
 * 
 * @param mentorId - Mentor ID
 * @param days - Number of days to look back (default: 90)
 * @returns Average rating (0-5), or null if no reviews
 */
export async function calculateAvgFeedback(
  mentorId: string,
  days: number = 90
): Promise<number | null> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const avgRating = await db
    .select({
      avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.mentorId, mentorId),
        gte(reviews.createdAt, cutoffDate)
      )
    );

  const avg = Number(avgRating[0]?.avg || 0);

  // Return null if no reviews (avg would be 0)
  if (avg === 0) {
    // Check if there are actually any reviews
    const reviewCount = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.mentorId, mentorId),
          gte(reviews.createdAt, cutoffDate)
        )
      );

    if (Number(reviewCount[0]?.count || 0) === 0) {
      return null;
    }
  }

  return Math.round(avg * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate utilization rate for a single mentor within a date range
 * Used by admin routes
 */
export async function calculateUtilizationRate(
  dbInstance: Database,
  mentorId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Get total available slots in the time period
  const availableSlots = await dbInstance
    .select({
      total: sql<number>`COALESCE(SUM(${availability.capacity}), 0)`,
    })
    .from(availability)
    .where(
      and(
        eq(availability.mentorId, mentorId),
        gte(availability.startsAt, startDate),
        lte(availability.startsAt, endDate)
      )
    );

  const totalAvailable = Number(availableSlots[0]?.total || 0);

  // Get booked sessions in the time period
  const bookedSessions = await dbInstance
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(officeSessions)
    .where(
      and(
        eq(officeSessions.mentorId, mentorId),
        gte(officeSessions.startsAt, startDate),
        lte(officeSessions.startsAt, endDate),
        sql`${officeSessions.status} IN ('scheduled', 'completed')`
      )
    );

  const totalBooked = Number(bookedSessions[0]?.count || 0);

  // Calculate utilization percentage
  if (totalAvailable === 0) {
    return 0;
  }

  return Math.round((totalBooked / totalAvailable) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate utilization for all mentors
 */
export async function calculateAllMentorUtilization(
  dbInstance: Database,
  startDate: Date,
  endDate: Date
): Promise<
  Array<{
    mentorId: string;
    mentorName: string;
    utilizationRate: number;
    sessionCount: number;
    totalAvailableHours: number;
    bookedHours: number;
  }>
> {
  const allMentors = await dbInstance.query.mentors.findMany({
    with: {
      user: true,
    },
  });

  const utilizationPromises = allMentors.map(async (mentor) => {
    // Get total available slots
    const availableSlots = await dbInstance
      .select({
        total: sql<number>`COALESCE(SUM(${availability.capacity}), 0)`,
      })
      .from(availability)
      .where(
        and(
          eq(availability.mentorId, mentor.id),
          gte(availability.startsAt, startDate),
          lte(availability.startsAt, endDate)
        )
      );

    const totalAvailableHours = Number(availableSlots[0]?.total || 0);

    // Get booked sessions
    const bookedSessions = await dbInstance
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(officeSessions)
      .where(
        and(
          eq(officeSessions.mentorId, mentor.id),
          gte(officeSessions.startsAt, startDate),
          lte(officeSessions.startsAt, endDate),
          sql`${officeSessions.status} IN ('scheduled', 'completed')`
        )
      );

    const bookedHours = Number(bookedSessions[0]?.count || 0);
    const utilizationRate =
      totalAvailableHours > 0
        ? Math.round((bookedHours / totalAvailableHours) * 100 * 100) / 100
        : 0;

    return {
      mentorId: mentor.id,
      mentorName: mentor.user?.name || "Unknown",
      utilizationRate,
      sessionCount: bookedHours,
      totalAvailableHours,
      bookedHours,
    };
  });

  return Promise.all(utilizationPromises);
}

/**
 * Aggregate sessions over time periods
 */
export async function aggregateSessionsOverTime(
  dbInstance: Database,
  startDate: Date,
  endDate: Date,
  groupBy: "day" | "week" | "month" = "day"
): Promise<Array<{ date: string; count: number }>> {
  let dateFormat: string;
  let interval: string;

  switch (groupBy) {
    case "day":
      dateFormat = "YYYY-MM-DD";
      interval = "1 day";
      break;
    case "week":
      dateFormat = "IYYY-IW"; // ISO week format
      interval = "1 week";
      break;
    case "month":
      dateFormat = "YYYY-MM";
      interval = "1 month";
      break;
    default:
      dateFormat = "YYYY-MM-DD";
      interval = "1 day";
  }

  // Use Drizzle query builder with sql.raw for date formatting
  const sessions = await dbInstance
    .select({
      date: sql<string>`TO_CHAR(${officeSessions.startsAt}, ${sql.raw(`'${dateFormat}'`)})`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(officeSessions)
    .where(
      and(
        gte(officeSessions.startsAt, startDate),
        lte(officeSessions.startsAt, endDate),
        ne(officeSessions.status, "cancelled")
      )
    )
    .groupBy(sql`TO_CHAR(${officeSessions.startsAt}, ${sql.raw(`'${dateFormat}'`)})`)
    .orderBy(sql`TO_CHAR(${officeSessions.startsAt}, ${sql.raw(`'${dateFormat}'`)})`);

  return sessions.map((s) => ({
    date: s.date,
    count: Number(s.count || 0),
  }));
}

/**
 * Aggregate feedback distribution
 */
export async function aggregateFeedbackDistribution(
  dbInstance: Database,
  startDate: Date,
  endDate: Date
): Promise<Array<{ rating: number; count: number; percentage: number }>> {
  const distribution = await dbInstance
    .select({
      rating: reviews.rating,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviews)
    .where(
      and(gte(reviews.createdAt, startDate), lte(reviews.createdAt, endDate))
    )
    .groupBy(reviews.rating)
    .orderBy(reviews.rating);

  const total = distribution.reduce((sum, d) => sum + Number(d.count || 0), 0);

  return distribution.map((d) => ({
    rating: Number(d.rating),
    count: Number(d.count || 0),
    percentage: total > 0 ? Math.round((Number(d.count || 0) / total) * 10000) / 100 : 0,
  }));
}

/**
 * Calculate engagement metrics
 */
export async function calculateEngagementMetrics(
  dbInstance: Database,
  startDate: Date,
  endDate: Date
): Promise<{
  averageSessionsPerMentor: number;
  averageSessionsPerMentee: number;
  repeatMenteeRate: number;
  mentorRetentionRate: number;
}> {
  // Average sessions per mentor
  const mentorSessions = await dbInstance
    .select({
      mentorId: officeSessions.mentorId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(officeSessions)
    .where(
      and(
        gte(officeSessions.startsAt, startDate),
        lte(officeSessions.startsAt, endDate),
        ne(officeSessions.status, "cancelled")
      )
    )
    .groupBy(officeSessions.mentorId);

  const uniqueMentors = mentorSessions.length;
  const totalMentorSessions = mentorSessions.reduce(
    (sum, m) => sum + Number(m.count || 0),
    0
  );
  const averageSessionsPerMentor =
    uniqueMentors > 0 ? Math.round((totalMentorSessions / uniqueMentors) * 100) / 100 : 0;

  // Average sessions per mentee
  const menteeSessions = await dbInstance
    .select({
      menteeId: officeSessions.menteeId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(officeSessions)
    .where(
      and(
        gte(officeSessions.startsAt, startDate),
        lte(officeSessions.startsAt, endDate),
        ne(officeSessions.status, "cancelled")
      )
    )
    .groupBy(officeSessions.menteeId);

  const uniqueMentees = menteeSessions.length;
  const totalMenteeSessions = menteeSessions.reduce(
    (sum, m) => sum + Number(m.count || 0),
    0
  );
  const averageSessionsPerMentee =
    uniqueMentees > 0 ? Math.round((totalMenteeSessions / uniqueMentees) * 100) / 100 : 0;

  // Repeat mentee rate (mentees with more than 1 session)
  const repeatMentees = menteeSessions.filter((m) => Number(m.count || 0) > 1).length;
  const repeatMenteeRate =
    uniqueMentees > 0 ? Math.round((repeatMentees / uniqueMentees) * 10000) / 100 : 0;

  // Mentor retention rate (mentors with sessions in both first and second half of period)
  const periodMidpoint = new Date(
    startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2
  );
  const firstHalfMentors = await dbInstance
    .select({
      mentorId: officeSessions.mentorId,
    })
    .from(officeSessions)
    .where(
      and(
        gte(officeSessions.startsAt, startDate),
        lte(officeSessions.startsAt, periodMidpoint),
        ne(officeSessions.status, "cancelled")
      )
    )
    .groupBy(officeSessions.mentorId);

  const secondHalfMentors = await dbInstance
    .select({
      mentorId: officeSessions.mentorId,
    })
    .from(officeSessions)
    .where(
      and(
        gte(officeSessions.startsAt, periodMidpoint),
        lte(officeSessions.startsAt, endDate),
        ne(officeSessions.status, "cancelled")
      )
    )
    .groupBy(officeSessions.mentorId);

  const firstHalfMentorIds = new Set(firstHalfMentors.map((m) => m.mentorId));
  const secondHalfMentorIds = new Set(secondHalfMentors.map((m) => m.mentorId));
  const retainedMentors = Array.from(firstHalfMentorIds).filter((id) =>
    secondHalfMentorIds.has(id)
  ).length;
  const mentorRetentionRate =
    firstHalfMentorIds.size > 0
      ? Math.round((retainedMentors / firstHalfMentorIds.size) * 10000) / 100
      : 0;

  return {
    averageSessionsPerMentor,
    averageSessionsPerMentee,
    repeatMenteeRate,
    mentorRetentionRate,
  };
}
