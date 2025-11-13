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
import { officeSessions } from "./sessions";

/**
 * Reviews/Feedback table
 * Represents feedback submitted by mentees after sessions
 */
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => officeSessions.id, { onDelete: "cascade" })
    .notNull(),
  mentorId: uuid("mentor_id")
    .references(() => mentors.id, { onDelete: "cascade" })
    .notNull(),
  menteeId: uuid("mentee_id")
    .references(() => mentees.id, { onDelete: "cascade" })
    .notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  outcomeTags: text("outcome_tags").array(), // Array of outcome tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  session: one(officeSessions, {
    fields: [reviews.sessionId],
    references: [officeSessions.id],
  }),
  mentor: one(mentors, {
    fields: [reviews.mentorId],
    references: [mentors.id],
  }),
  mentee: one(mentees, {
    fields: [reviews.menteeId],
    references: [mentees.id],
  }),
}));

