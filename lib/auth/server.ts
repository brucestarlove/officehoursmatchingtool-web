/**
 * Server-side authentication utilities
 */

import { auth } from "./config";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the current session on the server
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user from NextAuth session
 * Returns NextAuth user (basic info only)
 */
export async function getCurrentAuthUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Get the current user from database (includes role and other custom fields)
 */
export async function getCurrentUser() {
  const authUser = await getCurrentAuthUser();
  if (!authUser) {
    return null;
  }

  // Fetch full user from database to get role and other fields
  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.id as string),
  });

  return user || null;
}

/**
 * Require authentication - redirects to login if not authenticated
 * Returns full user from database (includes role)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require a specific role - redirects to home if role doesn't match
 * Returns full user from database
 */
export async function requireRole(role: string | string[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role || "")) {
    redirect("/");
  }

  return user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}
