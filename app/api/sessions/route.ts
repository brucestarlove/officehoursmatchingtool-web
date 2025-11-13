/**
 * GET /api/sessions - List sessions
 * POST /api/sessions - Book a session
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAuth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import {
  officeSessions,
  mentors,
  mentees,
  users,
  availability,
} from "@/lib/db/schema";
import { eq, and, or, gte, lte, sql } from "drizzle-orm";
import {
  createErrorResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
} from "@/lib/utils/api-errors";
import type {
  BookingRequest,
  BookingResponse,
  SessionsListResponse,
  Session,
} from "@/types";
import type { SessionStatus } from "@/lib/constants/sessions";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/sessions";
import {
  checkAvailabilityConflict,
  checkSlotExistsInAvailability,
} from "@/lib/utils/availability";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const bookingSchema = z.object({
  mentorId: z.string(), // Can be UUID or email prefix
  menteeId: z.string().uuid(),
  startTime: z.string().datetime(),
  duration: z.number().int().min(15).max(120),
  meetingType: z.enum(["video", "in-person"]),
  goals: z.string().optional(),
});

// GET handler - List sessions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const sort = searchParams.get("sort") || "date";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(
      searchParams.get("limit") || String(DEFAULT_PAGE_SIZE),
      10
    );

    // Build conditions
    const conditions = [];

    // Filter by user participation (mentor or mentee)
    const mentorProfile = await db.query.mentors.findFirst({
      where: eq(mentors.userId, user.id),
    });
    const menteeProfile = await db.query.mentees.findFirst({
      where: eq(mentees.userId, user.id),
    });

    if (mentorProfile && menteeProfile) {
      // User is both mentor and mentee
      conditions.push(
        or(
          eq(officeSessions.mentorId, mentorProfile.id),
          eq(officeSessions.menteeId, menteeProfile.id)
        )!
      );
    } else if (mentorProfile) {
      conditions.push(eq(officeSessions.mentorId, mentorProfile.id));
    } else if (menteeProfile) {
      conditions.push(eq(officeSessions.menteeId, menteeProfile.id));
    } else {
      // User has no profile - return empty
      return NextResponse.json({
        sessions: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      } as SessionsListResponse);
    }

    // Filter by status
    if (status === "upcoming") {
      conditions.push(
        and(
          eq(officeSessions.status, "scheduled"),
          gte(officeSessions.startsAt, new Date())
        )!
      );
    } else if (status === "past") {
      conditions.push(
        or(
          eq(officeSessions.status, "completed"),
          lte(officeSessions.startsAt, new Date())
        )!
      );
    } else if (status === "cancelled") {
      conditions.push(eq(officeSessions.status, "cancelled"));
    }

    // Fetch sessions
    const sessionRecords = await db.query.officeSessions.findMany({
      where: and(...conditions),
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
      limit: limit + 1,
      offset: (page - 1) * limit,
      orderBy:
        sort === "date"
          ? status === "upcoming"
            ? (sessions, { asc }) => [asc(sessions.startsAt)]
            : (sessions, { desc }) => [desc(sessions.startsAt)]
          : undefined,
    });

    const hasMore = sessionRecords.length > limit;
    const sessionsToReturn = hasMore
      ? sessionRecords.slice(0, limit)
      : sessionRecords;

    const total = hasMore
      ? page * limit + 1
      : (page - 1) * limit + sessionsToReturn.length;
    const totalPages = Math.ceil(total / limit);

    // Map to frontend Session type
    const sessionsResponse: Session[] = sessionsToReturn.map((session) => ({
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
            industries: session.mentor.industry ? [session.mentor.industry] : [],
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
    }));

    return NextResponse.json({
      sessions: sessionsResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    } as SessionsListResponse);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST handler - Book a session
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = bookingSchema.parse(body);

    // Look up mentor - mentorId can be UUID or email prefix
    let mentor;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      validated.mentorId
    );

    if (isUuid) {
      // Direct UUID lookup
      mentor = await db.query.mentors.findFirst({
        where: eq(mentors.id, validated.mentorId),
        with: {
          user: true,
        },
      });
    } else {
      // Email prefix lookup (like in mentors/[id] endpoint)
      const mentorResult = await db
        .select({
          mentor: mentors,
          user: users,
        })
        .from(mentors)
        .innerJoin(users, eq(mentors.userId, users.id))
        .where(
          and(
            eq(mentors.active, true),
            sql`LOWER(SPLIT_PART(${users.email}, '@', 1)) = LOWER(${validated.mentorId})`
          )
        )
        .limit(1);

      if (mentorResult && mentorResult.length > 0) {
        mentor = {
          ...mentorResult[0].mentor,
          user: mentorResult[0].user,
        };
      }
    }

    if (!mentor) {
      logger.warn("Mentor not found", {
        mentorId: validated.mentorId,
        isUuid,
      });
      return createNotFoundResponse("Mentor");
    }

    // Use the actual mentor UUID for database operations
    const actualMentorId = mentor.id;

    // Get mentee profile for current user
    const menteeProfile = await db.query.mentees.findFirst({
      where: eq(mentees.userId, user.id),
    });

    if (!menteeProfile) {
      return createErrorResponse(
        new Error("Mentee profile not found"),
        404
      );
    }

    // Verify menteeId matches
    if (validated.menteeId !== menteeProfile.id) {
      return createErrorResponse(
        new Error("Mentee ID does not match current user"),
        403
      );
    }

    const startTime = new Date(validated.startTime);
    const endTime = new Date(
      startTime.getTime() + validated.duration * 60 * 1000
    );

    // Validate that the time slot exists in mentor's availability
    logger.info("Checking slot availability", {
      mentorId: actualMentorId,
      mentorIdInput: validated.mentorId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: validated.duration,
    });

    let slotExists = false;
    try {
      slotExists = await checkSlotExistsInAvailability(
        actualMentorId,
        startTime,
        endTime
      );
    } catch (error) {
      logger.error("Error checking slot availability", error, {
        mentorId: actualMentorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      return createErrorResponse(
        new Error("Failed to verify slot availability. Please try again."),
        500
      );
    }

    if (!slotExists) {
      logger.warn("Slot does not exist in availability", {
        mentorId: actualMentorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      return createErrorResponse(
        new Error(
          "The selected time slot is not available. Please choose a different time."
        ),
        409
      );
    }

    // Check for conflicts with existing bookings
    let hasConflict = false;
    try {
      hasConflict = await checkAvailabilityConflict(
        actualMentorId,
        startTime,
        endTime
      );
    } catch (error) {
      logger.error("Error checking availability conflict", error, {
        mentorId: actualMentorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      return createErrorResponse(
        new Error("Failed to check for booking conflicts. Please try again."),
        500
      );
    }

    if (hasConflict) {
      logger.warn("Booking conflict detected", {
        mentorId: actualMentorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      return createErrorResponse(
        new Error(
          "This time slot has already been booked. Please select another time."
        ),
        409
      );
    }

    // Generate meeting URL (placeholder)
    const meetingUrl =
      validated.meetingType === "video"
        ? `https://meet.example.com/${crypto.randomUUID()}`
        : undefined;

    // Create session
    logger.info("Creating session", {
      mentorId: actualMentorId,
      mentorIdInput: validated.mentorId,
      menteeId: validated.menteeId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });

    let newSession;
    try {
      [newSession] = await db
        .insert(officeSessions)
        .values({
          mentorId: actualMentorId,
          menteeId: validated.menteeId,
          startsAt: startTime,
          endsAt: endTime,
          duration: validated.duration,
          status: "scheduled",
          meetingType: validated.meetingType,
          meetingUrl: meetingUrl,
          goals: validated.goals || null,
        })
        .returning();
    } catch (error) {
      logger.error("Error creating session", error, {
        mentorId: actualMentorId,
        menteeId: validated.menteeId,
        startTime: startTime.toISOString(),
      });
      return createErrorResponse(
        new Error("Failed to create session. Please try again."),
        500
      );
    }

    // Fetch full session with relations
    let sessionWithRelations;
    try {
      sessionWithRelations = await db.query.officeSessions.findFirst({
        where: eq(officeSessions.id, newSession.id),
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
    } catch (error) {
      logger.error("Error fetching created session", error, {
        sessionId: newSession.id,
      });
      return createErrorResponse(
        new Error("Session created but failed to retrieve details. Please refresh."),
        500
      );
    }

    if (!sessionWithRelations) {
      logger.error("Session not found after creation", {
        sessionId: newSession.id,
      });
      return createErrorResponse(
        new Error("Session created but not found. Please refresh."),
        500
      );
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

    // Generate calendar event URL (placeholder)
    const calendarEventUrl = `/api/sessions/${sessionResponse.id}/calendar.ics`;

    logger.info("Session booked successfully", {
      sessionId: sessionResponse.id,
      mentorId: actualMentorId,
      mentorIdInput: validated.mentorId,
      menteeId: validated.menteeId,
    });

    // Send confirmation emails (don't block response if email fails)
    try {
      const { sendSessionConfirmationEmails } = await import("@/lib/email/send");
      await sendSessionConfirmationEmails(sessionResponse);
    } catch (emailError) {
      logger.error("Failed to send confirmation emails", emailError, {
        sessionId: sessionResponse.id,
      });
      // Continue - email failure shouldn't break the booking
    }

    return NextResponse.json({
      session: sessionResponse,
      calendarEvent: {
        icsUrl: calendarEventUrl,
      },
    } as BookingResponse);
  } catch (error) {
    try {
      const user = await getCurrentUser();
      logger.error("Unexpected error in booking endpoint", error, {
        userId: user?.id,
      });
    } catch {
      logger.error("Unexpected error in booking endpoint", error);
    }

    if (error instanceof z.ZodError) {
      return createErrorResponse(error, 400);
    }
    return createErrorResponse(error);
  }
}

