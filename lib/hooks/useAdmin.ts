"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAnalytics,
  getAdminSessions,
  getMentorPerformance,
  getUtilization,
  type AnalyticsResponse,
  type AdminSessionsResponse,
  type MentorPerformanceResponse,
  type UtilizationResponse,
} from "@/lib/api/admin";

// Query keys
export const adminQueryKeys = {
  all: ["admin"] as const,
  analytics: (params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
    ["admin", "analytics", params] as const,
  sessions: (params?: Record<string, any>) => ["admin", "sessions", params] as const,
  mentors: (params?: Record<string, any>) => ["admin", "mentors", params] as const,
  utilization: (params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
    ["admin", "utilization", params] as const,
};

/**
 * Hook for fetching analytics data
 */
export function useAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}) {
  return useQuery<AnalyticsResponse>({
    queryKey: adminQueryKeys.analytics(params),
    queryFn: () => getAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching admin sessions list
 */
export function useAdminSessions(params?: {
  status?: string;
  mentorId?: string;
  menteeId?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}) {
  return useQuery<AdminSessionsResponse>({
    queryKey: adminQueryKeys.sessions(params),
    queryFn: () => getAdminSessions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for fetching mentor performance data
 */
export function useMentorPerformance(params?: {
  sort?: "sessions" | "rating" | "utilization";
  minSessions?: number;
  minRating?: number;
}) {
  return useQuery<MentorPerformanceResponse>({
    queryKey: adminQueryKeys.mentors(params),
    queryFn: () => getMentorPerformance(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching utilization data
 */
export function useUtilization(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}) {
  return useQuery<UtilizationResponse>({
    queryKey: adminQueryKeys.utilization(params),
    queryFn: () => getUtilization(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

