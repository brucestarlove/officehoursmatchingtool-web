"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import { MatchExplanationBadge } from "./MatchExplanationBadge";
import type { Mentor } from "@/types";

interface MentorCardProps {
  mentor: Mentor;
  matchExplanation?: string;
  onBookClick?: (mentorId: string) => void;
  showMatchReason?: boolean;
}

/**
 * Mentor card component with profile info, expertise, rating, and CTAs
 */
export function MentorCard({
  mentor,
  matchExplanation,
  onBookClick,
  showMatchReason = false,
}: MentorCardProps) {
  const handleBookClick = () => {
    if (onBookClick) {
      onBookClick(mentor.id);
    }
  };

  return (
    <Card variant="default" className="flex h-full flex-col transition-shadow hover:shadow-lg">
      <CardContent className="flex-1 p-6">
        {/* Header with photo and basic info */}
        <div className="mb-4 flex items-start gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
            {mentor.profilePhoto ? (
              <Image
                src={mentor.profilePhoto}
                alt={mentor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-cf-teal-100 text-cf-teal-800">
                <span className="text-xl font-semibold">
                  {mentor.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{mentor.name}</h3>
            {mentor.title && (
              <p className="text-sm text-muted-foreground truncate">
                {mentor.title}
                {mentor.company && ` at ${mentor.company}`}
              </p>
            )}

            {/* Rating */}
            {mentor.rating !== undefined && (
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-4 w-4 fill-cf-yellow-500 text-cf-yellow-500" />
                <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                {mentor.reviewCount !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    ({mentor.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Match explanation */}
        {showMatchReason && matchExplanation && (
          <div className="mb-4">
            <MatchExplanationBadge explanation={matchExplanation} />
          </div>
        )}

        {/* Bio snippet */}
        {mentor.bio && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {mentor.bio}
          </p>
        )}

        {/* Expertise tags */}
        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {mentor.expertise.slice(0, 4).map((exp) => (
              <Badge key={exp} variant="default" className="text-xs">
                {exp}
              </Badge>
            ))}
            {mentor.expertise.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.expertise.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Available time slots preview */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Available this week</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-6 pt-0">
        <Link href={`/mentors/${mentor.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
        <Button
          variant="default"
          className="flex-1"
          onClick={handleBookClick}
        >
          Book Session
        </Button>
      </CardFooter>
    </Card>
  );
}

