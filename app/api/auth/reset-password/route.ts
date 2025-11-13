/**
 * POST /api/auth/reset-password
 * Reset password with verification code
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createErrorResponse } from "@/lib/utils/api-errors";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, password } = body;

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, code, and password are required" },
        { status: 400 }
      );
    }

    // Find verification token
    const token = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, code)
      ),
    });

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > token.expires) {
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password hash in users table
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
      })
      .where(eq(users.id, user.id));

    // Delete used verification token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, code)
        )
      );

    return NextResponse.json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

