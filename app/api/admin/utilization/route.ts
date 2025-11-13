/**
 * GET /api/admin/utilization
 * Utilization tracking and trends
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { db } from "@/lib/db";
import {
  calculateAllMentorUtilization,
  aggregateSessionsOverTime,
} from "@/lib/utils/analytics";
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

    // Get utilization data
    const utilizationByMentor = await calculateAllMentorUtilization(db, startDate, endDate);

    // Calculate overall utilization
    const totalAvailableHours = utilizationByMentor.reduce(
      (sum, m) => sum + m.totalAvailableHours,
      0
    );
    const totalBookedHours = utilizationByMentor.reduce((sum, m) => sum + m.bookedHours, 0);
    const overallUtilizationRate =
      totalAvailableHours > 0
        ? Math.round((totalBookedHours / totalAvailableHours) * 100 * 100) / 100
        : 0;

    // Get utilization trends over time
    const utilizationTrends = await aggregateSessionsOverTime(db, startDate, endDate, groupBy);

    // Identify low utilization mentors (< 20%)
    const lowUtilizationMentors = utilizationByMentor.filter((m) => m.utilizationRate < 20);

    // Calculate engagement distribution
    const highUtilization = utilizationByMentor.filter((m) => m.utilizationRate >= 70).length;
    const mediumUtilization = utilizationByMentor.filter(
      (m) => m.utilizationRate >= 20 && m.utilizationRate < 70
    ).length;
    const lowUtilization = utilizationByMentor.filter((m) => m.utilizationRate < 20).length;

    return NextResponse.json({
      overallUtilizationRate,
      totalAvailableHours: Math.round(totalAvailableHours * 100) / 100,
      totalBookedHours: Math.round(totalBookedHours * 100) / 100,
      utilizationByMentor: utilizationByMentor.sort(
        (a, b) => b.utilizationRate - a.utilizationRate
      ),
      utilizationTrends,
      lowUtilizationAlerts: lowUtilizationMentors.map((m) => ({
        mentorId: m.mentorId,
        mentorName: m.mentorName,
        utilizationRate: m.utilizationRate,
        sessionCount: m.sessionCount,
      })),
      engagementDistribution: {
        high: highUtilization,
        medium: mediumUtilization,
        low: lowUtilization,
      },
      recommendations: generateRecommendations(utilizationByMentor, overallUtilizationRate),
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

function generateRecommendations(
  utilizationByMentor: Array<{ utilizationRate: number; mentorName: string }>,
  overallRate: number
): string[] {
  const recommendations: string[] = [];

  if (overallRate < 30) {
    recommendations.push("Overall utilization is low. Consider promoting mentor availability to mentees.");
  }

  const lowUtilizationCount = utilizationByMentor.filter((m) => m.utilizationRate < 20).length;
  if (lowUtilizationCount > utilizationByMentor.length * 0.3) {
    recommendations.push(
      `${lowUtilizationCount} mentors have low utilization. Consider reaching out to understand barriers.`
    );
  }

  const highUtilizationCount = utilizationByMentor.filter((m) => m.utilizationRate > 80).length;
  if (highUtilizationCount > 0) {
    recommendations.push(
      `${highUtilizationCount} mentors are highly utilized. Consider recruiting additional mentors in similar expertise areas.`
    );
  }

  return recommendations;
}

