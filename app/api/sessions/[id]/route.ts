/**
 * GET /api/sessions/[id] - Get session details
 * PUT /api/sessions/[id] - Reschedule session
 * DELETE /api/sessions/[id] - Cancel session
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAuth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import {
  officeSessions,
  mentors,
  mentees,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createErrorResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
  createForbiddenResponse,
} from "@/lib/utils/api-errors";
import type { Session } from "@/types";
import type { SessionStatus } from "@/lib/constants/sessions";
import {
  checkAvailabilityConflict,
  checkSlotExistsInAvailability,
} from "@/lib/utils/availability";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const rescheduleSchema = z.object({
  startTime: z.string().datetime(),
});

// GET handler - Get session details
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

    // Fetch session
    const session = await db.query.officeSessions.findFirst({
      where: eq(officeSessions.id, id),
      with: {
        mentor: {
          with: {
            user: true,
          },
        },
        mentee: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!session) {
      return createNotFoundResponse("Session");
    }

    // Verify user is participant
    const mentorProfile = await db.query.mentors.findFirst({
      where: eq(mentors.userId, user.id),
    });
    const menteeProfile = await db.query.mentees.findFirst({
      where: eq(mentees.userId, user.id),
    });

    const isParticipant =
      (mentorProfile && session.mentorId === mentorProfile.id) ||
      (menteeProfile && session.menteeId === menteeProfile.id);

    if (!isParticipant) {
      return createForbiddenResponse("You are not authorized to view this session");
    }

    // Map to frontend Session type
    const sessionResponse: Session = {
      id: session.id,
      mentorId: session.mentorId,
      menteeId: session.menteeId,
      mentor: session.mentor
        ? {
            id: session.mentor.id,
            userId: session.mentor.userId,
            name: session.mentor.user?.name || "Unknown",
            email: session.mentor.user?.email || "",
            expertise: [],
            industries: session.mentor.industry
              ? [session.mentor.industry]
              : [],
            company: session.mentor.company || undefined,
            title: session.mentor.title || undefined,
            profilePhoto: session.mentor.photoUrl || undefined,
            createdAt: session.mentor.createdAt.toISOString(),
            updatedAt: session.mentor.updatedAt.toISOString(),
          }
        : undefined,
      mentee: session.mentee
        ? {
            id: session.mentee.id,
            userId: session.mentee.userId,
            name: session.mentee.user?.name || "Unknown",
            email: session.mentee.user?.email || "",
            goals: session.mentee.goals ? [session.mentee.goals] : [],
            interests: [],
            createdAt: session.mentee.createdAt.toISOString(),
            updatedAt: session.mentee.updatedAt.toISOString(),
          }
        : undefined,
      startTime: session.startsAt.toISOString(),
      duration: session.duration,
      meetingType: session.meetingType as "video" | "in-person",
      meetingLink: session.meetingUrl || undefined,
      goals: session.goals || undefined,
      status: session.status as SessionStatus,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };

    return NextResponse.json(sessionResponse);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT handler - Reschedule session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const validated = rescheduleSchema.parse(body);

    // Fetch session
    const session = await db.query.officeSessions.findFirst({
      where: eq(officeSessions.id, id),
    });

    if (!session) {
      return createNotFoundResponse("Session");
    }

    // Verify user is participant
    const mentorProfile = await db.query.mentors.findFirst({
      where: eq(mentors.userId, user.id),
    });
    const menteeProfile = await db.query.mentees.findFirst({
      where: eq(mentees.userId, user.id),
    });

    const isParticipant =
      (mentorProfile && session.mentorId === mentorProfile.id) ||
      (menteeProfile && session.menteeId === menteeProfile.id);

    if (!isParticipant) {
      return createForbiddenResponse(
        "You are not authorized to reschedule this session"
      );
    }

    // Verify session can be rescheduled
    if (session.status !== "scheduled") {
      return createErrorResponse(
        new Error("Only scheduled sessions can be rescheduled"),
        400
      );
    }

    const newStartTime = new Date(validated.startTime);
    const newEndTime = new Date(
      newStartTime.getTime() + session.duration * 60 * 1000
    );

    logger.info("Rescheduling session", {
      sessionId: id,
      mentorId: session.mentorId,
      oldStartTime: session.startsAt.toISOString(),
      newStartTime: newStartTime.toISOString(),
    });

    // Validate that the new time slot exists in mentor's availability
    let slotExists = false;
    try {
      slotExists = await checkSlotExistsInAvailability(
        session.mentorId,
        newStartTime,
        newEndTime
      );
    } catch (error) {
      logger.error("Error checking slot availability for reschedule", error, {
        sessionId: id,
        mentorId: session.mentorId,
        newStartTime: newStartTime.toISOString(),
      });
      return createErrorResponse(
        new Error("Failed to verify slot availability. Please try again."),
        500
      );
    }

    if (!slotExists) {
      logger.warn("Slot does not exist in availability for reschedule", {
        sessionId: id,
        mentorId: session.mentorId,
        newStartTime: newStartTime.toISOString(),
      });
      return createErrorResponse(
        new Error(
          "The selected time slot is not available. Please choose a different time."
        ),
        409
      );
    }

    // Check for conflicts with existing bookings (excluding current session)
    let hasConflict = false;
    try {
      hasConflict = await checkAvailabilityConflict(
        session.mentorId,
        newStartTime,
        newEndTime,
        id // Exclude current session from conflict check
      );
    } catch (error) {
      logger.error("Error checking availability conflict for reschedule", error, {
        sessionId: id,
        mentorId: session.mentorId,
        newStartTime: newStartTime.toISOString(),
      });
      return createErrorResponse(
        new Error("Failed to check for booking conflicts. Please try again."),
        500
      );
    }

    if (hasConflict) {
      logger.warn("Reschedule conflict detected", {
        sessionId: id,
        mentorId: session.mentorId,
        newStartTime: newStartTime.toISOString(),
      });
      return createErrorResponse(
        new Error(
          "This time slot has already been booked. Please select another time."
        ),
        409
      );
    }

    // Store old start time for email notification
    const oldStartTime = session.startsAt.toISOString();

    // Update session
    const [updatedSession] = await db
      .update(officeSessions)
      .set({
        startsAt: newStartTime,
        endsAt: newEndTime,
        status: "rescheduled",
        updatedAt: new Date(),
      })
      .where(eq(officeSessions.id, id))
      .returning();

    // Fetch full session with relations
    const sessionWithRelations = await db.query.officeSessions.findFirst({
      where: eq(officeSessions.id, updatedSession.id),
      with: {
        mentor: {
          with: {
            user: true,
          },
        },
        mentee: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!sessionWithRelations) {
      return createErrorResponse(new Error("Failed to update session"), 500);
    }

    // Map to frontend Session type
    const sessionResponse: Session = {
      id: sessionWithRelations.id,
      mentorId: sessionWithRelations.mentorId,
      menteeId: sessionWithRelations.menteeId,
      mentor: sessionWithRelations.mentor
        ? {
            id: sessionWithRelations.mentor.id,
            userId: sessionWithRelations.mentor.userId,
            name: sessionWithRelations.mentor.user?.name || "Unknown",
            email: sessionWithRelations.mentor.user?.email || "",
            expertise: [],
            industries: sessionWithRelations.mentor.industry
              ? [sessionWithRelations.mentor.industry]
              : [],
            company: sessionWithRelations.mentor.company || undefined,
            title: sessionWithRelations.mentor.title || undefined,
            profilePhoto: sessionWithRelations.mentor.photoUrl || undefined,
            createdAt: sessionWithRelations.mentor.createdAt.toISOString(),
            updatedAt: sessionWithRelations.mentor.updatedAt.toISOString(),
          }
        : undefined,
      mentee: sessionWithRelations.mentee
        ? {
            id: sessionWithRelations.mentee.id,
            userId: sessionWithRelations.mentee.userId,
            name: sessionWithRelations.mentee.user?.name || "Unknown",
            email: sessionWithRelations.mentee.user?.email || "",
            goals: sessionWithRelations.mentee.goals
              ? [sessionWithRelations.mentee.goals]
              : [],
            interests: [],
            createdAt: sessionWithRelations.mentee.createdAt.toISOString(),
            updatedAt: sessionWithRelations.mentee.updatedAt.toISOString(),
          }
        : undefined,
      startTime: sessionWithRelations.startsAt.toISOString(),
      duration: sessionWithRelations.duration,
      meetingType: sessionWithRelations.meetingType as "video" | "in-person",
      meetingLink: sessionWithRelations.meetingUrl || undefined,
      goals: sessionWithRelations.goals || undefined,
      status: sessionWithRelations.status as Session["status"],
      createdAt: sessionWithRelations.createdAt.toISOString(),
      updatedAt: sessionWithRelations.updatedAt.toISOString(),
    };

    // Send reschedule emails (don't block response if email fails)
    try {
      const { sendSessionRescheduledEmails } = await import("@/lib/email/send");
      await sendSessionRescheduledEmails(sessionResponse, oldStartTime);
    } catch (emailError) {
      logger.error("Failed to send reschedule emails", emailError, {
        sessionId: id,
      });
      // Continue - email failure shouldn't break the reschedule
    }

    return NextResponse.json(sessionResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(error, 400);
    }
    return createErrorResponse(error);
  }
}

// DELETE handler - Cancel session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Fetch session
    const session = await db.query.officeSessions.findFirst({
      where: eq(officeSessions.id, id),
    });

    if (!session) {
      return createNotFoundResponse("Session");
    }

    // Verify user is participant
    const mentorProfile = await db.query.mentors.findFirst({
      where: eq(mentors.userId, user.id),
    });
    const menteeProfile = await db.query.mentees.findFirst({
      where: eq(mentees.userId, user.id),
    });

    const isParticipant =
      (mentorProfile && session.mentorId === mentorProfile.id) ||
      (menteeProfile && session.menteeId === menteeProfile.id);

    if (!isParticipant) {
      return createForbiddenResponse(
        "You are not authorized to cancel this session"
      );
    }

    // Determine who cancelled the session
    const cancelledBy: "mentor" | "mentee" =
      mentorProfile && session.mentorId === mentorProfile.id ? "mentor" : "mentee";

    // Fetch full session with relations before cancelling (for email)
    const sessionWithRelations = await db.query.officeSessions.findFirst({
      where: eq(officeSessions.id, id),
      with: {
        mentor: {
          with: {
            user: true,
          },
        },
        mentee: {
          with: {
            user: true,
          },
        },
      },
    });

    // Update session status to cancelled
    await db
      .update(officeSessions)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(officeSessions.id, id));

    // Send cancellation emails (don't block response if email fails)
    if (sessionWithRelations) {
      try {
        const sessionResponse: Session = {
          id: sessionWithRelations.id,
          mentorId: sessionWithRelations.mentorId,
          menteeId: sessionWithRelations.menteeId,
          mentor: sessionWithRelations.mentor
            ? {
                id: sessionWithRelations.mentor.id,
                userId: sessionWithRelations.mentor.userId,
                name: sessionWithRelations.mentor.user?.name || "Unknown",
                email: sessionWithRelations.mentor.user?.email || "",
                expertise: [],
                industries: sessionWithRelations.mentor.industry
                  ? [sessionWithRelations.mentor.industry]
                  : [],
                company: sessionWithRelations.mentor.company || undefined,
                title: sessionWithRelations.mentor.title || undefined,
                profilePhoto: sessionWithRelations.mentor.photoUrl || undefined,
                createdAt: sessionWithRelations.mentor.createdAt.toISOString(),
                updatedAt: sessionWithRelations.mentor.updatedAt.toISOString(),
              }
            : undefined,
          mentee: sessionWithRelations.mentee
            ? {
                id: sessionWithRelations.mentee.id,
                userId: sessionWithRelations.mentee.userId,
                name: sessionWithRelations.mentee.user?.name || "Unknown",
                email: sessionWithRelations.mentee.user?.email || "",
                goals: sessionWithRelations.mentee.goals
                  ? [sessionWithRelations.mentee.goals]
                  : [],
                interests: [],
                createdAt: sessionWithRelations.mentee.createdAt.toISOString(),
                updatedAt: sessionWithRelations.mentee.updatedAt.toISOString(),
              }
            : undefined,
          startTime: sessionWithRelations.startsAt.toISOString(),
          duration: sessionWithRelations.duration,
          meetingType: sessionWithRelations.meetingType as "video" | "in-person",
          meetingLink: sessionWithRelations.meetingUrl || undefined,
          goals: sessionWithRelations.goals || undefined,
          status: "cancelled" as Session["status"],
          createdAt: sessionWithRelations.createdAt.toISOString(),
          updatedAt: sessionWithRelations.updatedAt.toISOString(),
        };

        const { sendSessionCancelledEmails } = await import("@/lib/email/send");
        await sendSessionCancelledEmails(sessionResponse, cancelledBy);
      } catch (emailError) {
        logger.error("Failed to send cancellation emails", emailError, {
          sessionId: id,
        });
        // Continue - email failure shouldn't break the cancellation
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

