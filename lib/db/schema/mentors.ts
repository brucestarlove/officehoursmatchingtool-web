import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { reviews } from "./reviews";

// Visibility enum
export const visibilityEnum = pgEnum("visibility", [
  "public",
  "private",
  "limited",
]);

/**
 * Mentors table
 */
export const mentors = pgTable("mentors", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  airtableRecordId: text("airtable_record_id").unique(),
  headline: text("headline"),
  bio: text("bio"),
  company: text("company"),
  title: text("title"),
  industry: text("industry"),
  stage: text("stage"),
  timezone: text("timezone"),
  visibility: visibilityEnum("visibility").default("public").notNull(),
  loadCapPerWeek: integer("load_cap_per_week").default(5).notNull(),
  active: boolean("active").default(true).notNull(),
  photoUrl: text("photo_url"),
  linkedinUrl: text("linkedin_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Expertise table
 * Many-to-one relationship with mentors
 */
export const expertise = pgTable("expertise", {
  id: uuid("id").defaultRandom().primaryKey(),
  mentorId: uuid("mentor_id")
    .references(() => mentors.id, { onDelete: "cascade" })
    .notNull(),
  area: text("area").notNull(),
  subarea: text("subarea"),
  weight: real("weight").default(1.0),
});

// Relations
export const mentorsRelations = relations(mentors, ({ one, many }) => ({
  user: one(users, {
    fields: [mentors.userId],
    references: [users.id],
  }),
  expertise: many(expertise),
  reviews: many(reviews),
}));

export const expertiseRelations = relations(expertise, ({ one }) => ({
  mentor: one(mentors, {
    fields: [expertise.mentorId],
    references: [mentors.id],
  }),
}));

