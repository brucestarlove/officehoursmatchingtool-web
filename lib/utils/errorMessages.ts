/**
 * Error Message Utility
 * 
 * Extracts user-friendly error messages from various error types:
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
    
    // NextAuth error codes - map to user-friendly messages
    if (message === "CredentialsSignin" || message.includes("CredentialsSignin")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (message.includes("OAuthAccountNotLinked")) {
      return "An account with this email already exists. Please sign in with your original method.";
    }
    if (message.includes("EmailSignin")) {
      return "Unable to send verification email. Please try again later.";
    }
    if (message.includes("OAuthSignin")) {
      return "Error signing in with OAuth provider. Please try again.";
    }
    if (message.includes("OAuthCallback")) {
      return "Error processing OAuth callback. Please try again.";
    }
    if (message.includes("OAuthCreateAccount")) {
      return "Unable to create account. Please try again.";
    }
    if (message.includes("EmailCreateAccount")) {
      return "Unable to create account. Please try again.";
    }
    if (message.includes("Callback") && !message.includes("OAuthCallback")) {
      return "Error during authentication. Please try again.";
    }
    if (message.includes("SessionRequired")) {
      return "Please sign in to continue.";
    }
    
    // Generic error messages
    if (message.includes("User does not exist")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (message.includes("Incorrect username or password") || message.includes("Invalid email or password")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (message.includes("Invalid verification code") || message.includes("verification code")) {
      return "Invalid verification code. Please check and try again.";
    }
    if (message.includes("expired") && message.includes("code")) {
      return "Verification code has expired. Please request a new one.";
    }
    if (message.includes("too many attempts") || message.includes("limit exceeded")) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (message.includes("Password") && message.includes("requirements")) {
      return "Password does not meet requirements. Please use at least 8 characters with uppercase, lowercase, numbers, and symbols.";
    }
    if (message.includes("already exists") || message.includes("email already")) {
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
      error.message.includes("Unauthorized") ||
      error.message.includes("401") ||
      error.message.includes("403")
    );
  }
  return false;
}
