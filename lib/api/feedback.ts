import apiClient from "./client";
import type {
  FeedbackSubmission,
  MentorReputation,
  MentorStats,
} from "@/types";

/**
 * Submit feedback for a session
 * POST /sessions/{id}/feedback
 */
export async function submitFeedback(
  sessionId: string,
  data: FeedbackSubmission
): Promise<void> {
  await apiClient.post(`/sessions/${sessionId}/feedback`, data);
}

/**
 * Get mentor reputation score
 * GET /mentors/{id}/reputation
 */
export async function getMentorReputation(
  mentorId: string
): Promise<MentorReputation> {
  const response = await apiClient.get<MentorReputation>(
    `/mentors/${mentorId}/reputation`
  );
  return response.data;
}

/**
 * Get mentor statistics
 * GET /mentors/{id}/stats
 */
export async function getMentorStats(mentorId: string): Promise<MentorStats> {
  const response = await apiClient.get<MentorStats>(
    `/mentors/${mentorId}/stats`
  );
  return response.data;
}


