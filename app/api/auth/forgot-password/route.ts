/**
 * POST /api/auth/forgot-password
 * Request password reset code
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createErrorResponse } from "@/lib/utils/api-errors";
import { logger } from "@/lib/utils/logger";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: "If an account exists, a reset code has been sent.",
      });
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Code expires in 15 minutes

    // Delete any existing tokens for this email
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    // Store new verification token
    await db.insert(verificationTokens).values({
      identifier: email,
      token: code,
      expires,
    });

    // Send password reset email (don't block response if email fails)
    try {
      const { sendPasswordResetEmail } = await import("@/lib/email/send");
      await sendPasswordResetEmail(email, code, 15);
      logger.info("Password reset email sent", { email });
    } catch (emailError) {
      logger.error("Failed to send password reset email", emailError, {
        email,
      });
      // Continue - email failure shouldn't break the reset flow
      // The code is still stored in the database, user can request again if needed
    }

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

