/**
 * POST /api/webhooks/airtable
 * Receives webhooks from Airtable when mentor records are updated
 * Verifies HMAC signature and syncs changes to Postgres
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { mentors, expertise, airtableSyncMetadata } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { mapAirtableToMentorFields } from "@/lib/api/airtable";
import { createErrorResponse } from "@/lib/utils/api-errors";

/**
 * Verify HMAC-SHA256 signature from Airtable webhook
 */
function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  const secret = process.env.AIRTABLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("AIRTABLE_WEBHOOK_SECRET environment variable is not set");
  }

  if (!signature) {
    return false;
  }

  // Compute HMAC-SHA256 hash
  const computed = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");

  // Compare signatures using constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}

/**
 * Parse Airtable webhook payload
 * Airtable sends webhook data in format:
 * {
 *   base: { id: "...", name: "..." },
 *   webhook: { id: "...", ... },
 *   event: { ... },
 *   timestamp: "..."
 * }
 */
interface AirtableWebhookPayload {
  base?: { id: string };
  webhook?: { id: string };
  event?: {
    payload?: {
      changedTablesById?: Record<
        string,
        {
          changedRecordsById?: Record<
            string,
            {
              current?: {
                id?: string;
                fields?: Record<string, any>;
              };
              previous?: {
                id?: string;
                fields?: Record<string, any>;
              };
            }
          >;
        }
      >;
    };
  };
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-airtable-signature");

    // Verify signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload: AirtableWebhookPayload = JSON.parse(body);

    // Extract changed records from the payload
    const changedTables =
      payload.event?.payload?.changedTablesById || {};
    const mentorsTableId = process.env.AIRTABLE_MENTORS_TABLE_ID || "tblujd35OaEmoBjoV";

    const changedMentors = changedTables[mentorsTableId]?.changedRecordsById;
    if (!changedMentors) {
      // No mentor records changed, return success
      return NextResponse.json({ success: true, message: "No mentor changes" });
    }

    // Process each changed mentor record
    const results = [];
    for (const [recordId, change] of Object.entries(changedMentors)) {
      try {
        const currentFields = change.current?.fields || {};
        const recordIdFromPayload = change.current?.id || recordId;

        // Map Airtable fields to Postgres columns
        const mentorUpdates = mapAirtableToMentorFields(currentFields);

        // Find existing mentor by airtableRecordId
        const existingMentor = await db.query.mentors.findFirst({
          where: eq(mentors.airtableRecordId, recordIdFromPayload),
        });

        if (existingMentor) {
          // Update existing mentor
          await db
            .update(mentors)
            .set({
              ...mentorUpdates,
              syncVersion: existingMentor.syncVersion + 1,
              updatedAt: new Date(),
            })
            .where(eq(mentors.id, existingMentor.id));

          // Update expertise if provided
          if (mentorUpdates.expertise) {
            // Delete existing expertise
            await db
              .delete(expertise)
              .where(eq(expertise.mentorId, existingMentor.id));

            // Insert new expertise
            if (mentorUpdates.expertise.length > 0) {
              await db.insert(expertise).values(
                mentorUpdates.expertise.map((e) => ({
                  mentorId: existingMentor.id,
                  area: e.area,
                  subarea: e.subarea,
                }))
              );
            }
          }

          // Update sync metadata
          const existingMetadata = await db.query.airtableSyncMetadata.findFirst({
            where: eq(airtableSyncMetadata.entityId, existingMentor.id),
          });

          if (existingMetadata) {
            await db
              .update(airtableSyncMetadata)
              .set({
                lastSyncedAt: new Date(),
                syncVersion: existingMentor.syncVersion + 1,
                updatedAt: new Date(),
              })
              .where(eq(airtableSyncMetadata.id, existingMetadata.id));
          } else {
            await db.insert(airtableSyncMetadata).values({
              entityType: "mentor",
              entityId: existingMentor.id,
              airtableRecordId: recordIdFromPayload,
              lastSyncedAt: new Date(),
              syncVersion: existingMentor.syncVersion + 1,
            });
          }

          results.push({ recordId: recordIdFromPayload, status: "updated" });
        } else {
          // New mentor record - we'll need to match by email or create
          // For MVP, we'll log this and skip (mentors should be created in app first)
          console.warn(
            `Airtable webhook: Record ${recordIdFromPayload} not found in Postgres. Skipping.`
          );
          results.push({
            recordId: recordIdFromPayload,
            status: "skipped",
            reason: "Mentor not found in Postgres",
          });
        }
      } catch (error: any) {
        console.error(
          `Error processing Airtable webhook for record ${change.current?.id}:`,
          error
        );
        results.push({
          recordId: change.current?.id || "unknown",
          status: "error",
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Airtable webhook error:", error);
    return createErrorResponse(error);
  }
}

