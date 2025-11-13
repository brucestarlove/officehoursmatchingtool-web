/**
 * POST /api/match
 * AI-powered mentor matching endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { mentors, users, expertise, availability, officeSessions, mentees } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, or, inArray } from "drizzle-orm";
import { createErrorResponse, createUnauthorizedResponse } from "@/lib/utils/api-errors";
import type { MatchRequest, MatchResponse, Mentor } from "@/types";
import {
  scoreExpertiseMatch,
  scoreIndustryMatch,
  scoreStageMatch,
  scoreAvailability,
  calculateTotalScore,
  generateMatchExplanation,
  rankMentors,
  type MatchScores,
} from "@/lib/utils/matching";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body: MatchRequest = await request.json();
    const { query, filters } = body;

    // Build query conditions
    const conditions = [eq(mentors.active, true)];

    // Filter by expertise
    if (filters.expertise && filters.expertise.length > 0) {
      const mentorIdsWithExpertise = await db
        .selectDistinct({ mentorId: expertise.mentorId })
        .from(expertise)
        .where(
          inArray(
            sql`LOWER(${expertise.area})`,
            filters.expertise.map((e) => e.toLowerCase())
          )
        );

      if (mentorIdsWithExpertise.length > 0) {
        conditions.push(
          inArray(
            mentors.id,
            mentorIdsWithExpertise.map((m) => m.mentorId)
          )
        );
      } else {
        // No mentors match expertise filter
        return NextResponse.json({
          mentors: [],
          matchExplanations: {},
          totalCount: 0,
        } as MatchResponse);
      }
    }

    // Filter by industry
    if (filters.industry) {
      conditions.push(
        sql`LOWER(${mentors.industry}) = LOWER(${filters.industry})`
      );
    }

    // Filter by stage
    if (filters.stage) {
      conditions.push(sql`LOWER(${mentors.stage}) = LOWER(${filters.stage})`);
    }

    // Filter by minimum rating (if reviews exist)
    // This will be implemented when reviews are populated

    // Fetch mentors with user and expertise data
    const mentorRecords = await db.query.mentors.findMany({
      where: and(...conditions),
      with: {
        user: true,
        expertise: true,
      },
    });

    // Get availability for each mentor (check if they have any upcoming availability)
    const mentorIds = mentorRecords.map((m) => m.id);
    const upcomingAvailability = await db
      .selectDistinct({ mentorId: availability.mentorId })
      .from(availability)
      .where(
        and(
          inArray(availability.mentorId, mentorIds),
          gte(availability.startsAt, new Date())
        )
      );

    const mentorsWithAvailability = new Set(
      upcomingAvailability.map((a) => a.mentorId)
    );

    // Calculate scores for each mentor
    const scoresMap = new Map<string, MatchScores>();
    const mentorExpertiseMap = new Map<string, string[]>();

    // Build expertise map
    for (const mentor of mentorRecords) {
      mentorExpertiseMap.set(
        mentor.id,
        mentor.expertise.map((e) => e.area)
      );
    }

    // Calculate scores
    for (const mentor of mentorRecords) {
      const mentorExpertise = mentorExpertiseMap.get(mentor.id) || [];
      const hasAvailability = mentorsWithAvailability.has(mentor.id);

      const scores: MatchScores = {
        expertise: scoreExpertiseMatch(
          mentorExpertise,
          filters.expertise || []
        ),
        industry: scoreIndustryMatch(mentor.industry, filters.industry),
        stage: scoreStageMatch(mentor.stage, filters.stage),
        availability: scoreAvailability(hasAvailability),
        total: 0,
      };

      scores.total = calculateTotalScore(scores);
      scoresMap.set(mentor.id, scores);
    }

    // Get mentee profile for current user
    const menteeProfile = await db.query.mentees.findFirst({
      where: eq(mentees.userId, user.id),
    });

    // Filter by past interactions if specified
    let filteredMentors = mentorRecords;
    if (filters.pastInteractions === "previously-booked" && menteeProfile) {
      // Get mentors the user has booked with before
      const pastSessions = await db
        .select({ mentorId: officeSessions.mentorId })
        .from(officeSessions)
        .where(eq(officeSessions.menteeId, menteeProfile.id));

      const pastMentorIds = new Set(pastSessions.map((s) => s.mentorId));
      filteredMentors = mentorRecords.filter((m) =>
        pastMentorIds.has(m.id)
      );
    } else if (filters.pastInteractions === "new-mentors-only" && menteeProfile) {
      // Get mentors the user has NOT booked with before
      const pastSessions = await db
        .select({ mentorId: officeSessions.mentorId })
        .from(officeSessions)
        .where(eq(officeSessions.menteeId, menteeProfile.id));

      const pastMentorIds = new Set(pastSessions.map((s) => s.mentorId));
      filteredMentors = mentorRecords.filter(
        (m) => !pastMentorIds.has(m.id)
      );
    }

    // Rank mentors by score
    const rankedMentors = rankMentors(filteredMentors, scoresMap);

    // Map to frontend Mentor type
    // Use email prefix as the id for the response
    const mentorsResponse: Mentor[] = rankedMentors.map((mentor) => {
      const emailPrefix = mentor.user?.email ? mentor.user.email.split("@")[0] : mentor.id;
      return {
        id: emailPrefix,
        userId: mentor.userId,
        name: mentor.user?.name || "Unknown",
        email: mentor.user?.email || "",
        bio: mentor.bio || undefined,
        expertise: mentor.expertise.map((e) => e.area),
        industries: mentor.industry ? [mentor.industry] : [],
        company: mentor.company || undefined,
        title: mentor.title || undefined,
        profilePhoto: mentor.photoUrl || undefined,
        socialLinks: mentor.linkedinUrl
          ? { linkedIn: mentor.linkedinUrl }
          : undefined,
        rating: undefined, // Will be calculated from reviews
        reviewCount: undefined, // Will be calculated from reviews
        createdAt: mentor.createdAt.toISOString(),
        updatedAt: mentor.updatedAt.toISOString(),
      };
    });

    // Generate match explanations
    // Map explanations using email prefix as key
    const matchExplanations: Record<string, string> = {};
    for (const mentor of rankedMentors) {
      const scores = scoresMap.get(mentor.id);
      if (scores) {
        const emailPrefix = mentor.user?.email ? mentor.user.email.split("@")[0] : mentor.id;
        const mentorResponse = mentorsResponse.find((m) => m.id === emailPrefix);
        if (mentorResponse) {
          matchExplanations[emailPrefix] = generateMatchExplanation(
            mentorResponse,
            scores
          );
        }
      }
    }

    return NextResponse.json({
      mentors: mentorsResponse,
      matchExplanations,
      totalCount: mentorsResponse.length,
    } as MatchResponse);
  } catch (error) {
    return createErrorResponse(error);
  }
}

