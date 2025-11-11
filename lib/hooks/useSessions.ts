"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bookSession,
  listSessions,
  getSessionById,
  rescheduleSession,
  cancelSession,
  getUpcomingSessions,
} from "@/lib/api/sessions";
import type { BookingRequest, Session } from "@/types";

// Query keys
export const sessionQueryKeys = {
  all: ["sessions"] as const,
  lists: () => ["sessions", "list"] as const,
  list: (filters?: { status?: string; sort?: string }) =>
    ["sessions", "list", filters] as const,
  detail: (id: string) => ["sessions", id] as const,
  upcoming: () => ["sessions", "upcoming"] as const,
};

/**
 * Hook for booking a session
 */
export function useBookSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BookingRequest) => bookSession(request),
    onSuccess: () => {
      // Invalidate all session queries
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
      // Also invalidate mentor availability
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
}

/**
 * Hook for listing sessions
 */
export function useSessions(params?: {
  status?: "upcoming" | "past" | "cancelled";
  sort?: "date";
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: sessionQueryKeys.list(params),
    queryFn: () => listSessions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for getting a single session by ID
 */
export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: sessionQueryKeys.detail(sessionId || ""),
    queryFn: () => getSessionById(sessionId!),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for rescheduling a session
 */
export function useRescheduleSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, newStartTime }: { sessionId: string; newStartTime: string }) =>
      rescheduleSession(sessionId, newStartTime),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
      queryClient.setQueryData(sessionQueryKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook for cancelling a session
 */
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => cancelSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
      queryClient.removeQueries({ queryKey: sessionQueryKeys.detail(sessionId) });
    },
  });
}

/**
 * Hook for getting upcoming sessions (for dashboard)
 */
export function useUpcomingSessions() {
  return useQuery({
    queryKey: sessionQueryKeys.upcoming(),
    queryFn: getUpcomingSessions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

