"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button-cf";
import { Card } from "@/components/ui/card-cf";
import { logger } from "@/lib/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component with CF-styled fallback UI
 * Catches unhandled errors and displays a user-friendly error message
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using centralized logger
    logger.error("ErrorBoundary caught an error", error, {
      componentStack: errorInfo.componentStack,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: In production, send error to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default CF-styled fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card variant="default" className="max-w-md w-full p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-cf-red-100 p-4">
                <AlertTriangle className="h-8 w-8 text-cf-red-600" />
              </div>
            </div>

            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Something went wrong
            </h2>

            <p className="mb-6 text-sm text-gray-600">
              We encountered an unexpected error. Please try again or contact
              support if the problem persists.
            </p>

            {/* Error details in dev mode */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 rounded-md bg-gray-50 p-4 text-left">
                <summary className="mb-2 cursor-pointer text-sm font-medium text-gray-700">
                  Error Details (Dev Mode)
                </summary>
                <pre className="overflow-auto text-xs text-gray-600">
                  {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      {"\n\n"}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="default"
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Go Home
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
