"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Linkedin, Twitter, Bookmark, BookmarkCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import { ExpertiseTags } from "./ExpertiseTags";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { ReviewsSection } from "./ReviewsSection";
import type { Mentor, TimeSlot, Review } from "@/types";

interface MentorProfileProps {
  mentor: Mentor;
  availableSlots?: TimeSlot[];
  bookedSlots?: TimeSlot[];
  timezone?: string;
  reviews?: Review[];
  onBookClick?: () => void;
  onSlotSelect?: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
}

/**
 * Full mentor profile component with hero, bio, availability, and reviews
 */
export function MentorProfile({
  mentor,
  availableSlots = [],
  bookedSlots = [],
  timezone = "UTC",
  reviews = [],
  onBookClick,
  onSlotSelect,
  selectedSlot,
  isBookmarked = false,
  onBookmarkToggle,
}: MentorProfileProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="default" className="p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Profile Photo */}
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 md:h-40 md:w-40">
            {mentor.profilePhoto ? (
              <Image
                src={mentor.profilePhoto}
                alt={mentor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-cf-teal-100 text-cf-teal-800">
                <span className="text-4xl font-semibold">
                  {mentor.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{mentor.name}</h1>
                {mentor.title && (
                  <p className="mt-1 text-lg text-muted-foreground">
                    {mentor.title}
                    {mentor.company && ` at ${mentor.company}`}
                  </p>
                )}
              </div>

              {/* Bookmark Button */}
              {onBookmarkToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBookmarkToggle}
                  className="flex-shrink-0"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-5 w-5 fill-cf-yellow-500 text-cf-yellow-500" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>

            {/* Social Links */}
            {mentor.socialLinks && (
              <div className="mb-4 flex gap-2">
                {mentor.socialLinks.linkedIn && (
                  <Link
                    href={mentor.socialLinks.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon">
                      <Linkedin className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {mentor.socialLinks.twitter && (
                  <Link
                    href={mentor.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon">
                      <Twitter className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Rating */}
            {mentor.rating !== undefined && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-cf-yellow-500 text-cf-yellow-500" />
                <span className="text-lg font-semibold">{mentor.rating.toFixed(1)}</span>
                {mentor.reviewCount !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    ({mentor.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Bio Section */}
      {mentor.bio && (
        <Card variant="default" className="p-6">
          <h2 className="mb-4 text-xl font-semibold">About</h2>
          <p className="text-muted-foreground">{mentor.bio}</p>

          {/* Expertise */}
          {mentor.expertise && mentor.expertise.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium">Expertise</h3>
              <ExpertiseTags expertise={mentor.expertise} />
            </div>
          )}

          {/* Industries */}
          {mentor.industries && mentor.industries.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.industries.map((industry) => (
                  <Badge key={industry} variant="outline">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Availability Calendar */}
      {availableSlots.length > 0 && (
        <AvailabilityCalendar
          availableSlots={availableSlots}
          bookedSlots={bookedSlots}
          timezone={timezone}
          onSlotSelect={onSlotSelect}
          selectedSlot={selectedSlot}
          onBookClick={onBookClick}
        />
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <ReviewsSection
          reviews={reviews}
          averageRating={mentor.rating}
          reviewCount={mentor.reviewCount}
        />
      )}
    </div>
  );
}

