/**
 * Analytics utilities for computing mentor metrics
 * Used for syncing computed fields to Airtable
 */

import { db } from "@/lib/db";
import { mentors, officeSessions, reviews, availability } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

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
