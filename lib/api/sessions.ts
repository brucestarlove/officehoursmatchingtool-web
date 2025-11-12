import apiClient from "./client";
import type {
  Session,
  BookingRequest,
  BookingResponse,
  UpcomingSession,
} from "@/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants/sessions";

/**
 * Book a session
 * POST /sessions
 */
export async function bookSession(
  request: BookingRequest
): Promise<BookingResponse> {
  const response = await apiClient.post<BookingResponse>("/sessions", request);
  return response.data;
}

/**
 * List sessions for current user
 * GET /sessions
 */
export async function listSessions(params?: {
  status?: "upcoming" | "past" | "cancelled";
  sort?: "date";
  page?: number;
  limit?: number;
}): Promise<{
  sessions: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const response = await apiClient.get("/sessions", { params });
  return response.data;
}

/**
 * Get session by ID
 * GET /sessions/{id}
 */
export async function getSessionById(sessionId: string): Promise<Session> {
  const response = await apiClient.get<Session>(`/sessions/${sessionId}`);
  return response.data;
}

/**
 * Reschedule a session
 * PUT /sessions/{id}
 */
export async function rescheduleSession(
  sessionId: string,
  newStartTime: string
): Promise<Session> {
  const response = await apiClient.put<Session>(`/sessions/${sessionId}`, {
    startTime: newStartTime,
  });
  return response.data;
}

/**
 * Cancel a session
 * DELETE /sessions/{id}
 */
export async function cancelSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}`);
}

/**
 * Get upcoming sessions for dashboard
 */
export async function getUpcomingSessions(): Promise<UpcomingSession[]> {
  const response = await listSessions({
    status: "upcoming",
    sort: "date",
    limit: DEFAULT_PAGE_SIZE,
  });
  
  // Safely map Session[] to UpcomingSession[]
  // UpcomingSession is a subset of Session, so we can safely map
  return response.sessions.map((session): UpcomingSession => ({
    id: session.id,
    startTime: session.startTime,
    duration: session.duration,
    mentor: session.mentor,
    mentee: session.mentee,
    meetingType: session.meetingType,
    meetingLink: session.meetingLink,
    goals: session.goals,
  }));
}
