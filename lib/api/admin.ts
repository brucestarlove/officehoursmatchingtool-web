/**
 * Admin API client functions
 */

import apiClient from "./client";

export interface AnalyticsResponse {
  metrics: {
    totalSessions: number;
    utilizationRate: number;
    averageFeedback: number;
    activeMentors: number;
    activeMentees: number;
    sessionsThisMonth: number;
    sessionsLastMonth: number;
  };
  trends: {
    sessionsOverTime: Array<{ date: string; value: number }>;
    utilizationByMentor: Array<{
      mentorId: string;
      mentorName: string;
      totalAvailableHours: number;
      bookedHours: number;
      utilizationRate: number;
      sessionCount: number;
    }>;
    feedbackDistribution: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
    engagementMetrics: {
      mentorEngagement: {
        high: number;
        medium: number;
        low: number;
      };
      menteeEngagement: {
        high: number;
        medium: number;
        low: number;
      };
      powerUsers: {
        mentors: string[];
        mentees: string[];
      };
    };
  };
}

export interface AdminSessionsResponse {
  sessions: Array<{
    id: string;
    mentorId: string;
    menteeId: string;
    mentor?: {
      id: string;
      name: string;
      email: string;
    };
    mentee?: {
      id: string;
      name: string;
      email: string;
    };
    startTime: string;
    duration: number;
    status: string;
    meetingType: string;
    rating?: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface MentorPerformanceResponse {
  mentors: Array<{
    mentorId: string;
    mentorName: string;
    email: string;
    company?: string;
    title?: string;
    sessionCount: number;
    averageRating: number;
    utilizationRate: number;
    lastActiveDate?: string;
    totalReviews: number;
  }>;
  statistics: {
    totalMentors: number;
    averageSessions: number;
    averageRating: number;
    averageUtilization: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UtilizationResponse {
  overallUtilizationRate: number;
  totalAvailableHours: number;
  totalBookedHours: number;
  utilizationByMentor: Array<{
    mentorId: string;
    mentorName: string;
    totalAvailableHours: number;
    bookedHours: number;
    utilizationRate: number;
    sessionCount: number;
  }>;
  utilizationTrends: Array<{ date: string; value: number }>;
  lowUtilizationAlerts: Array<{
    mentorId: string;
    mentorName: string;
    utilizationRate: number;
    sessionCount: number;
  }>;
  engagementDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

/**
 * Get analytics data
 */
export async function getAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}): Promise<AnalyticsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.groupBy) searchParams.set("groupBy", params.groupBy);

  const response = await apiClient.get<AnalyticsResponse>(
    `/admin/analytics?${searchParams.toString()}`
  );
  return response.data;
}

/**
 * Get admin sessions list
 */
export async function getAdminSessions(params?: {
  status?: string;
  mentorId?: string;
  menteeId?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<AdminSessionsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.mentorId) searchParams.set("mentorId", params.mentorId);
  if (params?.menteeId) searchParams.set("menteeId", params.menteeId);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.order) searchParams.set("order", params.order);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const response = await apiClient.get<AdminSessionsResponse>(
    `/admin/sessions?${searchParams.toString()}`
  );
  return response.data;
}

/**
 * Get mentor performance data
 */
export async function getMentorPerformance(params?: {
  sort?: "sessions" | "rating" | "utilization";
  minSessions?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}): Promise<MentorPerformanceResponse> {
  const searchParams = new URLSearchParams();
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.minSessions) searchParams.set("minSessions", String(params.minSessions));
  if (params?.minRating) searchParams.set("minRating", String(params.minRating));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const response = await apiClient.get<MentorPerformanceResponse>(
    `/admin/mentors?${searchParams.toString()}`
  );
  return response.data;
}

/**
 * Export data
 */
export async function exportData(params: {
  type: "sessions" | "mentors" | "analytics";
  format: "csv" | "json";
  filters?: Record<string, any>;
}): Promise<Blob> {
  const searchParams = new URLSearchParams();
  searchParams.set("type", params.type);
  searchParams.set("format", params.format);
  if (params.filters) {
    searchParams.set("filters", JSON.stringify(params.filters));
  }

  const response = await apiClient.get(`/admin/export?${searchParams.toString()}`, {
    responseType: "blob",
  });
  return response.data as Blob;
}

/**
 * Get utilization data
 */
export async function getUtilization(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}): Promise<UtilizationResponse> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.groupBy) searchParams.set("groupBy", params.groupBy);

  const response = await apiClient.get<UtilizationResponse>(
    `/admin/utilization?${searchParams.toString()}`
  );
  return response.data;
}

