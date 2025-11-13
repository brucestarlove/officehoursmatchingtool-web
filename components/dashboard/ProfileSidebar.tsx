"use client";

import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { useProfile } from "@/lib/hooks/useProfile";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import Image from "next/image";

/**
 * Profile sidebar component showing mentor/mentee info
 */
export function ProfileSidebar() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Card variant="default" className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const isMentor = profile.role === "mentor";
  const profileData = profile.profile;

  return (
    <Card variant="default" className="p-6">
      <div className="space-y-4">
        {/* Profile Photo */}
        {profileData && "photoUrl" in profileData && profileData.photoUrl && typeof profileData.photoUrl === "string" ? (
          <div className="flex justify-center">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src={profileData.photoUrl}
                alt={profile.name || "Profile"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
              <span className="text-2xl font-bold text-primary">
                {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          </div>
        )}

        {/* Name */}
        <div className="text-center">
          <h3 className="font-semibold text-lg">{profile.name || profile.email}</h3>
          {profile.name && (
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          )}
        </div>

        {/* Role-specific info */}
        {isMentor && profileData && "headline" in profileData && (
          <div className="space-y-2">
            {(() => {
              const headline = profileData.headline;
              return headline && typeof headline === "string" ? (
                <p className="text-sm text-center text-muted-foreground line-clamp-2">
                  {headline}
                </p>
              ) : null;
            })()}
            {(() => {
              const company = "company" in profileData ? profileData.company : undefined;
              const title = "title" in profileData ? profileData.title : undefined;
              return company && title && typeof company === "string" && typeof title === "string" ? (
                <p className="text-xs text-center text-muted-foreground">
                  {title} at {company}
                </p>
              ) : null;
            })()}
            {(() => {
              const industry = "industry" in profileData ? profileData.industry : undefined;
              return industry && typeof industry === "string" ? (
                <p className="text-xs text-center text-muted-foreground">
                  {industry}
                </p>
              ) : null;
            })()}
          </div>
        )}

        {!isMentor && profileData && "goals" in profileData && (
          <div className="space-y-2">
            {(() => {
              const company = "company" in profileData ? profileData.company : undefined;
              return company && typeof company === "string" ? (
                <p className="text-xs text-center text-muted-foreground">
                  {company}
                </p>
              ) : null;
            })()}
            {(() => {
              const stage = "stage" in profileData ? profileData.stage : undefined;
              return stage && typeof stage === "string" ? (
                <p className="text-xs text-center text-muted-foreground">
                  Stage: {stage}
                </p>
              ) : null;
            })()}
            {(() => {
              const industry = "industry" in profileData ? profileData.industry : undefined;
              return industry && typeof industry === "string" ? (
                <p className="text-xs text-center text-muted-foreground">
                  {industry}
                </p>
              ) : null;
            })()}
          </div>
        )}

        {/* View Profile Button */}
        <Link href="/profile">
          <Button variant="default" className="w-full">
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
}

