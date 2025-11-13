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

    // Helper function to parse goals from string to array
    const parseGoals = (goals: string | null | undefined): string[] => {
      if (!goals) return [];
      if (Array.isArray(goals)) return goals;
      
      try {
        // Try parsing as JSON array
        const parsed = JSON.parse(goals);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // If not JSON, treat as comma-separated string or single string
        if (goals.includes(",")) {
          return goals.split(",").map(g => g.trim()).filter(Boolean);
        }
        return [goals.trim()].filter(Boolean);
      }
      
      return [];
    };

    // Map to API response format
    let profile: any = userWithProfile.role === "mentor" 
      ? userWithProfile.mentor 
      : userWithProfile.mentee;

    // Normalize mentee profile: convert goals from string to array
    if (userWithProfile.role === "mentee" && profile && "goals" in profile) {
      profile = {
        ...profile,
        goals: parseGoals(profile.goals as string | null | undefined),
      };
    }

    const response = {
      id: userWithProfile.id,
      email: userWithProfile.email,
      name: userWithProfile.name,
      role: userWithProfile.role,
      status: userWithProfile.status,
      profile,
      createdAt: userWithProfile.createdAt,
      updatedAt: userWithProfile.updatedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}

