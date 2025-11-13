/**
 * Authentication-related constants
 */

export const AUTH_ROLES = {
  MENTOR: "mentor",
  MENTEE: "mentee",
  ADMIN: "admin",
  PM: "pm",
} as const;

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export const VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
  LIMITED: "limited",
} as const;

export const SESSION_STATUS = {
  PENDING: "pending",
  BOOKED: "booked",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

