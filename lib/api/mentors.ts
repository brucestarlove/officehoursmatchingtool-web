import apiClient from "./client";
import type {
  Mentor,
  MatchRequest,
  MatchResponse,
  MentorSearchParams,
  MentorSearchResponse,
  Availability,
  TimeSlot,
} from "@/types";

/**
 * AI-powered mentor matching endpoint
 * POST /match
 */
export async function matchMentors(
  request: MatchRequest
): Promise<MatchResponse> {
  const response = await apiClient.post<MatchResponse>("/match", request);
  return response.data;
}

/**
 * Search mentors with filters
 * GET /mentors
 */
export async function searchMentors(
  params: MentorSearchParams
): Promise<MentorSearchResponse> {
  const response = await apiClient.get<MentorSearchResponse>("/mentors", {
    params,
  });
  return response.data;
}

/**
 * Get mentor by ID
 * GET /mentors/{id}
 */
export async function getMentorById(mentorId: string): Promise<Mentor> {
  const response = await apiClient.get<Mentor>(`/mentors/${mentorId}`);
  return response.data;
}

/**
 * Get mentor availability
 * GET /availability/mentor/{id}
 */
export interface MentorAvailabilityResponse {
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
  timezone: string;
}

export async function getMentorAvailability(
  mentorId: string,
  startDate?: string,
  endDate?: string
): Promise<MentorAvailabilityResponse> {
  const response = await apiClient.get<MentorAvailabilityResponse>(
    `/availability/mentor/${mentorId}`,
    {
      params: {
        startDate,
        endDate,
      },
    }
  );
  return response.data;
}

/**
 * Set mentor availability
 * POST /availability
 */
export async function setAvailability(
  availability: Omit<Availability, "id" | "createdAt" | "updatedAt">
): Promise<Availability> {
  const response = await apiClient.post<Availability>("/availability", availability);
  return response.data;
}

