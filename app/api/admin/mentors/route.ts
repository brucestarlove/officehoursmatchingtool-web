/**
 * GET /api/admin/mentors
 * Mentor performance metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { mentors, officeSessions, reviews } from "@/lib/db/schema";
import { sql, gte, and, eq, ne } from "drizzle-orm";
import { createErrorResponse } from "@/lib/utils/api-errors";
import { calculateUtilizationRate } from "@/lib/utils/analytics";

export interface MentorPerformance {
  mentorId: string;
  mentorName: string;
  email: string;
  company?: string;
  title?: string;
  sessionCount: number;
  averageRating: number;
  utilizationRate: number;
  lastActiveDate?: string;
  totalReviews: number;
}

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get("sort") || "sessions";
    const minSessions = searchParams.get("minSessions")
      ? parseInt(searchParams.get("minSessions")!, 10)
      : null;
    const minRating = searchParams.get("minRating")
      ? parseFloat(searchParams.get("minRating")!)
      : null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    // Get all mentors with their user info
    const allMentors = await db.query.mentors.findMany({
      with: {
        user: true,
      },
    });

    // Calculate performance metrics for each mentor
    const performancePromises = allMentors.map(async (mentor) => {
      // Get session count
      const sessionCountResult = await db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(officeSessions)
        .where(
          and(
            eq(officeSessions.mentorId, mentor.id),
            ne(officeSessions.status, "cancelled")
          )
        );

      const sessionCount = sessionCountResult[0]?.count || 0;

      // Get average rating and review count
      const ratingResult = await db
        .select({
          avg: sql<number>`COALESCE(AVG(${reviews.rating})::numeric, 0)`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(reviews)
        .where(eq(reviews.mentorId, mentor.id));

      const averageRating = Number(ratingResult[0]?.avg || 0);
      const totalReviews = ratingResult[0]?.count || 0;

      // Get last active date (most recent session)
      const lastSessionResult = await db
        .select({
          lastActive: sql<Date>`MAX(${officeSessions.startsAt})`,
        })
        .from(officeSessions)
        .where(eq(officeSessions.mentorId, mentor.id));

      const lastActiveDate = lastSessionResult[0]?.lastActive
        ? new Date(lastSessionResult[0].lastActive).toISOString()
        : undefined;

      // Calculate utilization rate (last 30 days)
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const utilizationRate = await calculateUtilizationRate(
        db,
        mentor.id,
        startDate,
        endDate
      );

      return {
        mentorId: mentor.id,
        mentorName: mentor.user?.name || "Unknown",
        email: mentor.user?.email || "",
        company: mentor.company || undefined,
        title: mentor.title || undefined,
        sessionCount,
        averageRating: Math.round(averageRating * 100) / 100,
        utilizationRate,
        lastActiveDate,
        totalReviews,
      } as MentorPerformance;
    });

    let performance = await Promise.all(performancePromises);

    // Apply filters
    if (minSessions !== null) {
      performance = performance.filter((p) => p.sessionCount >= minSessions);
    }

    if (minRating !== null) {
      performance = performance.filter((p) => p.averageRating >= minRating);
    }

    // Sort
    switch (sort) {
      case "sessions":
        performance.sort((a, b) => b.sessionCount - a.sessionCount);
        break;
      case "rating":
        performance.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "utilization":
        performance.sort((a, b) => b.utilizationRate - a.utilizationRate);
        break;
      default:
        performance.sort((a, b) => b.sessionCount - a.sessionCount);
    }

    // Calculate statistics (before pagination)
    const totalMentors = performance.length;
    const stats = {
      totalMentors,
      averageSessions: performance.length > 0
        ? Math.round(
            (performance.reduce((sum, p) => sum + p.sessionCount, 0) / performance.length) * 100
          ) / 100
        : 0,
      averageRating: performance.length > 0
        ? Math.round(
            (performance.reduce((sum, p) => sum + p.averageRating, 0) / performance.length) * 100
          ) / 100
        : 0,
      averageUtilization: performance.length > 0
        ? Math.round(
            (performance.reduce((sum, p) => sum + p.utilizationRate, 0) / performance.length) * 100
          ) / 100
        : 0,
    };

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMentors = performance.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalMentors / limit);

    return NextResponse.json({
      mentors: paginatedMentors,
      statistics: stats,
      pagination: {
        page,
        limit,
        total: totalMentors,
        totalPages,
        hasMore: endIndex < totalMentors,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

