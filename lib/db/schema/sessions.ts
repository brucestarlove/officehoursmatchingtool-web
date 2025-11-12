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

// Session status enum
export const sessionStatusEnum = pgEnum("session_status", [
  "pending",
  "booked",
  "completed",
  "cancelled",
  "no_show",
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
  status: sessionStatusEnum("status").default("booked").notNull(),
  meetingUrl: text("meeting_url"),
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
export const officeSessionsRelations = relations(officeSessions, ({ one }) => ({
  mentor: one(mentors, {
    fields: [officeSessions.mentorId],
    references: [mentors.id],
  }),
  mentee: one(mentees, {
    fields: [officeSessions.menteeId],
    references: [mentees.id],
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  mentor: one(mentors, {
    fields: [availability.mentorId],
    references: [mentors.id],
  }),
}));

