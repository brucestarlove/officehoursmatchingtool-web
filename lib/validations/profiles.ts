/**
 * Profile validation schemas
 */

import { z } from "zod";

/**
 * Update user profile schema
 */
export const updateUserProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

/**
 * Update mentor profile schema
 */
export const updateMentorProfileSchema = z.object({
  headline: z.string().max(500).optional(),
  bio: z.string().max(10000).optional(),
  company: z.string().max(255).optional(),
  title: z.string().max(255).optional(),
  industry: z.string().max(255).optional(),
  stage: z.string().max(255).optional(),
  timezone: z.string().optional(),
  visibility: z.enum(["public", "private", "limited"]).optional(),
  loadCapPerWeek: z.number().int().min(1).max(50).optional(),
  active: z.boolean().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
});

/**
 * Update mentee profile schema
 */
export const updateMenteeProfileSchema = z.object({
  company: z.string().max(255).optional(),
  stage: z.string().max(255).optional(),
  industry: z.string().max(255).optional(),
  goals: z.string().max(5000).optional(),
});

