/**
 * GET /api/profiles
 * List all profiles (admin only)
 */

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createErrorResponse, createForbiddenResponse } from "@/lib/utils/api-errors";

export async function GET() {
  try {
    // Only admins can list all profiles
    const currentUser = await requireRole(["admin", "pm"]);

    // Fetch all users with their profiles
    const allUsers = await db.query.users.findMany({
      with: {
        mentor: {
          with: {
            expertise: true,
          },
        },
        mentee: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    // Map to API response format
    const profiles = allUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profile: user.role === "mentor" ? user.mentor : user.mentee,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({
      profiles,
      count: profiles.length,
    });
  } catch (error) {
    // If requireRole throws, it redirects, so this handles other errors
    return createErrorResponse(error);
  }
}

