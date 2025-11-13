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
  syncVersion: integer("sync_version").default(0).notNull(),
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

/**
 * Outbox table for outbound Airtable sync
 * Implements outbox pattern for reliable async sync
 */
export const outbox = pgTable("outbox", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: text("entity_type").notNull(), // 'mentor', 'mentee', etc.
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(), // 'upsert', 'delete'
  payloadJson: text("payload_json").notNull(), // JSON string of fields to sync
  status: text("status").default("pending").notNull(), // 'pending', 'processing', 'completed', 'failed'
  attempts: integer("attempts").default(0).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Airtable sync metadata table
 * Tracks sync state and version for conflict detection
 */
export const airtableSyncMetadata = pgTable("airtable_sync_metadata", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  airtableRecordId: text("airtable_record_id").notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  syncVersion: integer("sync_version").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

