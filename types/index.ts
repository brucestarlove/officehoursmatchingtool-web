// Core types for Phase 2: Matching & Booking

export interface Mentor {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  expertise: string[];
  industries: string[];
  company?: string;
  title?: string;
  profilePhoto?: string;
  socialLinks?: {
    linkedIn?: string;
    twitter?: string;
  };
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mentee {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  goals: string[];
  interests: string[];
  startupStage?: string;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  mentor?: Mentor;
  mentee?: Mentee;
  startTime: string; // ISO 8601
  duration: number; // minutes
  meetingType: "video" | "in-person";
  meetingLink?: string;
  goals?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  available: boolean;
  duration: number; // minutes
}

export interface Availability {
  id: string;
  mentorId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  timezone: string;
  recurring?: {
    pattern: "daily" | "weekly" | "monthly";
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  sessionId: string;
  mentorId: string;
  menteeId: string;
  menteeName?: string;
  rating: number; // 1-5
  comment?: string;
  outcomeTags?: string[];
  createdAt: string;
}

// Matching & Search Types
export interface MatchFilters {
  expertise?: string[];
  industry?: string;
  stage?: string;
  availability?: "this-week" | "next-week" | "anytime";
}

export interface MatchRequest {
  query: string;
  filters: MatchFilters;
}

export interface MatchResponse {
  mentors: Mentor[];
  matchExplanations: {
    [mentorId: string]: string;
  };
  totalCount: number;
}

export interface MentorSearchParams {
  search?: string;
  expertise?: string; // Comma-separated
  industry?: string;
  stage?: string;
  availability?: string;
  sort?: "relevance" | "rating" | "availability";
  page?: number;
  limit?: number;
}

export interface MentorSearchResponse {
  mentors: Mentor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Booking Types
export interface BookingRequest {
  mentorId: string;
  menteeId: string;
  startTime: string; // ISO 8601
  duration: number; // minutes
  meetingType: "video" | "in-person";
  goals?: string;
}

export interface BookingResponse {
  session: Session;
  calendarEvent?: {
    icsUrl: string;
  };
}

// Dashboard Types
export interface DashboardStats {
  sessionsThisMonth: number;
  averageRating?: number;
  utilizationRate?: number; // For mentors
}

export interface UpcomingSession {
  id: string;
  startTime: string;
  duration: number;
  mentor?: Mentor;
  mentee?: Mentee;
  meetingType: "video" | "in-person";
  meetingLink?: string;
  goals?: string;
}

