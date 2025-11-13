/**
 * Availability utilities for checking conflicts and generating time slots
 */

import type { TimeSlot } from "@/types";
import { db } from "@/lib/db";
import { availability, officeSessions } from "@/lib/db/schema";
import { and, eq, gte, lte, or, lt, gt } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

/**
 * Check if a time slot conflicts with existing bookings
 * Returns true if there's a conflict, false if the slot is available
 * 
 * Note: This function assumes the slot exists in availability blocks.
 * Callers should verify availability separately.
 */
export async function checkAvailabilityConflict(
  mentorId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    // Check for overlapping booked sessions
    // A conflict exists if:
    // - Session starts before our end time AND
    // - Session ends after our start time
    const overlappingSessions = await db
      .select()
      .from(officeSessions)
      .where(
        and(
          eq(officeSessions.mentorId, mentorId),
          eq(officeSessions.status, "scheduled"), // Only check scheduled sessions
          lt(officeSessions.startsAt, endTime),
          gt(officeSessions.endsAt, startTime)
        )
      )
      .limit(1);

    const hasConflict = overlappingSessions.length > 0;
    
    if (hasConflict) {
      logger.warn("Availability conflict detected", {
        mentorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        conflictingSessions: overlappingSessions.length,
      });
    }

    return hasConflict;
  } catch (error) {
    logger.error("Error checking availability conflict", error, {
      mentorId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
    // On error, assume conflict to prevent double-booking
    throw error;
  }
}

/**
 * Check if a time slot exists in mentor's availability blocks
 * Returns true if the slot is within an availability block, false otherwise
 */
export async function checkSlotExistsInAvailability(
  mentorId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    // Check if the requested slot is within any availability block
    // The slot must be completely contained within an availability block:
    // - Availability starts at or before our start time AND
    // - Availability ends at or after our end time
    const matchingAvailability = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.mentorId, mentorId),
          lte(availability.startsAt, startTime),
          gte(availability.endsAt, endTime)
        )
      )
      .limit(1);

    return matchingAvailability.length > 0;
  } catch (error) {
    logger.error("Error checking slot availability", error, {
      mentorId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
    throw error;
  }
}

/**
 * Generate time slots from availability records and booked sessions
 */
export function generateTimeSlots(
  availabilityRecords: Array<{
    startsAt: Date;
    endsAt: Date;
  }>,
  bookedSessions: Array<{
    startsAt: Date;
    endsAt: Date;
  }>,
  startDate: Date,
  endDate: Date
): {
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
} {
  const availableSlots: TimeSlot[] = [];
  const bookedSlots: TimeSlot[] = [];

  // Process availability records
  for (const avail of availabilityRecords) {
    // Only include slots within the date range
    if (avail.startsAt >= startDate && avail.startsAt <= endDate) {
      const duration = Math.round(
        (avail.endsAt.getTime() - avail.startsAt.getTime()) / (1000 * 60)
      );

      // Check if this slot is booked
      const isBooked = bookedSessions.some(
        (session) =>
          session.startsAt.getTime() === avail.startsAt.getTime() &&
          session.endsAt.getTime() === avail.endsAt.getTime()
      );

      const slot: TimeSlot = {
        startTime: avail.startsAt.toISOString(),
        endTime: avail.endsAt.toISOString(),
        available: !isBooked,
        duration,
      };

      if (isBooked) {
        bookedSlots.push(slot);
      } else {
        availableSlots.push(slot);
      }
    }
  }

  // Process booked sessions that might not have corresponding availability
  for (const session of bookedSessions) {
    if (session.startsAt >= startDate && session.startsAt <= endDate) {
      const duration = Math.round(
        (session.endsAt.getTime() - session.startsAt.getTime()) / (1000 * 60)
      );

      // Check if we already added this as a booked slot
      const alreadyAdded = bookedSlots.some(
        (slot) => slot.startTime === session.startsAt.toISOString()
      );

      if (!alreadyAdded) {
        bookedSlots.push({
          startTime: session.startsAt.toISOString(),
          endTime: session.endsAt.toISOString(),
          available: false,
          duration,
        });
      }
    }
  }

  // Sort by start time
  availableSlots.sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  bookedSlots.sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return { availableSlots, bookedSlots };
}

/**
 * Check if a specific slot is available (not booked)
 */
export function isSlotAvailable(
  slot: TimeSlot,
  bookedSlots: TimeSlot[]
): boolean {
  return !bookedSlots.some(
    (booked) =>
      booked.startTime === slot.startTime &&
      booked.endTime === slot.endTime
  );
}

