/**
 * GET /api/availability/mentor/[id]
 * Get mentor availability
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { availability, officeSessions, mentors, users } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  createErrorResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
} from "@/lib/utils/api-errors";
import { generateTimeSlots } from "@/lib/utils/availability";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Parse date range (default to next 2 weeks)
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date();
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

    // Look up mentor - id can be UUID or email prefix
    let mentor;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      // Direct UUID lookup
      const mentorRecord = await db.query.mentors.findFirst({
        where: and(eq(mentors.id, id), eq(mentors.active, true)),
      });
      if (mentorRecord) {
        mentor = mentorRecord;
      }
    } else {
      // Email prefix lookup (like in mentors/[id] endpoint)
      const mentorResult = await db
        .select({
          mentor: mentors,
        })
        .from(mentors)
        .innerJoin(users, eq(mentors.userId, users.id))
        .where(
          and(
            eq(mentors.active, true),
            sql`LOWER(SPLIT_PART(${users.email}, '@', 1)) = LOWER(${id})`
          )
        )
        .limit(1);

      if (mentorResult && mentorResult.length > 0) {
        mentor = mentorResult[0].mentor;
      }
    }

    if (!mentor) {
      return createNotFoundResponse("Mentor");
    }

    const mentorId = mentor.id;

    // Fetch availability records in date range
    const availabilityRecords = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.mentorId, mentorId),
          gte(availability.endsAt, startDate),
          lte(availability.startsAt, endDate)
        )
      );

    // Fetch booked sessions in date range
    const bookedSessions = await db
      .select()
      .from(officeSessions)
      .where(
        and(
          eq(officeSessions.mentorId, mentorId),
          eq(officeSessions.status, "scheduled"),
          gte(officeSessions.endsAt, startDate),
          lte(officeSessions.startsAt, endDate)
        )
      );

    // Generate time slots
    const { availableSlots, bookedSlots } = generateTimeSlots(
      availabilityRecords.map((a) => ({
        startsAt: a.startsAt,
        endsAt: a.endsAt,
      })),
      bookedSessions.map((s) => ({
        startsAt: s.startsAt,
        endsAt: s.endsAt,
      })),
      startDate,
      endDate
    );

    return NextResponse.json({
      availableSlots,
      bookedSlots,
      timezone: mentor.timezone || "UTC",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

