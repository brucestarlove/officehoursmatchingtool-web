/**
 * Database seed script
 * Populates the database with development data
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import {
  users,
  mentors,
  mentees,
  expertise,
  availability,
  officeSessions,
} from "./schema";
import {
  mentorUsersWithPasswords,
  menteeUsersWithPasswords,
  adminUserWithPassword,
  expertiseAreas,
  generateAvailabilitySlots,
  DEFAULT_SEED_PASSWORD,
} from "./seed-data";
import { logger } from "@/lib/utils/logger";
import bcrypt from "bcryptjs";

// Use Pool for seed scripts (better compatibility with Drizzle operations)
// Pool works better than serverless client for Node.js scripts
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

// Helper function for raw SQL queries
const sql = (query: string) => pool.query(query);

async function seed() {
  try {
    logger.info("Starting database seed...");

    // Clear existing data (in reverse order of dependencies)
    // Use raw SQL for truncation
    logger.info("Clearing existing data...");
    
    // Truncate tables in reverse dependency order
    // Using CASCADE to handle foreign key constraints
    await sql("TRUNCATE TABLE availability CASCADE");
    await sql("TRUNCATE TABLE expertise CASCADE");
    await sql("TRUNCATE TABLE office_sessions CASCADE");
    await sql("TRUNCATE TABLE mentors CASCADE");
    await sql("TRUNCATE TABLE mentees CASCADE");
    await sql("TRUNCATE TABLE users CASCADE");
    
    // Also clear NextAuth tables
    await sql("TRUNCATE TABLE accounts CASCADE");
    await sql("TRUNCATE TABLE sessions CASCADE");
    await sql("TRUNCATE TABLE verification_tokens CASCADE");

    // Create users with passwords using NextAuth signup flow
    logger.info("Creating users with passwords...");

    // Helper function to create user with password
    async function createUserWithPassword(
      email: string,
      password: string,
      name: string,
      role: "mentor" | "mentee" | "admin" | "pm",
      status: "active" | "inactive" | "suspended" = "active"
    ) {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with password hash
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          name,
          passwordHash: hashedPassword,
          role,
          status,
        })
        .returning();

      return newUser;
    }

    // Create admin user
    logger.info("Creating admin user...");
    const admin = await createUserWithPassword(
      adminUserWithPassword.email,
      adminUserWithPassword.password,
      adminUserWithPassword.name,
      adminUserWithPassword.role,
      adminUserWithPassword.status
    );
    logger.info(`Created admin user: ${admin.email}`);

    // Create mentor users
    logger.info("Creating mentor users...");
    const insertedMentorUsers = await Promise.all(
      mentorUsersWithPasswords.map((userData) =>
        createUserWithPassword(
          userData.email,
          userData.password,
          userData.name,
          userData.role,
          userData.status
        )
      )
    );
    logger.info(`Created ${insertedMentorUsers.length} mentor users`);

    // Create mentee users
    logger.info("Creating mentee users...");
    const insertedMenteeUsers = await Promise.all(
      menteeUsersWithPasswords.map((userData) =>
        createUserWithPassword(
          userData.email,
          userData.password,
          userData.name,
          userData.role,
          userData.status
        )
      )
    );
    logger.info(`Created ${insertedMenteeUsers.length} mentee users`);

    // Create mentor profiles
    logger.info("Creating mentor profiles...");
    const mentorProfiles = await Promise.all(
      insertedMentorUsers.map(async (user, index) => {
        const [mentor] = await db
          .insert(mentors)
          .values({
            userId: user.id,
            headline: `Experienced ${expertiseAreas[index % expertiseAreas.length]} Expert`,
            bio: `I have ${5 + index} years of experience in ${expertiseAreas[index % expertiseAreas.length]}. I'm passionate about helping startups succeed.`,
            company: `Company ${index + 1}`,
            title: `Senior ${expertiseAreas[index % expertiseAreas.length]}`,
            industry: "Technology",
            stage: "Series A",
            timezone: "America/New_York",
            active: true,
          })
          .returning();

        // Add expertise areas
        const mentorExpertise = [
          expertiseAreas[index % expertiseAreas.length],
          expertiseAreas[(index + 1) % expertiseAreas.length],
        ];

        await db.insert(expertise).values(
          mentorExpertise.map((area) => ({
            mentorId: mentor.id,
            area,
            weight: 1.0,
          }))
        );

        // Add availability slots
        const slots = generateAvailabilitySlots(mentor.id, 10);
        await db.insert(availability).values(slots);

        return mentor;
      })
    );
    logger.info(`Created ${mentorProfiles.length} mentor profiles`);

    // Create mentee profiles
    logger.info("Creating mentee profiles...");
    const menteeProfiles = await Promise.all(
      insertedMenteeUsers.map(async (user, index) => {
        const [mentee] = await db
          .insert(mentees)
          .values({
            userId: user.id,
            company: `Startup ${index + 1}`,
            stage: "Seed",
            industry: "Technology",
            goals: `Looking for guidance on ${expertiseAreas[index % expertiseAreas.length]}`,
          })
          .returning();

        return mentee;
      })
    );
    logger.info(`Created ${menteeProfiles.length} mentee profiles`);

    logger.info("Database seed completed successfully!");
    logger.info(`Summary:
      - Users: ${insertedMentorUsers.length + insertedMenteeUsers.length + 1}
      - Mentors: ${mentorProfiles.length}
      - Mentees: ${menteeProfiles.length}
      - Expertise entries: ${mentorProfiles.length * 2}
      - Availability slots: ${mentorProfiles.length * 10}
      
    All users have been created with the default password: ${DEFAULT_SEED_PASSWORD}
    You can log in with any of the seeded email addresses using this password.
    `);
  } catch (error) {
    logger.error("Error seeding database:", error);
    throw error;
  } finally {
    // Close the pool connection
    await pool.end();
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

export default seed;
