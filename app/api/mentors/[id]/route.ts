/**
 * GET /api/mentors/[id]
 * Get single mentor by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { mentors, users, expertise, reviews } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createErrorResponse, createUnauthorizedResponse, createNotFoundResponse } from "@/lib/utils/api-errors";
import type { Mentor } from "@/types";
import { sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;

    // The id parameter is the email prefix (part before @)
    // Look up mentor by matching user email prefix
    const mentorResult = await db
      .select({
        mentor: mentors,
        user: users,
      })
      .from(mentors)
      .innerJoin(users, eq(mentors.userId, users.id))
      .where(
        and(
          eq(mentors.active, true),
          sql`LOWER(SPLIT_PART(${users.email}, '@', 1)) = LOWER(${id})`
        )
      )
      .limit(1);

    if (!mentorResult || mentorResult.length === 0) {
      return createNotFoundResponse("Mentor");
    }

    const mentorData = mentorResult[0];
    const mentorId = mentorData.mentor.id;

    // Fetch expertise for this mentor
    const expertiseRecords = await db.query.expertise.findMany({
      where: eq(expertise.mentorId, mentorId),
    });

    // Calculate average rating and review count
    const reviewStats = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating})::numeric, 0)`,
        reviewCount: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.mentorId, mentorId));

    const stats = reviewStats[0];
    const averageRating =
      stats.averageRating > 0 ? Number(stats.averageRating) : undefined;
    const reviewCount =
      stats.reviewCount > 0 ? Number(stats.reviewCount) : undefined;

    // Map to frontend Mentor type
    // Use email prefix as the id for the response
    const emailPrefix = mentorData.user.email.split("@")[0];
    const mentorResponse: Mentor = {
      id: emailPrefix,
      userId: mentorData.mentor.userId,
      name: mentorData.user.name || "Unknown",
      email: mentorData.user.email || "",
      bio: mentorData.mentor.bio || undefined,
      expertise: expertiseRecords.map((e) => e.area),
      industries: mentorData.mentor.industry ? [mentorData.mentor.industry] : [],
      company: mentorData.mentor.company || undefined,
      title: mentorData.mentor.title || undefined,
      profilePhoto: mentorData.mentor.photoUrl || undefined,
      socialLinks: mentorData.mentor.linkedinUrl
        ? { linkedIn: mentorData.mentor.linkedinUrl }
        : undefined,
      rating: averageRating,
      reviewCount,
      createdAt: mentorData.mentor.createdAt.toISOString(),
      updatedAt: mentorData.mentor.updatedAt.toISOString(),
    };

    return NextResponse.json(mentorResponse);
  } catch (error) {
    return createErrorResponse(error);
  }
}

