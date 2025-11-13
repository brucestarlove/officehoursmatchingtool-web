/**
 * Vercel Cron job to send session reminders
 * Runs hourly and sends 24-hour and 1-hour reminders
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { officeSessions } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";
import { sendSessionReminderEmails } from "@/lib/email/send";
import type { Session } from "@/types";

/**
 * Verify the request is from Vercel Cron
 * Vercel automatically adds headers to cron requests
 */
function verifyCronRequest(request: NextRequest): boolean {
  // Vercel automatically adds this header for cron jobs
  const vercelCron = request.headers.get("x-vercel-cron");
  
  // Also allow manual testing with CRON_SECRET if provided
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      return true;
    }
  }
  
  // In production, require Vercel's cron header
  // In development, allow manual testing
  return vercelCron === "1" || process.env.NODE_ENV !== "production";
}

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    if (!verifyCronRequest(request)) {
      logger.warn("Unauthorized cron request", {
        headers: Object.fromEntries(request.headers.entries()),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const results = {
      sent24h: 0,
      sent1h: 0,
      errors: [] as string[],
    };

    // Query sessions with mentor and mentee relations
    const allUpcomingSessions = await db.query.officeSessions.findMany({
      where: and(
        eq(officeSessions.status, "scheduled"),
        gte(officeSessions.startsAt, now) // Only future sessions
      ),
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

    logger.info("Processing reminders", {
      totalSessions: allUpcomingSessions.length,
      currentTime: now.toISOString(),
    });

    // Process 24-hour reminders (sessions starting between 23.5h and 24.5h from now)
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyThreeAndHalfHoursFromNow = new Date(
      now.getTime() + 23.5 * 60 * 60 * 1000
    );
    const twentyFourAndHalfHoursFromNow = new Date(
      now.getTime() + 24.5 * 60 * 60 * 1000
    );

    const sessions24h = allUpcomingSessions.filter((session) => {
      const startTime = session.startsAt;
      return (
        startTime >= twentyThreeAndHalfHoursFromNow &&
        startTime <= twentyFourAndHalfHoursFromNow
      );
    });

    // Process 1-hour reminders (sessions starting between 45min and 1h 15min from now)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const fortyFiveMinutesFromNow = new Date(now.getTime() + 45 * 60 * 1000);
    const oneHourFifteenMinutesFromNow = new Date(
      now.getTime() + 75 * 60 * 1000
    );

    const sessions1h = allUpcomingSessions.filter((session) => {
      const startTime = session.startsAt;
      return (
        startTime >= fortyFiveMinutesFromNow &&
        startTime <= oneHourFifteenMinutesFromNow
      );
    });

    // Send 24-hour reminders
    for (const session of sessions24h) {
      try {
        if (!session.mentor || !session.mentee) {
          logger.warn("Session missing mentor or mentee", {
            sessionId: session.id,
          });
          continue;
        }

        const sessionResponse: Session = {
          id: session.id,
          mentorId: session.mentorId,
          menteeId: session.menteeId,
          mentor: {
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
          },
          mentee: {
            id: session.mentee.id,
            userId: session.mentee.userId,
            name: session.mentee.user?.name || "Unknown",
            email: session.mentee.user?.email || "",
            goals: session.mentee.goals ? [session.mentee.goals] : [],
            interests: [],
            createdAt: session.mentee.createdAt.toISOString(),
            updatedAt: session.mentee.updatedAt.toISOString(),
          },
          startTime: session.startsAt.toISOString(),
          duration: session.duration,
          meetingType: session.meetingType as "video" | "in-person",
          meetingLink: session.meetingUrl || undefined,
          goals: session.goals || undefined,
          status: session.status as Session["status"],
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };

        await sendSessionReminderEmails(sessionResponse, 24);
        results.sent24h++;
        logger.info("Sent 24h reminder", {
          sessionId: session.id,
        });
      } catch (error) {
        const errorMsg = `Failed to send 24h reminder for session ${session.id}`;
        logger.error(errorMsg, error, {
          sessionId: session.id,
        });
        results.errors.push(errorMsg);
      }
    }

    // Send 1-hour reminders
    for (const session of sessions1h) {
      try {
        if (!session.mentor || !session.mentee) {
          logger.warn("Session missing mentor or mentee", {
            sessionId: session.id,
          });
          continue;
        }

        const sessionResponse: Session = {
          id: session.id,
          mentorId: session.mentorId,
          menteeId: session.menteeId,
          mentor: {
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
          },
          mentee: {
            id: session.mentee.id,
            userId: session.mentee.userId,
            name: session.mentee.user?.name || "Unknown",
            email: session.mentee.user?.email || "",
            goals: session.mentee.goals ? [session.mentee.goals] : [],
            interests: [],
            createdAt: session.mentee.createdAt.toISOString(),
            updatedAt: session.mentee.updatedAt.toISOString(),
          },
          startTime: session.startsAt.toISOString(),
          duration: session.duration,
          meetingType: session.meetingType as "video" | "in-person",
          meetingLink: session.meetingUrl || undefined,
          goals: session.goals || undefined,
          status: session.status as Session["status"],
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };

        await sendSessionReminderEmails(sessionResponse, 1);
        results.sent1h++;
        logger.info("Sent 1h reminder", {
          sessionId: session.id,
        });
      } catch (error) {
        const errorMsg = `Failed to send 1h reminder for session ${session.id}`;
        logger.error(errorMsg, error, {
          sessionId: session.id,
        });
        results.errors.push(errorMsg);
      }
    }

    logger.info("Reminder cron job completed", results);

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    logger.error("Error in reminder cron job", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process reminders",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

