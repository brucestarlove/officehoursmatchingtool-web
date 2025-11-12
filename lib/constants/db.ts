/**
 * Database-related constants
 */

export const DB_TABLES = {
  USERS: "users",
  ACCOUNTS: "accounts",
  SESSIONS: "sessions",
  VERIFICATION_TOKENS: "verification_tokens",
  MENTORS: "mentors",
  EXPERTISE: "expertise",
  MENTEES: "mentees",
  OFFICE_SESSIONS: "office_sessions",
  AVAILABILITY: "availability",
  EVENTS: "events",
} as const;

export const DB_CONSTRAINTS = {
  MAX_STRING_LENGTH: 255,
  MAX_TEXT_LENGTH: 10000,
} as const;

