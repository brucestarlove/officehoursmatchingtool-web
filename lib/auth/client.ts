/**
 * Client-side authentication utilities
 */

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, getSession as nextAuthGetSession } from "next-auth/react";

/**
 * Get current session on the client
 */
export async function getSession() {
  return await nextAuthGetSession();
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const result = await nextAuthSignIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    return { error: { message: result.error } };
  }

  return { data: result };
}

/**
 * Sign up with email and password
 * Note: NextAuth doesn't have built-in signup, so we'll need to create an API endpoint
 */
export async function signUp(
  email: string,
  password: string,
  name?: string,
  role?: "mentor" | "mentee"
) {
  // Call our custom signup API endpoint
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name, role }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: { message: data.error || "Sign up failed" } };
  }

  // Automatically sign in after signup
  return signIn(email, password);
}

/**
 * Sign out current user
 */
export async function signOut() {
  await nextAuthSignOut({ redirect: false });
}

/**
 * Request password reset code
 */
export async function forgotPassword(email: string) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send reset code");
  }

  return data;
}

/**
 * Confirm password reset with code
 */
export async function confirmPassword({
  email,
  code,
  newPassword,
}: {
  email: string;
  code: string;
  newPassword: string;
}) {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code, password: newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }

  return data;
}
