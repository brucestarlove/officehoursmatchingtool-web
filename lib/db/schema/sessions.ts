import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mentors } from "./mentors";
import { mentees } from "./mentees";
import { reviews } from "./reviews";

// Session status enum - updated to match frontend types
export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
]);

// Meeting type enum
export const meetingTypeEnum = pgEnum("meeting_type", [
  "video",
  "in-person",
]);

/**
 * Office sessions table
 * Represents booked office hours sessions between mentors and mentees
 */
export const officeSessions = pgTable("office_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  mentorId: uuid("mentor_id")
    .references(() => mentors.id, { onDelete: "cascade" })
    .notNull(),
  menteeId: uuid("mentee_id")
    .references(() => mentees.id, { onDelete: "cascade" })
    .notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  duration: integer("duration").notNull(), // Duration in minutes
  status: sessionStatusEnum("status").default("scheduled").notNull(),
  meetingType: meetingTypeEnum("meeting_type").default("video").notNull(),
  meetingUrl: text("meeting_url"),
  goals: text("goals"), // Session goals/agenda
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Availability table
 * Represents available time slots for mentors
 */
export const availability = pgTable("availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  mentorId: uuid("mentor_id")
    .references(() => mentors.id, { onDelete: "cascade" })
    .notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  capacity: integer("capacity").default(1).notNull(),
  location: text("location").default("virtual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const officeSessionsRelations = relations(officeSessions, ({ one, many }) => ({
  mentor: one(mentors, {
    fields: [officeSessions.mentorId],
    references: [mentors.id],
  }),
  mentee: one(mentees, {
    fields: [officeSessions.menteeId],
    references: [mentees.id],
  }),
  reviews: many(reviews),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  mentor: one(mentors, {
    fields: [availability.mentorId],
    references: [mentors.id],
  }),
}));

