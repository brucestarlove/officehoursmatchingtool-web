import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

/**
 * Mentees table
 */
export const mentees = pgTable("mentees", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  company: text("company"),
  stage: text("stage"),
  industry: text("industry"),
  goals: text("goals"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const menteesRelations = relations(mentees, ({ one }) => ({
  user: one(users, {
    fields: [mentees.userId],
    references: [users.id],
  }),
}));

