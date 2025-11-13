/**
 * Matching utilities for rule-based mentor matching algorithm
 * 
 * Scoring weights:
 * - Expertise: 0.4
 * - Industry: 0.3
 * - Stage: 0.2
 * - Availability: 0.1
 */

import type { Mentor } from "@/types";

export interface MatchScores {
  expertise: number;
  industry: number;
  stage: number;
  availability: number;
  total: number;
}

/**
 * Calculate expertise match score based on overlap
 */
export function scoreExpertiseMatch(
  mentorExpertise: string[],
  queryExpertise: string[]
): number {
  if (!queryExpertise || queryExpertise.length === 0) {
    return 0.5; // Neutral score if no expertise filter
  }

  if (!mentorExpertise || mentorExpertise.length === 0) {
    return 0; // No match if mentor has no expertise
  }

  // Normalize to lowercase for comparison
  const mentorLower = mentorExpertise.map((e) => e.toLowerCase());
  const queryLower = queryExpertise.map((e) => e.toLowerCase());

  // Count matches
  const matches = queryLower.filter((q) =>
    mentorLower.some((m) => m.includes(q) || q.includes(m))
  ).length;

  // Score is ratio of matched expertise to total query expertise
  return matches / queryLower.length;
}

/**
 * Calculate industry match score
 */
export function scoreIndustryMatch(
  mentorIndustry: string | null | undefined,
  queryIndustry?: string
): number {
  if (!queryIndustry) {
    return 0.5; // Neutral score if no industry filter
  }

  if (!mentorIndustry) {
    return 0; // No match if mentor has no industry
  }

  // Exact match
  if (mentorIndustry.toLowerCase() === queryIndustry.toLowerCase()) {
    return 1.0;
  }

  // Partial match (contains)
  if (
    mentorIndustry.toLowerCase().includes(queryIndustry.toLowerCase()) ||
    queryIndustry.toLowerCase().includes(mentorIndustry.toLowerCase())
  ) {
    return 0.7;
  }

  return 0; // No match
}

/**
 * Calculate stage match score
 */
export function scoreStageMatch(
  mentorStage: string | null | undefined,
  queryStage?: string
): number {
  if (!queryStage) {
    return 0.5; // Neutral score if no stage filter
  }

  if (!mentorStage) {
    return 0; // No match if mentor has no stage
  }

  // Exact match
  if (mentorStage.toLowerCase() === queryStage.toLowerCase()) {
    return 1.0;
  }

  // Partial match
  if (
    mentorStage.toLowerCase().includes(queryStage.toLowerCase()) ||
    queryStage.toLowerCase().includes(mentorStage.toLowerCase())
  ) {
    return 0.7;
  }

  return 0; // No match
}

/**
 * Calculate availability score (simplified - checks if mentor has any availability)
 */
export function scoreAvailability(hasAvailability: boolean): number {
  return hasAvailability ? 1.0 : 0.3; // Penalize mentors with no availability
}

/**
 * Calculate total match score with weights
 */
export function calculateTotalScore(scores: Omit<MatchScores, "total">): number {
  return (
    scores.expertise * 0.4 +
    scores.industry * 0.3 +
    scores.stage * 0.2 +
    scores.availability * 0.1
  );
}

/**
 * Generate match explanation based on scores
 */
export function generateMatchExplanation(
  mentor: Mentor,
  scores: MatchScores
): string {
  const factors: string[] = [];

  if (scores.expertise >= 0.7) {
    factors.push(`Expert in ${mentor.expertise.slice(0, 2).join(", ")}`);
  }

  if (scores.industry >= 0.7 && mentor.industries && mentor.industries.length > 0) {
    factors.push(`${mentor.industries[0]} industry experience`);
  }

  if (scores.stage >= 0.7 && mentor.company) {
    factors.push(`Experience with ${mentor.company}`);
  }

  if (scores.availability >= 0.8) {
    factors.push("Available this week");
  }

  if (mentor.rating && mentor.rating >= 4.5) {
    factors.push(`Highly rated (${mentor.rating.toFixed(1)} stars)`);
  }

  if (factors.length === 0) {
    return "Matches your search criteria";
  }

  return factors.join(" • ");
}

/**
 * Rank mentors by total score (descending)
 */
export function rankMentors<T extends { id: string }>(
  mentors: T[],
  scores: Map<string, MatchScores>
): T[] {
  return [...mentors].sort((a, b) => {
    const scoreA = scores.get(a.id)?.total || 0;
    const scoreB = scores.get(b.id)?.total || 0;
    return scoreB - scoreA; // Descending order
  });
}

