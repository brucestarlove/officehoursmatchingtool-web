"use client";

import { useQuery } from "@tanstack/react-query";
import {
  matchMentors,
  searchMentors,
  getMentorById,
  getMentorAvailability,
} from "@/lib/api/mentors";
import type {
  MatchRequest,
  MentorSearchParams,
} from "@/types";

// Query keys
export const mentorQueryKeys = {
  all: ["mentors"] as const,
  search: (query: string, filters: MatchRequest["filters"]) =>
    ["mentors", "search", query, filters] as const,
  searchParams: (params: MentorSearchParams) =>
    ["mentors", "search", params] as const,
  detail: (id: string) => ["mentors", id] as const,
  availability: (id: string, startDate?: string, endDate?: string) =>
    ["mentors", id, "availability", startDate, endDate] as const,
};

/**
 * Hook for AI-powered mentor matching
 */
export function useMatchMentors(request: MatchRequest) {
  return useQuery({
    queryKey: mentorQueryKeys.search(request.query, request.filters),
    queryFn: () => matchMentors(request),
    enabled: request.query.length > 0 || Object.keys(request.filters).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for searching mentors with filters
 */
export function useSearchMentors(params: MentorSearchParams) {
  return useQuery({
    queryKey: mentorQueryKeys.searchParams(params),
    queryFn: () => searchMentors(params),
    enabled: !!(params.search || params.expertise || params.industry),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting a single mentor by ID
 */
export function useMentor(mentorId: string | null) {
  return useQuery({
    queryKey: mentorQueryKeys.detail(mentorId || ""),
    queryFn: () => getMentorById(mentorId!),
    enabled: !!mentorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting mentor availability
 */
export function useMentorAvailability(
  mentorId: string | null,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: mentorQueryKeys.availability(mentorId || "", startDate, endDate),
    queryFn: () => getMentorAvailability(mentorId!, startDate, endDate),
    enabled: !!mentorId,
    staleTime: 2 * 60 * 1000, // 2 minutes (availability changes frequently)
  });
}

