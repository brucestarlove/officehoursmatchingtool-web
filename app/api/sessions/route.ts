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
import { checkAvailabilityConflict } from "@/lib/utils/availability";
import { z } from "zod";

const bookingSchema = z.object({
  mentorId: z.string().uuid(),
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

    // Verify mentor exists
    const mentor = await db.query.mentors.findFirst({
      where: eq(mentors.id, validated.mentorId),
    });

    if (!mentor) {
      return createNotFoundResponse("Mentor");
    }

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

    // Check availability
    const hasConflict = await checkAvailabilityConflict(
      validated.mentorId,
      startTime,
      endTime
    );

    if (hasConflict) {
      return createErrorResponse(
        new Error("Time slot is not available or conflicts with existing booking"),
        409
      );
    }

    // Generate meeting URL (placeholder)
    const meetingUrl =
      validated.meetingType === "video"
        ? `https://meet.example.com/${crypto.randomUUID()}`
        : undefined;

    // Create session
    const [newSession] = await db
      .insert(officeSessions)
      .values({
        mentorId: validated.mentorId,
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

    // Fetch full session with relations
    const sessionWithRelations = await db.query.officeSessions.findFirst({
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

    if (!sessionWithRelations) {
      return createErrorResponse(new Error("Failed to create session"), 500);
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

    return NextResponse.json({
      session: sessionResponse,
      calendarEvent: {
        icsUrl: calendarEventUrl,
      },
    } as BookingResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(error, 400);
    }
    return createErrorResponse(error);
  }
}

