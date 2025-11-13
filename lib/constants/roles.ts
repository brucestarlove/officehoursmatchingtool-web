/**
 * User Role Constants
 * 
 * Centralized role definitions to ensure consistency across the app
 */

export const USER_ROLES = {
  MENTOR: "mentor",
  MENTEE: "mentee",
  ADMIN: "admin",
  PM: "pm",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

