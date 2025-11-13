"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useProfile } from "@/lib/hooks/useProfile";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/hooks/useToast";
import { getErrorMessage } from "@/lib/utils/errorMessages";
import { logger } from "@/lib/utils/logger";
import {
  updateUserProfileSchema,
  updateMentorProfileSchema,
  updateMenteeProfileSchema,
} from "@/lib/validations/profiles";
import { z } from "zod";
import Image from "next/image";

// Combined schema for form
const createProfileSchema = (role: "mentor" | "mentee") => {
  const baseSchema = updateUserProfileSchema;
  const roleSchema = role === "mentor" ? updateMentorProfileSchema : updateMenteeProfileSchema;
  return baseSchema.merge(roleSchema);
};

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const isMentor = profile?.role === "mentor";
  const profileData = profile?.profile;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(
      createProfileSchema(isMentor ? "mentor" : "mentee")
    ),
    defaultValues: {
      name: profile?.name || "",
      ...(isMentor
        ? {
            headline: (profileData as any)?.headline || "",
            bio: (profileData as any)?.bio || "",
            company: (profileData as any)?.company || "",
            title: (profileData as any)?.title || "",
            industry: (profileData as any)?.industry || "",
            stage: (profileData as any)?.stage || "",
            timezone: (profileData as any)?.timezone || "",
            photoUrl: (profileData as any)?.photoUrl || "",
            linkedinUrl: (profileData as any)?.linkedinUrl || "",
          }
        : {
            company: (profileData as any)?.company || "",
            stage: (profileData as any)?.stage || "",
            industry: (profileData as any)?.industry || "",
            goals: Array.isArray((profileData as any)?.goals)
              ? (profileData as any)?.goals.join(", ")
              : (profileData as any)?.goals || "",
          }),
    },
  });

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        ...(isMentor
          ? {
              headline: (profileData as any)?.headline || "",
              bio: (profileData as any)?.bio || "",
              company: (profileData as any)?.company || "",
              title: (profileData as any)?.title || "",
              industry: (profileData as any)?.industry || "",
              stage: (profileData as any)?.stage || "",
              timezone: (profileData as any)?.timezone || "",
              photoUrl: (profileData as any)?.photoUrl || "",
              linkedinUrl: (profileData as any)?.linkedinUrl || "",
            }
          : {
              company: (profileData as any)?.company || "",
              stage: (profileData as any)?.stage || "",
              industry: (profileData as any)?.industry || "",
              goals: Array.isArray((profileData as any)?.goals)
                ? (profileData as any)?.goals.join(", ")
                : (profileData as any)?.goals || "",
            }),
      });
    }
  }, [profile, isMentor, profileData, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError(null);

      // Prepare update data
      const updateData: any = {
        name: data.name,
      };

      if (isMentor) {
        const mentorData = data as z.infer<typeof updateMentorProfileSchema> & { name: string };
        updateData.headline = mentorData.headline;
        updateData.bio = mentorData.bio;
        updateData.company = mentorData.company;
        updateData.title = mentorData.title;
        updateData.industry = mentorData.industry;
        updateData.stage = mentorData.stage;
        updateData.timezone = mentorData.timezone;
        updateData.photoUrl = mentorData.photoUrl;
        updateData.linkedinUrl = mentorData.linkedinUrl;
      } else {
        const menteeData = data as z.infer<typeof updateMenteeProfileSchema> & { name: string };
        updateData.company = menteeData.company;
        updateData.stage = menteeData.stage;
        updateData.industry = menteeData.industry;
        // Convert goals string to array or keep as string
        updateData.goals = menteeData.goals;
      }

      await updateProfile(updateData);
      toast.success("Profile updated", "Your profile has been updated successfully.");
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Failed to update profile. Please try again.");
      logger.error("Profile update error", err);
      setError(errorMessage);
      toast.error("Update failed", errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card variant="default" className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <Card variant="default" className="p-6">
          <p className="text-muted-foreground">Profile not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold uppercase">Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your {isMentor ? "mentor" : "mentee"} profile
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-fit"
          >
            Back
          </Button>
        </div>

        <Card variant="default" className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-cf-red-50 border border-cf-red-200 p-4">
                <ErrorMessage message={error} />
              </div>
            )}

            {/* Profile Photo Preview */}
            {isMentor && (
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                {profileData && "photoUrl" in profileData && profileData.photoUrl && typeof profileData.photoUrl === "string" ? (
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-primary">
                    <Image
                      src={profileData.photoUrl}
                      alt={profile.name || "Profile"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
                    <span className="text-4xl font-bold text-primary">
                      {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  {...register("name")}
                  disabled={isUpdating}
                />
                {errors.name && (
                  <ErrorMessage message={errors.name.message} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Role-specific fields */}
            {isMentor ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Mentor Profile</h2>

                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    type="text"
                    placeholder="e.g., Startup Advisor & Investor"
                    {...register("headline")}
                    disabled={isUpdating}
                  />
                  {"headline" in errors && errors.headline && (
                    <ErrorMessage message={errors.headline?.message || "Invalid headline"} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={6}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about your background and expertise..."
                    {...register("bio")}
                    disabled={isUpdating}
                  />
                  {"bio" in errors && errors.bio && (
                    <ErrorMessage message={errors.bio?.message || "Invalid bio"} />
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., CEO, Founder"
                      {...register("title")}
                      disabled={isUpdating}
                    />
                    {"title" in errors && errors.title && (
                      <ErrorMessage message={errors.title?.message || "Invalid title"} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="e.g., Acme Inc."
                      {...register("company")}
                      disabled={isUpdating}
                    />
                    {errors.company && (
                      <ErrorMessage message={errors.company.message} />
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      type="text"
                      placeholder="e.g., SaaS, FinTech"
                      {...register("industry")}
                      disabled={isUpdating}
                    />
                    {errors.industry && (
                      <ErrorMessage message={errors.industry.message} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Input
                      id="stage"
                      type="text"
                      placeholder="e.g., Seed, Series A"
                      {...register("stage")}
                      disabled={isUpdating}
                    />
                    {errors.stage && (
                      <ErrorMessage message={errors.stage.message} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    type="text"
                    placeholder="e.g., America/New_York"
                    {...register("timezone")}
                    disabled={isUpdating}
                  />
                  {"timezone" in errors && errors.timezone && (
                    <ErrorMessage message={errors.timezone?.message || "Invalid timezone"} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoUrl">Photo URL</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    {...register("photoUrl")}
                    disabled={isUpdating}
                  />
                  {"photoUrl" in errors && errors.photoUrl && (
                    <ErrorMessage message={errors.photoUrl?.message || "Invalid photo URL"} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    {...register("linkedinUrl")}
                    disabled={isUpdating}
                  />
                  {"linkedinUrl" in errors && errors.linkedinUrl && (
                    <ErrorMessage message={errors.linkedinUrl?.message || "Invalid LinkedIn URL"} />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Mentee Profile</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="e.g., My Startup Inc."
                      {...register("company")}
                      disabled={isUpdating}
                    />
                    {errors.company && (
                      <ErrorMessage message={errors.company.message} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Input
                      id="stage"
                      type="text"
                      placeholder="e.g., Pre-seed, Seed"
                      {...register("stage")}
                      disabled={isUpdating}
                    />
                    {errors.stage && (
                      <ErrorMessage message={errors.stage.message} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    type="text"
                    placeholder="e.g., SaaS, FinTech"
                    {...register("industry")}
                    disabled={isUpdating}
                  />
                  {errors.industry && (
                    <ErrorMessage message={errors.industry.message} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Goals</Label>
                  <textarea
                    id="goals"
                    rows={6}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="What are you looking to achieve? (comma-separated or one per line)"
                    {...register("goals")}
                    disabled={isUpdating}
                  />
                  {"goals" in errors && errors.goals && (
                    <ErrorMessage message={errors.goals?.message || "Invalid goals"} />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter your goals separated by commas or on separate lines
                  </p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="submit"
                variant="default"
                disabled={isUpdating || !isDirty}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

