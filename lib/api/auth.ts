import apiClient from "./client";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "mentor" | "mentee";
  profile?: MentorProfile | MenteeProfile;
  createdAt: string;
  updatedAt: string;
}

export interface MentorProfile {
  id: string;
  userId: string;
  bio?: string;
  expertise: string[];
  industries: string[];
  company?: string;
  title?: string;
  rating?: number;
  reviewCount?: number;
}

export interface MenteeProfile {
  id: string;
  userId: string;
  bio?: string;
  goals: string[];
  interests: string[];
  startupStage?: string;
}

/**
 * Get current authenticated user
 * This calls GET /auth/me with the Access Token
 * Lambda reads JWT claims and upserts user to Postgres
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  role: "mentor" | "mentee",
  data: Partial<MentorProfile | MenteeProfile>
): Promise<User> {
  const endpoint = role === "mentor" ? `/profiles/mentor/${userId}` : `/profiles/mentee/${userId}`;
  const response = await apiClient.put<User>(endpoint, data);
  return response.data;
}

/**
 * Get mentor profile
 */
export async function getMentorProfile(mentorId: string): Promise<MentorProfile> {
  const response = await apiClient.get<MentorProfile>(`/profiles/mentor/${mentorId}`);
  return response.data;
}

/**
 * Get mentee profile
 */
export async function getMenteeProfile(menteeId: string): Promise<MenteeProfile> {
  const response = await apiClient.get<MenteeProfile>(`/profiles/mentee/${menteeId}`);
  return response.data;
}

