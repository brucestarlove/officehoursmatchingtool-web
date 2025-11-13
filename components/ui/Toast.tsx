"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button-cf";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
  onDismiss: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-cf-green-50 border-cf-green-200",
    border: "border-cf-green-500",
    icon: <CheckCircle2 className="h-5 w-5 text-cf-green-600" />,
  },
  error: {
    bg: "bg-cf-red-50 border-cf-red-200",
    border: "border-cf-red-500",
    icon: <AlertCircle className="h-5 w-5 text-cf-red-600" />,
  },
  info: {
    bg: "bg-cf-teal-50 border-cf-teal-200",
    border: "border-cf-teal-500",
    icon: <Info className="h-5 w-5 text-cf-teal-600" />,
  },
  warning: {
    bg: "bg-cf-yellow-50 border-cf-yellow-200",
    border: "border-cf-yellow-500",
    icon: <AlertTriangle className="h-5 w-5 text-cf-yellow-600" />,
  },
};

/**
 * Toast notification component
 * Displays temporary notifications with auto-dismiss and manual dismiss
 */
export function Toast({
  id,
  variant,
  title,
  description,
  duration = 5000,
  onDismiss,
  action,
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    // Trigger slide-in animation
    setIsVisible(true);

    // Auto-dismiss after duration
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete before removing
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "min-w-[320px] max-w-md rounded-lg border-2 p-4 shadow-lg transition-all duration-300",
        styles.bg,
        styles.border,
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">{styles.icon}</div>

        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-700">{description}</p>
          )}
          {action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  action.onClick();
                  handleDismiss();
                }}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cf-teal-500"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}


