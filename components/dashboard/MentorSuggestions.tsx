"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { MentorCard } from "@/components/match/MentorCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMatchMentors } from "@/lib/hooks/useMentors";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useRef, useEffect } from "react";

interface MentorSuggestionsProps {
  limit?: number;
}

/**
 * Carousel of suggested mentors based on past searches and feedback
 */
export function MentorSuggestions({ limit = 3 }: MentorSuggestionsProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  // Get suggestions based on user's goals/interests and feedback history
  const suggestionQuery = user?.profile && "goals" in user.profile
    ? user.profile.goals.join(", ")
    : "startup mentorship";

  // Enhanced filters: incorporate feedback data if available
  const { data: matchData, isLoading } = useMatchMentors({
    query: suggestionQuery,
    filters: {
      minRating: 4, // Prefer highly rated mentors
      pastInteractions: "new-mentors-only", // Suggest new mentors by default
    },
  });

  if (isLoading) {
    return (
      <Card variant="default">
        <CardHeader>
          <CardTitle>Mentors You Might Like</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const mentors = matchData?.mentors.slice(0, limit) || [];

  if (mentors.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mentors.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mentors.length - 1 ? prev + 1 : 0));
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mentors You Might Like</CardTitle>
          <Link href="/match">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Carousel */}
          <div
            ref={carouselRef}
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {mentors.map((mentor) => (
                <div key={mentor.id} className="min-w-full flex-shrink-0 px-2">
                  <MentorCard
                    mentor={mentor}
                    matchExplanation={matchData?.matchExplanations[mentor.id]}
                    showMatchReason={true}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {mentors.length > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1">
                {mentors.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-cf-yellow-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex === mentors.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

