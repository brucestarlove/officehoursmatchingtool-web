/**
 * GET /api/cron/airtable-sync
 * Vercel Cron job for outbound Airtable sync
 * Processes pending outbox items and syncs mentor profiles to Airtable
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mentors, users, expertise, airtableSyncMetadata } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getPendingOutboxItems,
  markOutboxProcessing,
  markOutboxCompleted,
  markOutboxFailed,
} from "@/lib/utils/airtable-outbox";
import {
  upsertAirtableRecord,
  mapMentorToAirtableFields,
} from "@/lib/api/airtable";
import {
  calculateMentorUtilization,
  calculateAvgFeedback,
} from "@/lib/utils/analytics";
import { AIRTABLE_CONFIG } from "@/lib/constants/airtable-mappings";
import { createErrorResponse } from "@/lib/utils/api-errors";

/**
 * Verify cron secret for security
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // In development, allow without secret
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get pending outbox items
    const pendingItems = await getPendingOutboxItems(50);
    
    if (pendingItems.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        succeeded: 0,
        failed: 0,
        message: "No pending items to sync",
      });
    }

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ itemId: string; error: string }>,
    };

    // Process each outbox item
    for (const item of pendingItems) {
      try {
        // Mark as processing
        await markOutboxProcessing(item.id);

        if (item.entityType === "mentor") {
          // Fetch full mentor record with related data
          const mentor = await db.query.mentors.findFirst({
            where: eq(mentors.id, item.entityId),
            with: {
              user: true,
              expertise: true,
            },
          });

          if (!mentor) {
            throw new Error(`Mentor ${item.entityId} not found`);
          }

          // Calculate computed fields
          const utilization = await calculateMentorUtilization(mentor.id, 30);
          const avgFeedback = await calculateAvgFeedback(mentor.id, 90);

          // Map to Airtable fields
          const airtableFields = mapMentorToAirtableFields({
            name: mentor.user?.name || null,
            headline: mentor.headline,
            bio: mentor.bio,
            company: mentor.company,
            title: mentor.title,
            active: mentor.active,
            expertise: mentor.expertise || [],
            industry: mentor.industry,
            stage: mentor.stage,
            timezone: mentor.timezone,
            utilization,
            avgFeedback,
            email: mentor.user?.email || null,
          });

          // Get or create sync metadata
          const metadata = await db.query.airtableSyncMetadata.findFirst({
            where: eq(airtableSyncMetadata.entityId, mentor.id),
          });

          const airtableRecordId = metadata?.airtableRecordId || mentor.airtableRecordId;

          // Upsert to Airtable
          const updatedRecordId = await upsertAirtableRecord(
            AIRTABLE_CONFIG.MENTORS_TABLE_ID,
            airtableRecordId || null,
            airtableFields
          );

          // Update sync metadata
          if (metadata) {
            await db
              .update(airtableSyncMetadata)
              .set({
                airtableRecordId: updatedRecordId,
                lastSyncedAt: new Date(),
                syncVersion: mentor.syncVersion,
                updatedAt: new Date(),
              })
              .where(eq(airtableSyncMetadata.id, metadata.id));
          } else {
            await db.insert(airtableSyncMetadata).values({
              entityType: "mentor",
              entityId: mentor.id,
              airtableRecordId: updatedRecordId,
              lastSyncedAt: new Date(),
              syncVersion: mentor.syncVersion,
            });
          }

          // Update mentor's airtableRecordId if it was null
          if (!mentor.airtableRecordId) {
            await db
              .update(mentors)
              .set({ airtableRecordId: updatedRecordId })
              .where(eq(mentors.id, mentor.id));
          }

          // Mark outbox item as completed
          await markOutboxCompleted(item.id);
          results.succeeded++;
        } else {
          // For now, only mentors are supported
          throw new Error(`Unsupported entity type: ${item.entityType}`);
        }

        results.processed++;
      } catch (error: any) {
        console.error(`Error processing outbox item ${item.id}:`, error);
        await markOutboxFailed(item.id, error.message);
        results.failed++;
        results.errors.push({
          itemId: item.id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error("Airtable sync cron error:", error);
    return createErrorResponse(error);
  }
}

