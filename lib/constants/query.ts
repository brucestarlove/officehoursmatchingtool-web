/**
 * Query Configuration Constants
 * 
 * Centralized cache and query configuration values for TanStack Query
 */

// Cache stale times (in milliseconds)
export const QUERY_STALE_TIMES = {
  /** Short-lived data that changes frequently (e.g., availability) */
  SHORT: 2 * 60 * 1000, // 2 minutes
  
  /** Standard data that changes occasionally (e.g., sessions, mentors) */
  STANDARD: 5 * 60 * 1000, // 5 minutes
  
  /** Long-lived data that rarely changes (e.g., mentor details) */
  LONG: 10 * 60 * 1000, // 10 minutes
} as const;

// Query retry configuration
export const QUERY_RETRY = {
  /** Disable retries for auth queries (fail fast) */
  NONE: false,
  
  /** Default retry count */
  DEFAULT: 1,
} as const;

