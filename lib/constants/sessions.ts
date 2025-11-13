/**
 * Session Constants
 * 
 * Centralized session-related constants
 */

export const SESSION_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

export const MEETING_TYPE = {
  VIDEO: "video",
  IN_PERSON: "in-person",
} as const;

export type MeetingType = typeof MEETING_TYPE[keyof typeof MEETING_TYPE];

// Default session duration (in minutes)
export const DEFAULT_SESSION_DURATION = 60;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;

