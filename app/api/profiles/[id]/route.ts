/**
 * GET /api/profiles/[id] - Get profile by ID
 * PUT /api/profiles/[id] - Update profile by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAuth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { users, mentors, mentees, expertise } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  createErrorResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
  createForbiddenResponse,
} from "@/lib/utils/api-errors";
import {
  updateUserProfileSchema,
  updateMentorProfileSchema,
  updateMenteeProfileSchema,
} from "@/lib/validations/profiles";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return createUnauthorizedResponse();
    }

    const { id } = params;

    // Fetch user with related mentor/mentee profile
    const userWithProfile = await db.query.users.findFirst({
      where: eq(users.id, id),
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
      return createNotFoundResponse("User");
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
    let profile = userWithProfile.role === "mentor" 
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = params;

    // Only allow users to update their own profile
    if (currentUser.id !== id) {
      return createForbiddenResponse("You can only update your own profile");
    }

    const body = await request.json();

    // Update user fields
    const userUpdates = updateUserProfileSchema.parse(body);
    if (Object.keys(userUpdates).length > 0) {
      await db
        .update(users)
        .set(userUpdates)
        .where(eq(users.id, id));
    }

    // Update role-specific profile
    if (currentUser.role === "mentor") {
      const mentorUpdates = updateMentorProfileSchema.parse(body);
      if (Object.keys(mentorUpdates).length > 0) {
        // Find mentor profile
        const mentor = await db.query.mentors.findFirst({
          where: eq(mentors.userId, id),
        });

        if (mentor) {
          await db
            .update(mentors)
            .set({
              ...mentorUpdates,
              updatedAt: new Date(),
            })
            .where(eq(mentors.id, mentor.id));
        }
      }
    } else if (currentUser.role === "mentee") {
      const menteeUpdates = updateMenteeProfileSchema.parse(body);
      if (Object.keys(menteeUpdates).length > 0) {
        // Find mentee profile
        const mentee = await db.query.mentees.findFirst({
          where: eq(mentees.userId, id),
        });

        if (mentee) {
          await db
            .update(mentees)
            .set({
              ...menteeUpdates,
              updatedAt: new Date(),
            })
            .where(eq(mentees.id, mentee.id));
        }
      }
    }

    // Fetch updated profile
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        mentor: {
          with: {
            expertise: true,
          },
        },
        mentee: true,
      },
    });

    if (!updatedUser) {
      return createNotFoundResponse("User");
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
    let profile = updatedUser.role === "mentor" 
      ? updatedUser.mentor 
      : updatedUser.mentee;

    // Normalize mentee profile: convert goals from string to array
    if (updatedUser.role === "mentee" && profile && "goals" in profile) {
      profile = {
        ...profile,
        goals: parseGoals(profile.goals as string | null | undefined),
      };
    }

    const response = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      profile,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt || updatedUser.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}

