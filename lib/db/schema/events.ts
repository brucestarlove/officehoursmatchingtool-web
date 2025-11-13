import { pgTable, bigserial, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Events table
 * Audit log for tracking system events
 */
export const events = pgTable("events", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  type: text("type").notNull(),
  entity: text("entity"),
  entityId: uuid("entity_id"),
  props: jsonb("props").default({}),
});

