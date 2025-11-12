/**
 * API error response utilities
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { mapDatabaseError } from "./db-errors";

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  status: number = 500
): NextResponse<ApiErrorResponse> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Handle database errors
  const dbError = mapDatabaseError(error);
  
  // Map database error codes to HTTP status codes
  let httpStatus = status;
  if (dbError.code === "UNIQUE_VIOLATION") {
    httpStatus = 409; // Conflict
  } else if (dbError.code === "FOREIGN_KEY_VIOLATION") {
    httpStatus = 400; // Bad Request
  } else if (dbError.code === "NOT_NULL_VIOLATION") {
    httpStatus = 400; // Bad Request
  } else if (dbError.code === "UNDEFINED_TABLE") {
    httpStatus = 500; // Internal Server Error
  }

  return NextResponse.json(
    {
      error: dbError.message,
      code: dbError.code,
      details: dbError.detail,
    },
    { status: httpStatus }
  );
}

/**
 * Creates a not found error response
 */
export function createNotFoundResponse(
  resource: string = "Resource"
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: `${resource} not found`,
      code: "NOT_FOUND",
    },
    { status: 404 }
  );
}

/**
 * Creates an unauthorized error response
 */
export function createUnauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      code: "UNAUTHORIZED",
    },
    { status: 401 }
  );
}

/**
 * Creates a forbidden error response
 */
export function createForbiddenResponse(
  message: string = "Forbidden"
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      code: "FORBIDDEN",
    },
    { status: 403 }
  );
}

