/**
 * Field mappings between Postgres and Airtable
 * Maps Postgres column names to Airtable field names
 */

// Postgres → Airtable field name mapping
export const MENTOR_FIELD_MAP = {
  // Basic profile fields
  name: "Name",
  headline: "Headline",
  bio: "Bio",
  company: "Company",
  title: "Title",
  active: "Is Active",
  // Computed fields (read-only in Airtable)
  utilization: "Utilization",
  avgFeedback: "Avg Feedback",
  // Metadata
  lastSynced: "Last Synced",
} as const;

// Airtable → Postgres field name mapping (reverse)
export const AIRTABLE_TO_POSTGRES_MAP = {
  Name: "name",
  Headline: "headline",
  Bio: "bio",
  Company: "company",
  Title: "title",
  "Is Active": "active",
} as const;

// Multi-select fields that need special handling
export const AIRTABLE_MULTI_SELECT_FIELDS = {
  expertise: "Expertise",
  industries: "Industries",
  stage: "Stage Focus",
} as const;

// Airtable field IDs from the base (for API calls)
export const AIRTABLE_FIELD_IDS = {
  Email: "fld2dhuLTWiB2wgq8",
  Name: "flddqTli7WL3RU95x",
  Headline: "fldLEzulh989noaoC",
  Bio: "fldqpr8ebWG93KvNn",
  Company: "fldI8CKJrvI0jfPRs",
  Title: "fldyfrUxJFSVCU2G6",
  Expertise: "fld6pMard3uEXNehH",
  Industries: "fldFBYy1Lwgmy4eai",
  "Stage Focus": "fldAaQReFvr7V3e17",
  Select: "fldaFoAgSFRWJewuV", // Timezone
  "Is Active": "fldOLZWiY3ZouhfeW",
  "Last Synced": "fldggEbkGG0J4eFpg",
  Utilization: "fldZuNyEuTvAvvgK3",
  "Avg Feedback": "fldlheGAIFE7gcCQE",
} as const;

// Airtable base and table configuration
export const AIRTABLE_CONFIG = {
  BASE_ID: process.env.AIRTABLE_BASE_ID || "app84nk8zRrr5Ofog",
  MENTORS_TABLE_ID: process.env.AIRTABLE_MENTORS_TABLE_ID || "tblujd35OaEmoBjoV",
} as const;

