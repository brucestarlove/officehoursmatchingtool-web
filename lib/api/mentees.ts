import apiClient from "./client";
import type { Mentee, MatchRequest, MatchResponse } from "@/types";

/**
 * AI-powered mentee matching endpoint for mentors
 * POST /match/mentees
 */
export interface MenteeMatchRequest {
  query: string;
  filters: {
    pastInteractions?: "previously-booked" | "new-mentees-only" | "all";
  };
}

export interface MenteeMatchResponse {
  mentees: Mentee[];
  matchExplanations: {
    [menteeId: string]: string;
  };
  totalCount: number;
}

export async function matchMentees(
  request: MenteeMatchRequest
): Promise<MenteeMatchResponse> {
  const response = await apiClient.post<MenteeMatchResponse>("/match/mentees", request);
  return response.data;
}

