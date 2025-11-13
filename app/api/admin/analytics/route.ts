/**
 * GET /api/admin/analytics
 * Aggregate platform metrics and trends
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { db } from "@/lib/db";
import {
  aggregateSessionsOverTime,
  calculateAllMentorUtilization,
  aggregateFeedbackDistribution,
  calculateEngagementMetrics,
} from "@/lib/utils/analytics";
import { officeSessions, reviews, mentors, mentees } from "@/lib/db/schema";
import { sql, gte, lte, and, eq, ne } from "drizzle-orm";
import { createErrorResponse } from "@/lib/utils/api-errors";

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const groupBy = (searchParams.get("groupBy") || "day") as "day" | "week" | "month";

    // Default to last 30 days if not provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Calculate core metrics
    const [totalSessionsResult, averageFeedbackResult, activeMentorsResult, activeMenteesResult] =
      await Promise.all([
        // Total sessions
        db
          .select({
            count: sql<number>`COUNT(*)::int`,
          })
          .from(officeSessions)
          .where(
            and(
              gte(officeSessions.startsAt, startDate),
              lte(officeSessions.startsAt, endDate)
            )
          ),

        // Average feedback score
        db
          .select({
            avg: sql<number>`COALESCE(AVG(${reviews.rating})::numeric, 0)`,
          })
          .from(reviews)
          .where(
            and(gte(reviews.createdAt, startDate), lte(reviews.createdAt, endDate))
          ),

        // Active mentors (mentors with at least one session)
        db
          .select({
            count: sql<number>`COUNT(DISTINCT ${officeSessions.mentorId})::int`,
          })
          .from(officeSessions)
          .where(
            and(
              gte(officeSessions.startsAt, startDate),
              lte(officeSessions.startsAt, endDate),
              ne(officeSessions.status, "cancelled")
            )
          ),

        // Active mentees (mentees with at least one session)
        db
          .select({
            count: sql<number>`COUNT(DISTINCT ${officeSessions.menteeId})::int`,
          })
          .from(officeSessions)
          .where(
            and(
              gte(officeSessions.startsAt, startDate),
              lte(officeSessions.startsAt, endDate),
              ne(officeSessions.status, "cancelled")
            )
          ),
      ]);

    const totalSessions = totalSessionsResult[0]?.count || 0;
    const averageFeedback = Number(averageFeedbackResult[0]?.avg || 0);
    const activeMentors = activeMentorsResult[0]?.count || 0;
    const activeMentees = activeMenteesResult[0]?.count || 0;

    // Calculate overall utilization rate
    const utilizationData = await calculateAllMentorUtilization(db, startDate, endDate);
    const totalAvailableHours = utilizationData.reduce(
      (sum, m) => sum + m.totalAvailableHours,
      0
    );
    const totalBookedHours = utilizationData.reduce((sum, m) => sum + m.bookedHours, 0);
    const utilizationRate =
      totalAvailableHours > 0
        ? Math.round((totalBookedHours / totalAvailableHours) * 100 * 100) / 100
        : 0;

    // Get trends data
    const [sessionsOverTime, utilizationByMentor, feedbackDistribution, engagementMetrics] =
      await Promise.all([
        aggregateSessionsOverTime(db, startDate, endDate, groupBy),
        calculateAllMentorUtilization(db, startDate, endDate),
        aggregateFeedbackDistribution(db, startDate, endDate),
        calculateEngagementMetrics(db, startDate, endDate),
      ]);

    // Calculate sessions this month vs last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthSessions, lastMonthSessions] = await Promise.all([
      db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(officeSessions)
        .where(
          and(gte(officeSessions.startsAt, thisMonthStart), lte(officeSessions.startsAt, now))
        ),
      db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(officeSessions)
        .where(
          and(
            gte(officeSessions.startsAt, lastMonthStart),
            lte(officeSessions.startsAt, lastMonthEnd)
          )
        ),
    ]);

    const response = {
      metrics: {
        totalSessions,
        utilizationRate,
        averageFeedback: Math.round(averageFeedback * 100) / 100,
        activeMentors,
        activeMentees,
        sessionsThisMonth: thisMonthSessions[0]?.count || 0,
        sessionsLastMonth: lastMonthSessions[0]?.count || 0,
      },
      trends: {
        sessionsOverTime,
        utilizationByMentor: utilizationByMentor.sort(
          (a, b) => b.utilizationRate - a.utilizationRate
        ),
        feedbackDistribution,
        engagementMetrics,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}

