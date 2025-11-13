/**
 * GET /api/mentors
 * Search mentors with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { mentors, users, expertise } from "@/lib/db/schema";
import { eq, and, or, like, sql, inArray } from "drizzle-orm";
import { createErrorResponse, createUnauthorizedResponse } from "@/lib/utils/api-errors";
import type { MentorSearchParams, MentorSearchResponse, Mentor } from "@/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/sessions";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const expertiseFilter = searchParams.get("expertise")?.split(",") || [];
    const industry = searchParams.get("industry") || undefined;
    const stage = searchParams.get("stage") || undefined;
    const sort = searchParams.get("sort") || "relevance";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10);

    // Build query conditions
    const conditions = [eq(mentors.active, true)];

    // Text search on name, bio, headline, company
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${users.name}) LIKE ${searchLower}`,
          sql`LOWER(${mentors.bio}) LIKE ${searchLower}`,
          sql`LOWER(${mentors.headline}) LIKE ${searchLower}`,
          sql`LOWER(${mentors.company}) LIKE ${searchLower}`
        )!
      );
    }

    // Filter by expertise
    if (expertiseFilter.length > 0) {
      const mentorIdsWithExpertise = await db
        .selectDistinct({ mentorId: expertise.mentorId })
        .from(expertise)
        .where(
          inArray(
            sql`LOWER(${expertise.area})`,
            expertiseFilter.map((e) => e.toLowerCase())
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
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        } as MentorSearchResponse);
      }
    }

    // Filter by industry
    if (industry) {
      conditions.push(sql`LOWER(${mentors.industry}) = LOWER(${industry})`);
    }

    // Filter by stage
    if (stage) {
      conditions.push(sql`LOWER(${mentors.stage}) = LOWER(${stage})`);
    }

    // Fetch mentors with user and expertise data
    const mentorRecords = await db.query.mentors.findMany({
      where: and(...conditions),
      with: {
        user: true,
        expertise: true,
      },
      limit: limit + 1, // Fetch one extra to check if there are more
      offset: (page - 1) * limit,
    });

    const hasMore = mentorRecords.length > limit;
    const mentorsToReturn = hasMore ? mentorRecords.slice(0, limit) : mentorRecords;

    // Get total count (simplified - in production, use a separate count query)
    // For now, if we got limit+1 results, there are more pages
    const total = hasMore ? page * limit + 1 : (page - 1) * limit + mentorsToReturn.length;
    const totalPages = Math.ceil(total / limit);

    // Map to frontend Mentor type
    // Use email prefix as the id for the response
    const mentorsResponse: Mentor[] = mentorsToReturn.map((mentor) => {
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

    // Sort by rating or availability if requested
    // (Relevance is already handled by the query order)
    if (sort === "rating") {
      // TODO: Sort by rating when reviews are populated
      // For now, keep original order
    } else if (sort === "availability") {
      // TODO: Sort by availability
      // For now, keep original order
    }

    return NextResponse.json({
      mentors: mentorsResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    } as MentorSearchResponse);
  } catch (error) {
    return createErrorResponse(error);
  }
}

