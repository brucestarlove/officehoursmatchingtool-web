"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/hooks/useAuth";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button-cf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card-cf";
import { Badge } from "@/components/ui/badge-cf";
import { logger } from "@/lib/utils/logger";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/errorMessages";
import { getAuthFormDefaults, saveAuthFormState, clearAuthFormState } from "@/lib/utils/authFormState";
import {
  EXPERTISE_OPTIONS,
  INDUSTRY_OPTIONS,
  STAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/lib/constants/signup-options";

export default function SignUpPage() {
  const { signUp, isSigningUp } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: getAuthFormDefaults(),
  });

  const emailValue = watch("email");
  const nameValue = watch("name");
  const selectedRole = watch("role");

  // Save form fields to localStorage as user types
  useEffect(() => {
    if (emailValue || nameValue) {
      saveAuthFormState({
        email: emailValue || undefined,
        name: nameValue || undefined,
      });
    }
  }, [emailValue, nameValue]);

  const onSubmit = async (data: SignUpInput) => {
    try {
      setError(null);
      
      // Sign up with NextAuth - automatically signs in after signup
      await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        // Mentor fields
        headline: data.headline,
        bio: data.bio,
        company: data.company,
        title: data.title,
        industry: data.industry,
        stage: data.stage,
        timezone: data.timezone,
        expertise: data.expertise,
        // Mentee fields
        goals: data.goals,
      });
      
      // Clear form state on successful signup
      clearAuthFormState();
      
      // User is automatically signed in and redirected to dashboard
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Sign up failed. Please try again.");
      logger.error("Sign up error", err);
      setError(errorMessage);
      toast.error("Sign up failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cf-beige-50 px-4 py-12">
      <Card variant="default" className="w-full max-w-2xl">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-display font-bold uppercase">
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join CF Office Hours Matching Tool
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-4 border-b pb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  disabled={isSigningUp}
                />
                {errors.name && <ErrorMessage message={errors.name.message} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  disabled={isSigningUp}
                />
                {errors.email && (
                  <ErrorMessage message={errors.email.message} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      value="mentor"
                      {...register("role")}
                      className="peer sr-only"
                      disabled={isSigningUp}
                    />
                    <Card
                      variant={
                        selectedRole === "mentor" ? "yellow-border" : "default"
                      }
                      className="p-4 text-center transition-all peer-checked:bg-cf-yellow-50"
                    >
                      <Badge variant="accent" className="mb-2">
                        Mentor
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        I want to help startups
                      </p>
                    </Card>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      value="mentee"
                      {...register("role")}
                      className="peer sr-only"
                      disabled={isSigningUp}
                    />
                    <Card
                      variant={
                        selectedRole === "mentee" ? "yellow-border" : "default"
                      }
                      className="p-4 text-center transition-all peer-checked:bg-cf-yellow-50"
                    >
                      <Badge variant="default" className="mb-2">
                        Mentee
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        I need mentorship
                      </p>
                    </Card>
                  </label>
                </div>
                {errors.role && <ErrorMessage message={errors.role.message} />}
              </div>
            </div>

            {/* Mentor Fields */}
            {selectedRole === "mentor" && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Mentor Profile</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    type="text"
                    placeholder="VP of Product at TechCorp"
                    {...register("headline")}
                    disabled={isSigningUp}
                  />
                  {errors.headline && (
                    <ErrorMessage message={errors.headline.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={4}
                    placeholder="Tell us about your background and experience..."
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("bio")}
                    disabled={isSigningUp}
                  />
                  {errors.bio && <ErrorMessage message={errors.bio.message} />}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="TechCorp"
                      {...register("company")}
                      disabled={isSigningUp}
                    />
                    {errors.company && (
                      <ErrorMessage message={errors.company.message} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="VP of Product"
                      {...register("title")}
                      disabled={isSigningUp}
                    />
                    {errors.title && (
                      <ErrorMessage message={errors.title.message} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <select
                    id="industry"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("industry")}
                    disabled={isSigningUp}
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  {errors.industry && (
                    <ErrorMessage message={errors.industry.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Stage Focus (Optional)</Label>
                  <select
                    id="stage"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("stage")}
                    disabled={isSigningUp}
                  >
                    <option value="">Select a stage</option>
                    {STAGE_OPTIONS.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                  {errors.stage && (
                    <ErrorMessage message={errors.stage.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("timezone")}
                    disabled={isSigningUp}
                  >
                    <option value="">Select your timezone</option>
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  {errors.timezone && (
                    <ErrorMessage message={errors.timezone.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Areas of Expertise</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {EXPERTISE_OPTIONS.map((exp) => (
                      <label key={exp} className="flex items-center space-x-2 cursor-pointer">
                        <Controller
                          name="expertise"
                          control={control}
                          render={({ field }) => (
                            <>
                              <input
                                type="checkbox"
                                value={exp}
                                checked={field.value?.includes(exp) || false}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...current, exp]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== exp)
                                    );
                                  }
                                }}
                                disabled={isSigningUp}
                                className="rounded border-gray-300 text-cf-yellow-600 focus:ring-cf-yellow-500"
                              />
                              <span className="text-sm">{exp}</span>
                            </>
                          )}
                        />
                      </label>
                    ))}
                  </div>
                  {errors.expertise && (
                    <ErrorMessage message={errors.expertise.message} />
                  )}
                </div>
              </div>
            )}

            {/* Mentee Fields */}
            {selectedRole === "mentee" && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold">Startup Profile</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="My Startup Inc."
                    {...register("company")}
                    disabled={isSigningUp}
                  />
                  {errors.company && (
                    <ErrorMessage message={errors.company.message} />
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <select
                      id="stage"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register("stage")}
                      disabled={isSigningUp}
                    >
                      <option value="">Select a stage</option>
                      {STAGE_OPTIONS.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    {errors.stage && (
                      <ErrorMessage message={errors.stage.message} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <select
                      id="industry"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register("industry")}
                      disabled={isSigningUp}
                    >
                      <option value="">Select an industry</option>
                      {INDUSTRY_OPTIONS.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    {errors.industry && (
                      <ErrorMessage message={errors.industry.message} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">What do you need help with?</Label>
                  <textarea
                    id="goals"
                    rows={4}
                    placeholder="Describe your goals and what kind of mentorship you're looking for..."
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("goals")}
                    disabled={isSigningUp}
                  />
                  {errors.goals && (
                    <ErrorMessage message={errors.goals.message} />
                  )}
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="space-y-4 border-b pb-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isSigningUp}
                />
                {errors.password && (
                  <ErrorMessage message={errors.password.message} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  disabled={isSigningUp}
                />
                {errors.confirmPassword && (
                  <ErrorMessage message={errors.confirmPassword.message} />
                )}
              </div>
            </div>

            {error && <ErrorMessage message={error} />}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              href="/login"
              className="font-medium text-cf-teal-600 hover:text-cf-teal-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
