/**
 * Seed data constants for development
 */

import type { InferInsertModel } from "drizzle-orm";
import { users, mentors, mentees, expertise, availability } from "./schema";

export type UserSeed = InferInsertModel<typeof users>;
export type MentorSeed = InferInsertModel<typeof mentors>;
export type MenteeSeed = InferInsertModel<typeof mentees>;
export type ExpertiseSeed = InferInsertModel<typeof expertise>;
export type AvailabilitySeed = InferInsertModel<typeof availability>;

// Default password for all seeded users (change in production!)
export const DEFAULT_SEED_PASSWORD = "Password123!";

// User seed data with passwords
export interface UserSeedWithPassword {
  email: string;
  name: string;
  password: string;
  role: "mentor" | "mentee" | "admin" | "pm";
  status: "active" | "inactive" | "suspended";
}

// Sample mentor users
export const mentorUsersWithPasswords: UserSeedWithPassword[] = [
  {
    email: "mentor1@example.com",
    name: "John Smith",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentor",
    status: "active",
  },
  {
    email: "mentor2@example.com",
    name: "Sarah Johnson",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentor",
    status: "active",
  },
  {
    email: "mentor3@example.com",
    name: "Michael Chen",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentor",
    status: "active",
  },
  {
    email: "mentor4@example.com",
    name: "Emily Davis",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentor",
    status: "active",
  },
  {
    email: "mentor5@example.com",
    name: "David Wilson",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentor",
    status: "active",
  },
];

// Sample mentee users
export const menteeUsersWithPasswords: UserSeedWithPassword[] = [
  {
    email: "mentee1@example.com",
    name: "Alice Brown",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentee",
    status: "active",
  },
  {
    email: "mentee2@example.com",
    name: "Bob Martinez",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentee",
    status: "active",
  },
  {
    email: "mentee3@example.com",
    name: "Carol Taylor",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentee",
    status: "active",
  },
  {
    email: "mentee4@example.com",
    name: "Daniel Anderson",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentee",
    status: "active",
  },
  {
    email: "mentee5@example.com",
    name: "Eva Garcia",
    password: DEFAULT_SEED_PASSWORD,
    role: "mentee",
    status: "active",
  },
];

// Sample admin user
export const adminUserWithPassword: UserSeedWithPassword = {
  email: "admin@example.com",
  name: "Admin User",
  password: DEFAULT_SEED_PASSWORD,
  role: "admin",
  status: "active",
};

// Legacy exports for backward compatibility (without passwords)
export const mentorUsers: UserSeed[] = mentorUsersWithPasswords.map(
  ({ password, ...user }) => user
);

export const menteeUsers: UserSeed[] = menteeUsersWithPasswords.map(
  ({ password, ...user }) => user
);

export const adminUser: UserSeed = (() => {
  const { password, ...user } = adminUserWithPassword;
  return user;
})();

// Sample expertise areas
export const expertiseAreas = [
  "Fundraising",
  "Product Development",
  "Marketing",
  "Sales",
  "Operations",
  "Technology",
  "Legal",
  "Finance",
  "HR",
  "Strategy",
];

// Helper function to generate availability slots for next 2 weeks
export function generateAvailabilitySlots(
  mentorId: string,
  count: number = 10
): AvailabilitySeed[] {
  const slots: AvailabilitySeed[] = [];
  const now = new Date();
  
  // Start from tomorrow
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(9, 0, 0, 0); // 9 AM

  for (let i = 0; i < count; i++) {
    const slotDate = new Date(startDate);
    slotDate.setDate(startDate.getDate() + Math.floor(i / 2)); // 2 slots per day
    
    // Alternate between 9 AM and 2 PM
    const hour = i % 2 === 0 ? 9 : 14;
    slotDate.setHours(hour, 0, 0, 0);
    
    const endDate = new Date(slotDate);
    endDate.setHours(hour + 1, 0, 0, 0); // 1 hour slots

    slots.push({
      mentorId,
      startsAt: slotDate,
      endsAt: endDate,
      capacity: 1,
      location: "virtual",
    });
  }

  return slots;
}

