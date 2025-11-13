/**
 * GET /api/health/airtable
 * Health check endpoint for Airtable connectivity
 */

import { NextRequest, NextResponse } from "next/server";
import { getAirtableRecord } from "@/lib/api/airtable";
import { AIRTABLE_CONFIG } from "@/lib/constants/airtable-mappings";

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are set
    // Support both AIRTABLE_PERSONAL_ACCESS_TOKEN and AIRTABLE_API_KEY
    const hasToken = !!(
      process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || process.env.AIRTABLE_API_KEY
    );
    
    const requiredEnvVars = [
      { name: "AIRTABLE_PERSONAL_ACCESS_TOKEN or AIRTABLE_API_KEY", present: hasToken },
      { name: "AIRTABLE_BASE_ID", present: !!process.env.AIRTABLE_BASE_ID },
      { name: "AIRTABLE_MENTORS_TABLE_ID", present: !!process.env.AIRTABLE_MENTORS_TABLE_ID },
    ];

    const missingVars = requiredEnvVars
      .filter((env) => !env.present)
      .map((env) => env.name);

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required environment variables",
          missing: missingVars,
        },
        { status: 500 }
      );
    }

    // Try to fetch a record from Airtable (this will fail if API key is invalid)
    // We'll use a dummy record ID - if it doesn't exist, that's fine, we just want to test connectivity
    try {
      // Attempt to list records (using a limit of 1 to minimize API usage)
      // Since we don't have a list endpoint, we'll try to get a non-existent record
      // which will return null but won't error if the API key is valid
      await getAirtableRecord(
        AIRTABLE_CONFIG.MENTORS_TABLE_ID,
        "rec00000000000000" // Dummy record ID
      );

      return NextResponse.json({
        status: "healthy",
        message: "Airtable API connectivity verified",
        config: {
          baseId: AIRTABLE_CONFIG.BASE_ID,
          mentorsTableId: AIRTABLE_CONFIG.MENTORS_TABLE_ID,
        },
      });
    } catch (error: any) {
      // If we get a 401 or 403, it's an auth issue
      if (error.message?.includes("401") || error.message?.includes("403")) {
        return NextResponse.json(
          {
            status: "error",
            message: "Airtable API authentication failed",
            error: error.message,
          },
          { status: 401 }
        );
      }

      // Other errors might be network issues or API problems
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to connect to Airtable API",
          error: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

