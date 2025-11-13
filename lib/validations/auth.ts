import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Base signup schema
const baseSignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["mentor", "mentee"], {
    required_error: "Please select a role",
  }),
});

// Mentor-specific fields
const mentorFieldsSchema = z.object({
  headline: z.string().min(1, "Headline is required").max(500),
  bio: z.string().min(1, "Bio is required").max(10000),
  company: z.string().min(1, "Company is required").max(255),
  title: z.string().min(1, "Title is required").max(255),
  industry: z.string().min(1, "Industry is required").max(255),
  stage: z.string().max(255).optional(),
  timezone: z.string().min(1, "Timezone is required"),
  expertise: z.array(z.string()).min(1, "Select at least one area of expertise"),
});

// Mentee-specific fields
const menteeFieldsSchema = z.object({
  company: z.string().min(1, "Company is required").max(255),
  stage: z.string().min(1, "Stage is required").max(255),
  industry: z.string().min(1, "Industry is required").max(255),
  goals: z.string().min(1, "Goals are required").max(5000),
});

// Combined signup schema with role-based validation
export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    name: z.string().min(1, "Name is required"),
    role: z.enum(["mentor", "mentee"], {
      required_error: "Please select a role",
    }),
    // Mentor fields (optional, validated conditionally)
    headline: z.string().max(500).optional(),
    bio: z.string().max(10000).optional(),
    company: z.string().max(255).optional(),
    title: z.string().max(255).optional(),
    industry: z.string().max(255).optional(),
    stage: z.string().max(255).optional(),
    timezone: z.string().optional(),
    expertise: z.array(z.string()).optional(),
    // Mentee fields (optional, validated conditionally)
    goals: z.string().max(5000).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "mentor") {
        return (
          data.headline &&
          data.bio &&
          data.company &&
          data.title &&
          data.industry &&
          data.timezone &&
          data.expertise &&
          data.expertise.length > 0
        );
      }
      return true;
    },
    {
      message: "All mentor fields are required",
      path: ["headline"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "mentee") {
        return data.company && data.stage && data.industry && data.goals;
      }
      return true;
    },
    {
      message: "All mentee fields are required",
      path: ["company"],
    }
  );

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    code: z.string().min(6, "Code must be 6 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

