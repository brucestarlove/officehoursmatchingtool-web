/**
 * Airtable API client
 * Handles REST API calls to Airtable for bidirectional sync
 */

import axios, { AxiosInstance } from "axios";
import {
  AIRTABLE_CONFIG,
  MENTOR_FIELD_MAP,
  AIRTABLE_MULTI_SELECT_FIELDS,
} from "@/lib/constants/airtable-mappings";

// Rate limit: 5 requests per second per base
const RATE_LIMIT_DELAY_MS = 200; // 200ms = 5 req/sec
let lastRequestTime = 0;

/**
 * Create rate-limited axios instance for Airtable API
 * 
 * Authentication: Uses a Personal Access Token (PAT) from Airtable
 * To create a PAT:
 * 1. Go to https://airtable.com/create/tokens
 * 2. Create a new token with scopes: data.records:read, data.records:write
 * 3. Grant access to your base (app84nk8zRrr5Ofog)
 * 4. Copy the token (starts with "pat...")
 * 5. Set it as AIRTABLE_PERSONAL_ACCESS_TOKEN or AIRTABLE_API_KEY in your environment
 */
function createAirtableClient(): AxiosInstance {
  // Support both environment variable names for flexibility
  const apiKey = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || process.env.AIRTABLE_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "Airtable authentication token is not set. " +
      "Please set AIRTABLE_PERSONAL_ACCESS_TOKEN or AIRTABLE_API_KEY environment variable. " +
      "Create a Personal Access Token at https://airtable.com/create/tokens"
    );
  }

  // Validate token format (PATs start with "pat")
  if (!apiKey.startsWith("pat")) {
    console.warn(
      "Warning: Airtable token should start with 'pat'. " +
      "Make sure you're using a Personal Access Token, not an API key."
    );
  }

  const client = axios.create({
    baseURL: `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  // Rate limiting interceptor
  client.interceptors.request.use(async (config) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, RATE_LIMIT_DELAY_MS - timeSinceLastRequest)
      );
    }
    lastRequestTime = Date.now();
    return config;
  });

  return client;
}

/**
 * Get Airtable record by record ID
 */
export async function getAirtableRecord(
  tableId: string,
  recordId: string
): Promise<any | null> {
  try {
    const client = createAirtableClient();
    const response = await client.get(`/${tableId}/${recordId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(`Failed to get Airtable record: ${error.message}`);
  }
}

/**
 * Upsert Airtable record (create or update)
 */
export async function upsertAirtableRecord(
  tableId: string,
  recordId: string | null,
  fields: Record<string, any>
): Promise<string> {
  const client = createAirtableClient();

  try {
    if (recordId) {
      // Update existing record
      const response = await client.patch(`/${tableId}/${recordId}`, {
        fields,
      });
      return response.data.id;
    } else {
      // Create new record
      const response = await client.post(`/${tableId}`, {
        fields,
      });
      return response.data.id;
    }
  } catch (error: any) {
    throw new Error(`Failed to upsert Airtable record: ${error.message}`);
  }
}

/**
 * Batch update multiple records
 * Handles rate limits by chunking requests
 */
export async function batchUpdateRecords(
  tableId: string,
  records: Array<{ id?: string; fields: Record<string, any> }>
): Promise<Array<{ id: string }>> {
  const client = createAirtableClient();
  const chunkSize = 10; // Airtable allows up to 10 records per batch
  const results: Array<{ id: string }> = [];

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    try {
      const response = await client.patch(`/${tableId}`, {
        records: chunk,
      });
      results.push(...response.data.records);
    } catch (error: any) {
      throw new Error(`Failed to batch update records: ${error.message}`);
    }
  }

  return results;
}

/**
 * Map Postgres mentor data to Airtable fields
 */
export function mapMentorToAirtableFields(mentor: {
  name?: string | null;
  headline?: string | null;
  bio?: string | null;
  company?: string | null;
  title?: string | null;
  active?: boolean | null;
  expertise?: Array<{ area: string; subarea?: string | null }>;
  industry?: string | null;
  stage?: string | null;
  timezone?: string | null;
  utilization?: number | null;
  avgFeedback?: number | null;
  email?: string | null;
}): Record<string, any> {
  const fields: Record<string, any> = {};

  // Basic fields
  if (mentor.name !== undefined && mentor.name !== null) {
    fields[MENTOR_FIELD_MAP.name] = mentor.name;
  }
  if (mentor.headline !== undefined && mentor.headline !== null) {
    fields[MENTOR_FIELD_MAP.headline] = mentor.headline;
  }
  if (mentor.bio !== undefined && mentor.bio !== null) {
    fields[MENTOR_FIELD_MAP.bio] = mentor.bio;
  }
  if (mentor.company !== undefined && mentor.company !== null) {
    fields[MENTOR_FIELD_MAP.company] = mentor.company;
  }
  if (mentor.title !== undefined && mentor.title !== null) {
    fields[MENTOR_FIELD_MAP.title] = mentor.title;
  }
  if (mentor.active !== undefined && mentor.active !== null) {
    fields[MENTOR_FIELD_MAP.active] = mentor.active;
  }

  // Multi-select fields
  if (mentor.expertise && mentor.expertise.length > 0) {
    // Map expertise array to Airtable multi-select format
    // Airtable expects array of strings matching the option names
    fields[AIRTABLE_MULTI_SELECT_FIELDS.expertise] = mentor.expertise.map(
      (e) => e.area + (e.subarea ? ` - ${e.subarea}` : "")
    );
  }

  if (mentor.industry) {
    // Industry might be stored as comma-separated or array
    const industries = Array.isArray(mentor.industry)
      ? mentor.industry
      : mentor.industry.split(",").map((i) => i.trim());
    if (industries.length > 0) {
      fields[AIRTABLE_MULTI_SELECT_FIELDS.industries] = industries;
    }
  }

  if (mentor.stage) {
    fields[AIRTABLE_MULTI_SELECT_FIELDS.stage] = [mentor.stage];
  }

  // Timezone (single select)
  if (mentor.timezone) {
    fields["Select"] = mentor.timezone;
  }

  // Computed fields (read-only)
  if (mentor.utilization !== undefined && mentor.utilization !== null) {
    fields[MENTOR_FIELD_MAP.utilization] = mentor.utilization;
  }
  if (mentor.avgFeedback !== undefined && mentor.avgFeedback !== null) {
    fields[MENTOR_FIELD_MAP.avgFeedback] = mentor.avgFeedback;
  }

  // Email (for linking/identification)
  if (mentor.email) {
    fields["Email"] = mentor.email;
  }

  // Last Synced timestamp
  fields[MENTOR_FIELD_MAP.lastSynced] = new Date().toISOString();

  return fields;
}

/**
 * Map Airtable fields to Postgres mentor data
 */
export function mapAirtableToMentorFields(airtableFields: Record<string, any>): {
  headline?: string;
  bio?: string;
  company?: string;
  title?: string;
  active?: boolean;
  expertise?: Array<{ area: string; subarea?: string | null }>;
  industry?: string;
  stage?: string;
  timezone?: string;
} {
  const result: any = {};

  if (airtableFields[MENTOR_FIELD_MAP.headline]) {
    result.headline = airtableFields[MENTOR_FIELD_MAP.headline];
  }
  if (airtableFields[MENTOR_FIELD_MAP.bio]) {
    result.bio = airtableFields[MENTOR_FIELD_MAP.bio];
  }
  if (airtableFields[MENTOR_FIELD_MAP.company]) {
    result.company = airtableFields[MENTOR_FIELD_MAP.company];
  }
  if (airtableFields[MENTOR_FIELD_MAP.title]) {
    result.title = airtableFields[MENTOR_FIELD_MAP.title];
  }
  if (airtableFields[MENTOR_FIELD_MAP.active] !== undefined) {
    result.active = airtableFields[MENTOR_FIELD_MAP.active];
  }

  // Parse multi-select fields
  if (airtableFields[AIRTABLE_MULTI_SELECT_FIELDS.expertise]) {
    const expertiseArray = Array.isArray(
      airtableFields[AIRTABLE_MULTI_SELECT_FIELDS.expertise]
    )
      ? airtableFields[AIRTABLE_MULTI_SELECT_FIELDS.expertise]
      : [];
    result.expertise = expertiseArray.map((e: string) => {
      // Parse "Area - Subarea" format
      const parts = e.split(" - ");
      return {
        area: parts[0],
        subarea: parts[1] || null,
      };
    });
  }

  if (airtableFields[AIRTABLE_MULTI_SELECT_FIELDS.industries]) {
    const industries = airtableFields[AIRTABLE_MULTI_SELECT_FIELDS.industries];
    result.industry = Array.isArray(industries)
      ? industries.join(",")
      : industries;
  }

  if (airtableFields[AIRTABLE_MULTI_SELECT_FIELDS.stage]) {
    const stage = airtableFields[AIRTABLE_MULTI_SELECT_FIELDS.stage];
    result.stage = Array.isArray(stage) ? stage[0] : stage;
  }

  if (airtableFields["Select"]) {
    result.timezone = airtableFields["Select"];
  }

  return result;
}

