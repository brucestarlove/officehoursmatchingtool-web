/**
 * GET /api/admin/export
 * Export data as CSV or JSON
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { officeSessions, mentors, mentees, reviews } from "@/lib/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { createErrorResponse } from "@/lib/utils/api-errors";

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "sessions"; // sessions, mentors, analytics
    const format = searchParams.get("format") || "csv"; // csv, json
    const filtersParam = searchParams.get("filters");

    let filters: Record<string, any> = {};
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch {
        // Invalid JSON, ignore
      }
    }

    if (format === "json") {
      // JSON export
      if (type === "sessions") {
        const sessions = await db.query.officeSessions.findMany({
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
          limit: 10000, // Reasonable limit
        });

        const exportData = sessions.map((s) => ({
          id: s.id,
          mentorName: s.mentor?.user?.name || "Unknown",
          menteeName: s.mentee?.user?.name || "Unknown",
          startTime: s.startsAt.toISOString(),
          duration: s.duration,
          status: s.status,
          meetingType: s.meetingType,
          rating: s.reviews && s.reviews.length > 0
            ? s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length
            : null,
        }));

        return NextResponse.json(exportData, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="sessions-${Date.now()}.json"`,
          },
        });
      } else if (type === "mentors") {
        const mentorsData = await db.query.mentors.findMany({
          with: {
            user: true,
          },
        });

        const exportData = mentorsData.map((m) => ({
          id: m.id,
          name: m.user?.name || "Unknown",
          email: m.user?.email || "",
          company: m.company || "",
          title: m.title || "",
          industry: m.industry || "",
        }));

        return NextResponse.json(exportData, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="mentors-${Date.now()}.json"`,
          },
        });
      }
    } else {
      // CSV export
      let csv = "";
      let filename = "";

      if (type === "sessions") {
        const sessions = await db.query.officeSessions.findMany({
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
          limit: 10000,
        });

        // CSV headers
        csv = "ID,Mentor Name,Mentee Name,Start Time,Duration (min),Status,Meeting Type,Rating\n";

        // CSV rows
        sessions.forEach((s) => {
          const rating =
            s.reviews && s.reviews.length > 0
              ? (s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length).toFixed(2)
              : "";
          const mentorName = (s.mentor?.user?.name || "Unknown").replace(/"/g, '""');
          const menteeName = (s.mentee?.user?.name || "Unknown").replace(/"/g, '""');
          csv += `"${s.id}","${mentorName}","${menteeName}","${s.startsAt.toISOString()}",${s.duration},"${s.status}","${s.meetingType}","${rating}"\n`;
        });

        filename = `sessions-${Date.now()}.csv`;
      } else if (type === "mentors") {
        const mentorsData = await db.query.mentors.findMany({
          with: {
            user: true,
          },
        });

        csv = "ID,Name,Email,Company,Title,Industry\n";
        mentorsData.forEach((m) => {
          const name = (m.user?.name || "Unknown").replace(/"/g, '""');
          const email = (m.user?.email || "").replace(/"/g, '""');
          const company = (m.company || "").replace(/"/g, '""');
          const title = (m.title || "").replace(/"/g, '""');
          const industry = (m.industry || "").replace(/"/g, '""');
          csv += `"${m.id}","${name}","${email}","${company}","${title}","${industry}"\n`;
        });

        filename = `mentors-${Date.now()}.csv`;
      } else {
        return createErrorResponse(new Error("Invalid export type"), 400);
      }

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return createErrorResponse(new Error("Invalid export type or format"), 400);
  } catch (error) {
    return createErrorResponse(error);
  }
}

