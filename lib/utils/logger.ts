/**
 * Centralized Logger Utility
 * 
 * Provides consistent logging across the application with support for:
 * - Different log levels (error, warn, info, debug)
 * - Environment-aware logging (only errors in production)
 * - Structured error logging with context
 * - Future integration with error tracking services
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  /**
   * Log an error with optional context
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails = this.extractErrorDetails(error, message);
    const logData = {
      message,
      ...errorDetails,
      ...context,
      timestamp: new Date().toISOString(),
    };

    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, logData);

    // TODO: In production, send error to error tracking service (e.g., Sentry)
    // if (this.isProduction && error) {
    //   errorTrackingService.captureException(error, { extra: context });
    // }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    console.warn(`[WARN] ${message}`, { ...context, timestamp: new Date().toISOString() });
  }

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    console.info(`[INFO] ${message}`, { ...context, timestamp: new Date().toISOString() });
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    console.debug(`[DEBUG] ${message}`, { ...context, timestamp: new Date().toISOString() });
  }

  /**
   * Extract error details from various error types
   * @param error - The error object to extract details from
   * @param fallbackMessage - Fallback message if error doesn't have a message
   */
  private extractErrorDetails(error?: Error | unknown, fallbackMessage?: string): Partial<{
    error: string;
    stack: string;
    code: string;
    name: string;
    [key: string]: unknown;
  }> {
    if (!error) return {};

    if (error instanceof Error) {
      const details: Record<string, unknown> = {};
      
      // Use error message if available, otherwise use fallback or generic message
      if (error.message && error.message.trim()) {
        details.error = error.message;
      } else if (fallbackMessage) {
        details.error = fallbackMessage;
      } else {
        details.error = "Unknown error";
      }
      
      if (error.stack) {
        details.stack = error.stack;
      }
      if (error.name) {
        details.name = error.name;
      }
      
      // Extract additional properties if they exist and are defined
      const errorObj = error as Record<string, unknown>;
      for (const [key, value] of Object.entries(errorObj)) {
        if (value !== undefined && !["message", "stack", "name"].includes(key)) {
          details[key] = value;
        }
      }
      
      return details;
    }

    // Handle non-Error objects (e.g., API errors)
    if (typeof error === "object" && error !== null) {
      const details: Record<string, unknown> = {};
      const errorObj = error as Record<string, unknown>;
      
      // Try to extract a meaningful error message
      if (errorObj.message && typeof errorObj.message === "string" && errorObj.message.trim()) {
        details.error = errorObj.message;
      } else if (errorObj.error && typeof errorObj.error === "string" && errorObj.error.trim()) {
        details.error = errorObj.error;
      } else if (fallbackMessage) {
        details.error = fallbackMessage;
      } else {
        details.error = String(error);
      }
      
      // Include other properties that are defined
      for (const [key, value] of Object.entries(errorObj)) {
        if (value !== undefined && !["message", "error"].includes(key)) {
          details[key] = value;
        }
      }
      
      return details;
    }

    return {
      error: fallbackMessage || String(error),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other modules
export type { LogContext };

