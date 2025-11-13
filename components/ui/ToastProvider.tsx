"use client";

import * as React from "react";
import { createContext, useContext, useCallback, useState } from "react";
import { Toast, ToastVariant } from "./Toast";

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string, options?: Partial<ToastData>) => void;
  error: (title: string, description?: string, options?: Partial<ToastData>) => void;
  info: (title: string, description?: string, options?: Partial<ToastData>) => void;
  warning: (title: string, description?: string, options?: Partial<ToastData>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast Provider - Manages toast notifications globally
 * Position: top-right by default
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      addToast({ variant: "success", title, description, ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      addToast({ variant: "error", title, description, ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      addToast({ variant: "info", title, description, ...options });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, options?: Partial<ToastData>) => {
      addToast({ variant: "warning", title, description, ...options });
    },
    [addToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container - Top Right */}
      <div
        className="fixed right-4 top-4 z-50 flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}


