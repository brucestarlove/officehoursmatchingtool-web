"use client";

import { useQuery } from "@tanstack/react-query";
import { matchMentees, type MenteeMatchRequest, type MenteeMatchResponse } from "@/lib/api/mentees";

// Query keys
export const menteeQueryKeys = {
  all: ["mentees"] as const,
  match: (query: string, filters: MenteeMatchRequest["filters"]) =>
    ["mentees", "match", query, filters] as const,
};

/**
 * Hook for AI-powered mentee matching (for mentors)
 */
export function useMatchMentees(request: MenteeMatchRequest) {
  return useQuery({
    queryKey: menteeQueryKeys.match(request.query, request.filters),
    queryFn: () => matchMentees(request),
    enabled: request.query.length > 0 || Object.keys(request.filters).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

