/**
 * POST /api/match/mentees
 * AI-powered mentee matching endpoint for mentors
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { mentees, users, mentors, expertise, officeSessions } from "@/lib/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { createErrorResponse, createUnauthorizedResponse } from "@/lib/utils/api-errors";
import type { Mentee } from "@/types";

interface MenteeMatchRequest {
  query: string;
  filters: {
    pastInteractions?: "previously-booked" | "new-mentees-only" | "all";
  };
}

interface MenteeMatchResponse {
  mentees: Mentee[];
  matchExplanations: {
    [menteeId: string]: string;
  };
  totalCount: number;
}

/**
 * Generate match explanation for a mentee based on mentor expertise
 */
function generateMenteeMatchExplanation(
  mentee: any,
  mentorExpertise: string[]
): string {
  const reasons: string[] = [];
  
  // Check if mentee goals match mentor expertise
  const menteeGoals = mentee.goals ? (Array.isArray(mentee.goals) ? mentee.goals : [mentee.goals]) : [];
  const matchingGoals = menteeGoals.filter((goal: string) =>
    mentorExpertise.some((exp) =>
      goal.toLowerCase().includes(exp.toLowerCase()) ||
      exp.toLowerCase().includes(goal.toLowerCase())
    )
  );
  
  if (matchingGoals.length > 0) {
    reasons.push(`Looking for help with ${matchingGoals[0]}`);
  }
  
  if (mentee.stage) {
    reasons.push(`At ${mentee.stage} stage`);
  }
  
  if (mentee.industry) {
    reasons.push(`In ${mentee.industry} industry`);
  }
  
  return reasons.length > 0
    ? reasons.join(" • ")
    : "Potential match based on your expertise";
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Only mentors can match mentees
    if (user.role !== "mentor") {
      return createErrorResponse(
        new Error("Only mentors can match mentees"),
        403
      );
    }

    const body: MenteeMatchRequest = await request.json();
    const { query, filters } = body;

    // Get mentor profile and expertise
    const mentorProfile = await db.query.mentors.findFirst({
      where: eq(mentors.userId, user.id),
      with: {
        expertise: true,
      },
    });

    if (!mentorProfile) {
      return NextResponse.json({
        mentees: [],
        matchExplanations: {},
        totalCount: 0,
      } as MenteeMatchResponse);
    }

    const mentorExpertise = mentorProfile.expertise.map((e) => e.area);
    
    // Build query conditions for mentees
    const conditions: any[] = [];

    // Filter by past interactions if specified
    let filteredMentees: any[] = [];
    if (filters.pastInteractions === "previously-booked") {
      // Get mentees the mentor has booked with before
      const pastSessions = await db
        .select({ menteeId: officeSessions.menteeId })
        .from(officeSessions)
        .where(eq(officeSessions.mentorId, mentorProfile.id));

      const pastMenteeIds = pastSessions.map((s) => s.menteeId);
      if (pastMenteeIds.length > 0) {
        filteredMentees = await db.query.mentees.findMany({
          where: inArray(mentees.id, pastMenteeIds),
          with: {
            user: true,
          },
        });
      }
    } else if (filters.pastInteractions === "new-mentees-only") {
      // Get mentees the mentor has NOT booked with before
      const pastSessions = await db
        .select({ menteeId: officeSessions.menteeId })
        .from(officeSessions)
        .where(eq(officeSessions.mentorId, mentorProfile.id));

      const pastMenteeIds = new Set(pastSessions.map((s) => s.menteeId));
      
      const allMentees = await db.query.mentees.findMany({
        with: {
          user: true,
        },
      });
      
      filteredMentees = allMentees.filter((m) => !pastMenteeIds.has(m.id));
    } else {
      // Get all mentees
      filteredMentees = await db.query.mentees.findMany({
        with: {
          user: true,
        },
      });
    }

    // Score and rank mentees based on mentor expertise matching mentee goals
    const scoredMentees = filteredMentees.map((mentee) => {
      const menteeGoals = mentee.goals
        ? (typeof mentee.goals === "string"
            ? mentee.goals.split(",").map((g: string) => g.trim())
            : Array.isArray(mentee.goals)
            ? mentee.goals
            : [])
        : [];
      
      // Calculate match score based on expertise matching goals
      let matchScore = 0;
      for (const goal of menteeGoals) {
        for (const exp of mentorExpertise) {
          if (
            goal.toLowerCase().includes(exp.toLowerCase()) ||
            exp.toLowerCase().includes(goal.toLowerCase())
          ) {
            matchScore += 1;
            break;
          }
        }
      }
      
      // Bonus for industry match
      if (mentorProfile.industry && mentee.industry) {
        if (
          mentorProfile.industry.toLowerCase() === mentee.industry.toLowerCase()
        ) {
          matchScore += 0.5;
        }
      }
      
      // Bonus for stage match
      if (mentorProfile.stage && mentee.stage) {
        if (
          mentorProfile.stage.toLowerCase() === mentee.stage.toLowerCase()
        ) {
          matchScore += 0.5;
        }
      }
      
      return {
        mentee,
        score: matchScore,
      };
    });

    // Sort by score (highest first)
    scoredMentees.sort((a, b) => b.score - a.score);

    // Map to frontend Mentee type
    const menteesResponse: Mentee[] = scoredMentees
      .filter((item) => item.score > 0) // Only include mentees with some match
      .map((item) => {
        const mentee = item.mentee;
        const emailPrefix = mentee.user?.email
          ? mentee.user.email.split("@")[0]
          : mentee.id;
        
        // Parse goals
        let goalsArray: string[] = [];
        if (mentee.goals) {
          if (typeof mentee.goals === "string") {
            try {
              const parsed = JSON.parse(mentee.goals);
              goalsArray = Array.isArray(parsed) ? parsed : [mentee.goals];
            } catch {
              goalsArray = mentee.goals.includes(",")
                ? mentee.goals.split(",").map((g: string) => g.trim())
                : [mentee.goals];
            }
          } else if (Array.isArray(mentee.goals)) {
            goalsArray = mentee.goals;
          }
        }
        
        return {
          id: emailPrefix,
          userId: mentee.userId,
          name: mentee.user?.name || "Unknown",
          email: mentee.user?.email || "",
          bio: undefined,
          goals: goalsArray,
          interests: mentee.industry ? [mentee.industry] : [],
          startupStage: mentee.stage || undefined,
          profilePhoto: undefined,
          createdAt: mentee.createdAt.toISOString(),
          updatedAt: mentee.updatedAt.toISOString(),
        };
      });

    // Generate match explanations
    const matchExplanations: Record<string, string> = {};
    for (const item of scoredMentees.filter((item) => item.score > 0)) {
      const mentee = item.mentee;
      const emailPrefix = mentee.user?.email
        ? mentee.user.email.split("@")[0]
        : mentee.id;
      matchExplanations[emailPrefix] = generateMenteeMatchExplanation(
        mentee,
        mentorExpertise
      );
    }

    return NextResponse.json({
      mentees: menteesResponse,
      matchExplanations,
      totalCount: menteesResponse.length,
    } as MenteeMatchResponse);
  } catch (error) {
    return createErrorResponse(error);
  }
}

