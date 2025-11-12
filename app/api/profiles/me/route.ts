/**
 * GET /api/profiles/me
 * Get current user profile
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { users, mentors, mentees, expertise } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createErrorResponse, createUnauthorizedResponse } from "@/lib/utils/api-errors";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Fetch user with related mentor/mentee profile
    const userWithProfile = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        mentor: {
          with: {
            expertise: true,
          },
        },
        mentee: true,
      },
    });

    if (!userWithProfile) {
      return createErrorResponse(new Error("User not found"), 404);
    }

    // Map to API response format
    const response = {
      id: userWithProfile.id,
      email: userWithProfile.email,
      name: userWithProfile.name,
      role: userWithProfile.role,
      status: userWithProfile.status,
      profile: userWithProfile.role === "mentor" 
        ? userWithProfile.mentor 
        : userWithProfile.mentee,
      createdAt: userWithProfile.createdAt,
      updatedAt: userWithProfile.updatedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}

