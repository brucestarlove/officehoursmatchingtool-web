/**
 * Error Message Utility
 * 
 * Extracts user-friendly error messages from various error types:
 * - Cognito errors
 * - API/HTTP errors
 * - Generic errors
 */

import { AxiosError } from "axios";

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred. Please try again."): string {
  if (!error) return fallback;

  // Handle Axios/API errors
  if (error instanceof AxiosError) {
    const response = error.response;
    
    // Check for API-provided error message
    if (response?.data?.message) {
      return response.data.message;
    }
    
    // Check for error in response data
    if (response?.data?.error) {
      return response.data.error;
    }
    
    // Handle HTTP status codes
    switch (response?.status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "You are not authorized. Please sign in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with the current state. Please refresh and try again.";
      case 422:
        return "Validation failed. Please check your input.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return error.message || fallback;
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Cognito-specific error messages
    if (message.includes("User does not exist")) {
      return "No account found with this email address.";
    }
    if (message.includes("Incorrect username or password") || message.includes("NotAuthorizedException")) {
      return "Invalid email or password. Please try again.";
    }
    if (message.includes("UserNotConfirmedException")) {
      return "Please verify your email address before signing in.";
    }
    if (message.includes("CodeMismatchException") || message.includes("Invalid verification code")) {
      return "Invalid verification code. Please check and try again.";
    }
    if (message.includes("ExpiredCodeException")) {
      return "Verification code has expired. Please request a new one.";
    }
    if (message.includes("LimitExceededException")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (message.includes("Password") && message.includes("requirements")) {
      return "Password does not meet requirements. Please use at least 8 characters with uppercase, lowercase, numbers, and symbols.";
    }
    if (message.includes("custom:role") || message.includes("InvalidParameterException")) {
      return "Sign up failed. Please contact support if this issue persists.";
    }
    if (message.includes("UsernameExistsException") || message.includes("already exists")) {
      return "An account with this email already exists.";
    }
    if (message.includes("Network Error") || message.includes("ECONNREFUSED")) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    
    return message || fallback;
  }

  // Handle objects with message property
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message) || fallback;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error || fallback;
  }

  return fallback;
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response || error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK";
  }
  if (error instanceof Error) {
    return error.message.includes("Network Error") || error.message.includes("ECONNREFUSED");
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  if (error instanceof Error) {
    return (
      error.message.includes("NotAuthorizedException") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("401") ||
      error.message.includes("403")
    );
  }
  return false;
}
