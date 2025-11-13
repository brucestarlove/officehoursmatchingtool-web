/**
 * Availability utilities for checking conflicts and generating time slots
 */

import type { TimeSlot } from "@/types";
import { db } from "@/lib/db";
import { availability, officeSessions } from "@/lib/db/schema";
import { and, eq, gte, lte, or, sql } from "drizzle-orm";

/**
 * Check if a time slot conflicts with existing availability or bookings
 */
export async function checkAvailabilityConflict(
  mentorId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  // Check for overlapping availability blocks
  const overlappingAvailability = await db
    .select()
    .from(availability)
    .where(
      and(
        eq(availability.mentorId, mentorId),
        sql`${availability.startsAt} < ${endTime}`,
        sql`${availability.endsAt} > ${startTime}`
      )
    )
    .limit(1);

  if (overlappingAvailability.length > 0) {
    return true; // Conflict found
  }

  // Check for overlapping booked sessions
  const overlappingSessions = await db
    .select()
    .from(officeSessions)
    .where(
      and(
        eq(officeSessions.mentorId, mentorId),
        eq(officeSessions.status, "scheduled"), // Only check scheduled sessions
        sql`${officeSessions.startsAt} < ${endTime}`,
        sql`${officeSessions.endsAt} > ${startTime}`
      )
    )
    .limit(1);

  return overlappingSessions.length > 0; // Conflict if any overlapping sessions
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

