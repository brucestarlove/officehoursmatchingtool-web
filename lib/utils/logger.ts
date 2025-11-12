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
    const errorDetails = this.extractErrorDetails(error);
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
   */
  private extractErrorDetails(error?: Error | unknown): Partial<{
    error: string;
    stack: string;
    code: string;
    name: string;
    [key: string]: unknown;
  }> {
    if (!error) return {};

    if (error instanceof Error) {
      return {
        error: error.message,
        stack: error.stack,
        name: error.name,
        // Extract additional properties if they exist
        ...(error as Record<string, unknown>),
      };
    }

    // Handle non-Error objects (e.g., API errors)
    if (typeof error === "object" && error !== null) {
      return {
        error: String(error),
        ...(error as Record<string, unknown>),
      };
    }

    return {
      error: String(error),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other modules
export type { LogContext };

