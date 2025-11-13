/**
 * NextAuth configuration
 */

import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/utils/logger";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set");
}

if (!process.env.AUTH_URL) {
  throw new Error("AUTH_URL environment variable is not set");
}

export const authOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users as any,
    accountsTable: accounts as any,
    sessionsTable: sessions as any,
    verificationTokensTable: verificationTokens as any,
  }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            // Return null to prevent user enumeration - same error for missing credentials
            return null;
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          // Find user by email using Drizzle query
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          // Security: Return null for both "user not found" and "invalid password"
          // This prevents user enumeration attacks
          if (!user || !user.passwordHash) {
            return null;
          }

          // Verify password using bcrypt
          const isValid = await bcrypt.compare(password, user.passwordHash);

          if (!isValid) {
            // Return null instead of throwing to prevent user enumeration
            return null;
          }

          // Check if user account is active
          if (user.status !== "active") {
            // Return null for inactive accounts (same as invalid credentials for security)
            return null;
          }

          // Return user object for NextAuth session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          // Log error for debugging but don't expose details to client
          logger.error("Authorization error during sign-in", error, {
            context: "auth.authorize",
            email: credentials?.email ? "provided" : "missing", // Don't log actual email for privacy
          });
          // Return null to prevent information leakage
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export type Session = Awaited<ReturnType<typeof auth>>;
export type User = NonNullable<Awaited<ReturnType<typeof auth>>>;
