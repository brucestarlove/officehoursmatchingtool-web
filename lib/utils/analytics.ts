/**
 * Analytics aggregation utilities
 * Functions for calculating platform metrics and trends
 */

import { sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { officeSessions, availability, reviews, mentors } from "@/lib/db/schema";
import type { db } from "@/lib/db";

type GroupByPeriod = "day" | "week" | "month";

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface MentorUtilization {
  mentorId: string;
  mentorName: string;
  totalAvailableHours: number;
  bookedHours: number;
  utilizationRate: number;
  sessionCount: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

/**
 * Aggregate sessions over time by period
 */
export async function aggregateSessionsOverTime(
  dbInstance: typeof db,
  startDate: Date,
  endDate: Date,
  groupBy: GroupByPeriod = "day"
): Promise<TimeSeriesData[]> {
  let dateFormat: string;
  let dateTrunc: string;

  switch (groupBy) {
    case "day":
      dateFormat = "YYYY-MM-DD";
      dateTrunc = "day";
      break;
    case "week":
      dateFormat = "YYYY-\"W\"WW";
      dateTrunc = "week";
      break;
    case "month":
      dateFormat = "YYYY-MM";
      dateTrunc = "month";
      break;
    default:
      dateFormat = "YYYY-MM-DD";
      dateTrunc = "day";
  }

  const result = await dbInstance
    .select({
      date: sql<string>`TO_CHAR(DATE_TRUNC(${sql.raw(`'${dateTrunc}'`)}, ${officeSessions.startsAt}), ${sql.raw(`'${dateFormat}'`)})`,
      value: sql<number>`COUNT(*)::int`,
    })
    .from(officeSessions)
    .where(
      sql`${officeSessions.startsAt} >= ${startDate} AND ${officeSessions.startsAt} <= ${endDate}`
    )
    .groupBy(sql`DATE_TRUNC(${sql.raw(`'${dateTrunc}'`)}, ${officeSessions.startsAt})`)
    .orderBy(sql`DATE_TRUNC(${sql.raw(`'${dateTrunc}'`)}, ${officeSessions.startsAt})`);

  return result.map((row) => ({
    date: row.date,
    value: row.value,
  }));
}

/**
 * Calculate mentor utilization rate
 * Utilization = (booked hours / available hours) * 100
 */
export async function calculateUtilizationRate(
  dbInstance: typeof db,
  mentorId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Calculate booked hours from sessions
  const bookedHoursResult = await dbInstance
    .select({
      totalMinutes: sql<number>`COALESCE(SUM(${officeSessions.duration}), 0)::int`,
    })
    .from(officeSessions)
    .where(
      sql`${officeSessions.mentorId} = ${mentorId} 
          AND ${officeSessions.startsAt} >= ${startDate} 
          AND ${officeSessions.startsAt} <= ${endDate}
          AND ${officeSessions.status} != 'cancelled'`
    );

  const bookedMinutes = bookedHoursResult[0]?.totalMinutes || 0;
  const bookedHours = bookedMinutes / 60;

  // Calculate available hours from availability table
  const availableHoursResult = await dbInstance
    .select({
      totalMinutes: sql<number>`COALESCE(
        SUM(EXTRACT(EPOCH FROM (${availability.endsAt} - ${availability.startsAt})) / 60), 
        0
      )::int`,
    })
    .from(availability)
    .where(
      sql`${availability.mentorId} = ${mentorId} 
          AND ${availability.startsAt} >= ${startDate} 
          AND ${availability.endsAt} <= ${endDate}`
    );

  const availableMinutes = availableHoursResult[0]?.totalMinutes || 0;
  const availableHours = availableMinutes / 60;

  if (availableHours === 0) {
    return 0;
  }

  return Math.round((bookedHours / availableHours) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate utilization for all mentors
 */
export async function calculateAllMentorUtilization(
  dbInstance: typeof db,
  startDate: Date,
  endDate: Date
): Promise<MentorUtilization[]> {
  // Get all mentors with their user info
  const allMentors = await dbInstance.query.mentors.findMany({
    with: {
      user: true,
    },
  });

  // Get booked hours per mentor
  const bookedData = await dbInstance
    .select({
      mentorId: officeSessions.mentorId,
      bookedMinutes: sql<number>`COALESCE(SUM(${officeSessions.duration}), 0)::int`,
      sessionCount: sql<number>`COUNT(*)::int`,
    })
    .from(officeSessions)
    .where(
      sql`${officeSessions.startsAt} >= ${startDate} 
          AND ${officeSessions.startsAt} <= ${endDate}
          AND ${officeSessions.status} != 'cancelled'`
    )
    .groupBy(officeSessions.mentorId);

  // Get available hours per mentor
  const availabilityData = await dbInstance
    .select({
      mentorId: availability.mentorId,
      availableMinutes: sql<number>`COALESCE(
        SUM(EXTRACT(EPOCH FROM (${availability.endsAt} - ${availability.startsAt})) / 60), 
        0
      )::int`,
    })
    .from(availability)
    .where(
      sql`${availability.startsAt} >= ${startDate} 
          AND ${availability.endsAt} <= ${endDate}`
    )
    .groupBy(availability.mentorId);

  const bookedMap = new Map(
    bookedData.map((b) => [b.mentorId, { minutes: b.bookedMinutes, count: b.sessionCount }])
  );
  const availabilityMap = new Map(
    availabilityData.map((a) => [a.mentorId, a.availableMinutes / 60])
  );

  return allMentors.map((mentor) => {
    const booked = bookedMap.get(mentor.id) || { minutes: 0, count: 0 };
    const bookedHours = booked.minutes / 60;
    const availableHours = availabilityMap.get(mentor.id) || 0;
    const utilizationRate =
      availableHours > 0 ? Math.round((bookedHours / availableHours) * 100 * 100) / 100 : 0;

    return {
      mentorId: mentor.id,
      mentorName: mentor.user?.name || "Unknown",
      totalAvailableHours: availableHours,
      bookedHours: bookedHours,
      utilizationRate: utilizationRate,
      sessionCount: booked.count,
    };
  });
}

/**
 * Aggregate feedback distribution by rating
 */
export async function aggregateFeedbackDistribution(
  dbInstance: typeof db,
  startDate?: Date,
  endDate?: Date
): Promise<RatingDistribution[]> {
  let query = dbInstance
    .select({
      rating: reviews.rating,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviews);

  if (startDate && endDate) {
    query = query.where(
      sql`${reviews.createdAt} >= ${startDate} AND ${reviews.createdAt} <= ${endDate}`
    ) as typeof query;
  }

  const result = await query.groupBy(reviews.rating).orderBy(reviews.rating);

  // Calculate total for percentage
  const total = result.reduce((sum, item) => sum + item.count, 0);

  return result.map((item) => ({
    rating: item.rating,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100 * 100) / 100 : 0,
  }));
}

/**
 * Calculate engagement metrics for mentors and mentees
 */
export interface EngagementMetrics {
  mentorEngagement: {
    high: number; // > 10 sessions
    medium: number; // 5-10 sessions
    low: number; // < 5 sessions
  };
  menteeEngagement: {
    high: number; // > 5 sessions
    medium: number; // 2-5 sessions
    low: number; // < 2 sessions
  };
  powerUsers: {
    mentors: string[];
    mentees: string[];
  };
}

export async function calculateEngagementMetrics(
  dbInstance: typeof db,
  startDate: Date,
  endDate: Date
): Promise<EngagementMetrics> {
  // Mentor engagement
  const mentorSessions = await dbInstance
    .select({
      mentorId: officeSessions.mentorId,
      sessionCount: sql<number>`COUNT(*)::int`,
    })
    .from(officeSessions)
    .where(
      sql`${officeSessions.startsAt} >= ${startDate} 
          AND ${officeSessions.startsAt} <= ${endDate}`
    )
    .groupBy(officeSessions.mentorId);

  let mentorHigh = 0;
  let mentorMedium = 0;
  let mentorLow = 0;
  const powerMentors: string[] = [];

  mentorSessions.forEach((m) => {
    if (m.sessionCount > 10) {
      mentorHigh++;
      powerMentors.push(m.mentorId);
    } else if (m.sessionCount >= 5) {
      mentorMedium++;
    } else {
      mentorLow++;
    }
  });

  // Mentee engagement
  const menteeSessions = await dbInstance
    .select({
      menteeId: officeSessions.menteeId,
      sessionCount: sql<number>`COUNT(*)::int`,
    })
    .from(officeSessions)
    .where(
      sql`${officeSessions.startsAt} >= ${startDate} 
          AND ${officeSessions.startsAt} <= ${endDate}`
    )
    .groupBy(officeSessions.menteeId);

  let menteeHigh = 0;
  let menteeMedium = 0;
  let menteeLow = 0;
  const powerMentees: string[] = [];

  menteeSessions.forEach((m) => {
    if (m.sessionCount > 5) {
      menteeHigh++;
      powerMentees.push(m.menteeId);
    } else if (m.sessionCount >= 2) {
      menteeMedium++;
    } else {
      menteeLow++;
    }
  });

  return {
    mentorEngagement: {
      high: mentorHigh,
      medium: mentorMedium,
      low: mentorLow,
    },
    menteeEngagement: {
      high: menteeHigh,
      medium: menteeMedium,
      low: menteeLow,
    },
    powerUsers: {
      mentors: powerMentors,
      mentees: powerMentees,
    },
  };
}

