/**
 * POST /api/auth/signup
 * Custom signup endpoint for NextAuth credentials provider
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, mentors, mentees, expertise } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createErrorResponse } from "@/lib/utils/api-errors";
import { enqueueAirtableSync } from "@/lib/utils/airtable-outbox";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      role,
      // Mentor fields
      headline,
      bio,
      company,
      title,
      industry,
      stage,
      timezone,
      expertise: expertiseAreas,
      // Mentee fields
      goals,
    } = body;

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
        role: role || "mentee",
        status: "active",
      })
      .returning();

    // Create role-specific profile
    if (role === "mentor") {
      // Create mentor profile
      const [newMentor] = await db
        .insert(mentors)
        .values({
          userId: newUser.id,
          headline: headline || null,
          bio: bio || null,
          company: company || null,
          title: title || null,
          industry: industry || null,
          stage: stage || null,
          timezone: timezone || null,
          active: true,
          visibility: "public",
          loadCapPerWeek: 5,
        })
        .returning();

      // Create expertise entries
      if (expertiseAreas && Array.isArray(expertiseAreas) && expertiseAreas.length > 0) {
        await db.insert(expertise).values(
          expertiseAreas.map((area: string) => ({
            mentorId: newMentor.id,
            area: area,
            subarea: null,
          }))
        );
      }

      // Enqueue Airtable sync
      await enqueueAirtableSync("mentor", newMentor.id, "upsert");
    } else if (role === "mentee") {
      // Create mentee profile
      await db.insert(mentees).values({
        userId: newUser.id,
        company: company || null,
        stage: stage || null,
        industry: industry || null,
        goals: goals || null,
      });
    }

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

