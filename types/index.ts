// Core types for Phase 2: Matching & Booking

import type { UserRole } from "@/lib/constants/roles";
import type { SessionStatus, MeetingType } from "@/lib/constants/sessions";

// Entity Types
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

// Profile types - subset of full entity types for profile management
export type MentorProfile = Pick<
  Mentor,
  "id" | "userId" | "bio" | "expertise" | "industries" | "company" | "title" | "rating" | "reviewCount"
>;

export type MenteeProfile = Pick<
  Mentee,
  "id" | "userId" | "bio" | "goals" | "interests" | "startupStage"
>;

// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  profile?: MentorProfile | MenteeProfile;
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
  meetingType: MeetingType;
  meetingLink?: string;
  goals?: string;
  status: SessionStatus;
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
  availability?: "this-week" | "next-week" | "anytime" | "custom-range";
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  pastInteractions?: "previously-booked" | "new-mentors-only" | "all";
  minRating?: number; // Minimum rating (e.g., 4 for highly rated)
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
  meetingType: MeetingType;
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
  meetingType: MeetingType;
  meetingLink?: string;
  goals?: string;
}

// Feedback Types
export interface FeedbackSubmission {
  rating: number; // 1-5
  comment?: string;
  outcomeTags?: string[];
}

export interface MentorReputation {
  mentorId: string;
  averageRating: number;
  totalReviews: number;
  sessionCount: number;
  completionRate: number; // 0-1
  recentActivity: string; // ISO 8601
  ranking?: number;
}

export interface MentorStats {
  mentorId: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageRating: number;
  ratingDistribution: {
    [rating: number]: number; // rating -> count
  };
  totalFeedback: number;
  pastSessionTopics: string[]; // Most common topics
  lastSessionDate?: string; // ISO 8601
}

