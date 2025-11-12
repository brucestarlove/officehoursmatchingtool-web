/**
 * POST /api/auth/signup
 * Custom signup endpoint for NextAuth credentials provider
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createErrorResponse } from "@/lib/utils/api-errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with password hash
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: name || null,
        passwordHash: hashedPassword,
        role: role || "mentee", // Use provided role or default to mentee
        status: "active",
      })
      .returning();

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

