/**
 * Database error handling utilities
 */

import { logger } from "./logger";

export interface DatabaseError {
  code?: string;
  message: string;
  detail?: string;
}

/**
 * Maps database errors to user-friendly messages
 */
export function mapDatabaseError(error: unknown): DatabaseError {
  const dbError = error as DatabaseError & { constraint?: string };

  // Log the full error for debugging
  logger.error("Database error", error);

  // Handle common PostgreSQL errors
  if (dbError.code) {
    switch (dbError.code) {
      case "23505": // Unique violation
        return {
          code: "UNIQUE_VIOLATION",
          message: "A record with this information already exists",
          detail: dbError.detail,
        };

      case "23503": // Foreign key violation
        return {
          code: "FOREIGN_KEY_VIOLATION",
          message: "Referenced record does not exist",
          detail: dbError.detail,
        };

      case "23502": // Not null violation
        return {
          code: "NOT_NULL_VIOLATION",
          message: "Required field is missing",
          detail: dbError.detail,
        };

      case "23514": // Check violation
        return {
          code: "CHECK_VIOLATION",
          message: "Data validation failed",
          detail: dbError.detail,
        };

      case "42P01": // Undefined table
        return {
          code: "UNDEFINED_TABLE",
          message: "Database table does not exist",
          detail: dbError.detail,
        };

      case "42P07": // Duplicate table
        return {
          code: "DUPLICATE_TABLE",
          message: "Table already exists",
          detail: dbError.detail,
        };

      default:
        return {
          code: dbError.code,
          message: dbError.message || "Database operation failed",
          detail: dbError.detail,
        };
    }
  }

  // Handle non-PostgreSQL errors
  if (error instanceof Error) {
    return {
      message: error.message || "Database operation failed",
    };
  }

  return {
    message: "An unexpected database error occurred",
  };
}

/**
 * Checks if error is a unique constraint violation
 */
export function isUniqueViolation(error: unknown): boolean {
  const dbError = error as DatabaseError;
  return dbError.code === "23505" || dbError.code === "UNIQUE_VIOLATION";
}

/**
 * Checks if error is a foreign key violation
 */
export function isForeignKeyViolation(error: unknown): boolean {
  const dbError = error as DatabaseError;
  return dbError.code === "23503" || dbError.code === "FOREIGN_KEY_VIOLATION";
}

