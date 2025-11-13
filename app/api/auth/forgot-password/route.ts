/**
 * POST /api/auth/forgot-password
 * Request password reset code
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createErrorResponse } from "@/lib/utils/api-errors";
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

    // TODO: Send email with reset code
    // For now, we'll just return success
    // In production, integrate with email service (SendGrid, Resend, etc.)
    console.log(`Password reset code for ${email}: ${code}`);

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

