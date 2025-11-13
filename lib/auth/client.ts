/**
 * Client-side authentication utilities
 */

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, getSession as nextAuthGetSession } from "next-auth/react";

/**
 * Sign in result type
 */
export type SignInResult = 
  | { error: { message: string }; data?: never }
  | { error?: never; data: any };

/**
 * Sign up result type
 */
export type SignUpResult = 
  | { error: { message: string }; data?: never }
  | { error?: never; data: any };

/**
 * Get current session on the client
 */
export async function getSession() {
  return await nextAuthGetSession();
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<SignInResult> {
  try {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result) {
      return { error: { message: "Sign in failed: No response from server" } };
    }

    if (result.error) {
      // Map NextAuth error codes to user-friendly messages
      let errorCode = "CredentialsSignin";
      if (typeof result.error === "string") {
        errorCode = result.error;
      } else if (result.error && typeof result.error === "object" && "message" in result.error) {
        const errorObj = result.error as { message?: string };
        errorCode = typeof errorObj.message === "string" ? errorObj.message : "CredentialsSignin";
      }
      
      // Map NextAuth error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        CredentialsSignin: "Invalid email or password. Please check your credentials and try again.",
        OAuthAccountNotLinked: "An account with this email already exists. Please sign in with your original method.",
        EmailSignin: "Unable to send verification email. Please try again later.",
        OAuthSignin: "Error signing in with OAuth provider. Please try again.",
        OAuthCallback: "Error processing OAuth callback. Please try again.",
        OAuthCreateAccount: "Unable to create account. Please try again.",
        EmailCreateAccount: "Unable to create account. Please try again.",
        Callback: "Error during authentication. Please try again.",
        SessionRequired: "Please sign in to continue.",
      };
      
      const userFriendlyMessage = errorMessages[errorCode] || 
        "Invalid email or password. Please check your credentials and try again.";
      
      return { error: { message: userFriendlyMessage } };
    }

    if (!result.ok) {
      return { error: { message: "Sign in failed: Authentication unsuccessful" } };
    }

    return { data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Sign in failed: Unexpected error";
    return { error: { message: errorMessage } };
  }
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
): Promise<SignUpResult> {
  try {
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
      const errorMessage = data.error || data.message || "Sign up failed";
      return { error: { message: errorMessage } };
    }

    // Automatically sign in after signup
    return signIn(email, password);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Sign up failed: Unexpected error";
    return { error: { message: errorMessage } };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  await nextAuthSignOut({ 
    redirect: false,
    callbackUrl: "/login"
  });
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
