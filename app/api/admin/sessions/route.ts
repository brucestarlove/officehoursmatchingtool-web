/**
 * GET /api/admin/sessions
 * List all sessions with admin filtering and pagination
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { officeSessions } from "@/lib/db/schema";
import { and, eq, gte, lte, or, desc, asc, sql } from "drizzle-orm";
import { createErrorResponse } from "@/lib/utils/api-errors";
import type { Session } from "@/types";
import { DEFAULT_PAGE_SIZE, type SessionStatus } from "@/lib/constants/sessions";

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as SessionStatus | null;
    const mentorId = searchParams.get("mentorId");
    const menteeId = searchParams.get("menteeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sort = searchParams.get("sort") || "date";
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10);

    // Build filter conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(officeSessions.status, status));
    }

    if (mentorId) {
      conditions.push(eq(officeSessions.mentorId, mentorId));
    }

    if (menteeId) {
      conditions.push(eq(officeSessions.menteeId, menteeId));
    }

    if (startDate) {
      conditions.push(gte(officeSessions.startsAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(officeSessions.startsAt, new Date(endDate)));
    }

    // Determine sort order
    const sortOrder = order === "asc" ? asc : desc;
    let orderBy;

    switch (sort) {
      case "date":
        orderBy = [sortOrder(officeSessions.startsAt)];
        break;
      case "mentor":
        orderBy = [sortOrder(officeSessions.mentorId)];
        break;
      case "mentee":
        orderBy = [sortOrder(officeSessions.menteeId)];
        break;
      case "status":
        orderBy = [sortOrder(officeSessions.status)];
        break;
      default:
        orderBy = [desc(officeSessions.startsAt)];
    }

    // Get total count for pagination
    const totalResult = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(officeSessions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    // Fetch sessions with relations
    const sessionRecords = await db.query.officeSessions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
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
        reviews: true,
      },
      limit: limit + 1,
      offset: (page - 1) * limit,
      orderBy: orderBy as any,
    });

    const hasMore = sessionRecords.length > limit;
    const sessionsToReturn = hasMore ? sessionRecords.slice(0, limit) : sessionRecords;
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
            rating:
              session.reviews && session.reviews.length > 0
                ? session.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  session.reviews.length
                : undefined,
            reviewCount: session.reviews?.length || 0,
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
        hasMore,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

