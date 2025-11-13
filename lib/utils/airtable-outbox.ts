/**
 * Outbox pattern utilities for Airtable sync
 * Enqueues sync tasks when mentor profiles are updated in the app
 */

import { db } from "@/lib/db";
import { outbox } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type OutboxAction = "upsert" | "delete";
export type OutboxEntityType = "mentor" | "mentee";

/**
 * Enqueue an Airtable sync task for an entity
 */
export async function enqueueAirtableSync(
  entityType: OutboxEntityType,
  entityId: string,
  action: OutboxAction = "upsert",
  payload?: Record<string, any>
): Promise<void> {
  try {
    await db.insert(outbox).values({
      entityType,
      entityId,
      action,
      payloadJson: JSON.stringify(payload || {}),
      status: "pending",
      attempts: 0,
    });
  } catch (error: any) {
    console.error(
      `Failed to enqueue Airtable sync for ${entityType} ${entityId}:`,
      error
    );
    // Don't throw - outbox failures shouldn't break the main operation
  }
}

/**
 * Get pending outbox items for processing
 */
export async function getPendingOutboxItems(limit: number = 50) {
  return await db.query.outbox.findMany({
    where: (outbox, { eq }) => eq(outbox.status, "pending"),
    orderBy: (outbox, { asc }) => [asc(outbox.createdAt)],
    limit,
  });
}

/**
 * Mark outbox item as processing
 */
export async function markOutboxProcessing(outboxId: string): Promise<void> {
  await db
    .update(outbox)
    .set({
      status: "processing",
      updatedAt: new Date(),
    })
    .where(eq(outbox.id, outboxId));
}

/**
 * Mark outbox item as completed
 */
export async function markOutboxCompleted(outboxId: string): Promise<void> {
  await db
    .update(outbox)
    .set({
      status: "completed",
      updatedAt: new Date(),
    })
    .where(eq(outbox.id, outboxId));
}

/**
 * Mark outbox item as failed
 */
export async function markOutboxFailed(
  outboxId: string,
  errorMessage: string
): Promise<void> {
  const item = await db.query.outbox.findFirst({
    where: eq(outbox.id, outboxId),
  });

  if (!item) {
    return;
  }

  const newAttempts = item.attempts + 1;
  const maxAttempts = 3;

  await db
    .update(outbox)
    .set({
      status: newAttempts >= maxAttempts ? "failed" : "pending",
      attempts: newAttempts,
      errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(outbox.id, outboxId));
}

