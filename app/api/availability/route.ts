/**
 * POST /api/availability
 * Set mentor availability
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { availability, mentors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createErrorResponse,
  createForbiddenResponse,
  createNotFoundResponse,
} from "@/lib/utils/api-errors";
import { checkAvailabilityConflict } from "@/lib/utils/availability";
import { z } from "zod";

const availabilitySchema = z.object({
  mentorId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Require mentor role
    const user = await requireRole("mentor");

    const body = await request.json();
    const validated = availabilitySchema.parse(body);

    // Verify mentor ID matches current user
    const mentor = await db.query.mentors.findFirst({
      where: and(
        eq(mentors.id, validated.mentorId),
        eq(mentors.userId, user.id)
      ),
    });

    if (!mentor) {
      return createNotFoundResponse("Mentor");
    }

    // Check for conflicts
    const startTime = new Date(validated.startTime);
    const endTime = new Date(validated.endTime);

    if (startTime >= endTime) {
      return createErrorResponse(
        new Error("Start time must be before end time"),
        400
      );
    }

    const hasConflict = await checkAvailabilityConflict(
      validated.mentorId,
      startTime,
      endTime
    );

    if (hasConflict) {
      return createErrorResponse(
        new Error("Availability slot conflicts with existing availability or bookings"),
        409
      );
    }

    // Create availability record
    const [newAvailability] = await db
      .insert(availability)
      .values({
        mentorId: validated.mentorId,
        startsAt: startTime,
        endsAt: endTime,
        location: "virtual", // Default to virtual
      })
      .returning();

    return NextResponse.json({
      id: newAvailability.id,
      mentorId: newAvailability.mentorId,
      startTime: newAvailability.startsAt.toISOString(),
      endTime: newAvailability.endsAt.toISOString(),
      timezone: validated.timezone || mentor.timezone || "UTC",
      createdAt: newAvailability.createdAt.toISOString(),
      updatedAt: newAvailability.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(error, 400);
    }
    return createErrorResponse(error);
  }
}

