"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { MenteeCard } from "@/components/match/MenteeCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMatchMentees } from "@/lib/hooks/useMentees";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useRef } from "react";

interface MenteeSuggestionsProps {
  limit?: number;
  hasProfile?: boolean;
}

/**
 * Carousel of suggested mentees based on mentor expertise and mentee goals
 */
export function MenteeSuggestions({ limit = 3, hasProfile = true }: MenteeSuggestionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  // Get mentor's expertise to match with mentees
  const getExpertiseString = () => {
    if (!user?.profile || !("expertise" in user.profile)) {
      return "startup mentorship";
    }
    
    const expertise = user.profile.expertise as string[] | null | undefined;
    
    if (Array.isArray(expertise) && expertise.length > 0) {
      return expertise.join(", ");
    }
    
    return "startup mentorship";
  };
  
  const matchQuery = getExpertiseString();

  // Fetch mentees that match mentor's expertise
  // Only fetch if user has a profile
  const { data: matchData, isLoading } = useMatchMentees({
    query: hasProfile ? matchQuery : "", // Empty query if no profile
    filters: {
      pastInteractions: "new-mentees-only", // Suggest new mentees by default
    },
  });

  // Show message if user hasn't created profile yet (check before loading state)
  if (!hasProfile) {
    return (
      <Card variant="default">
        <CardHeader>
          <CardTitle>Potential Mentee Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Complete your profile to see mentees that match your expertise and interests.
            </p>
            <Link href="/profile">
              <Button variant="default">
                Create Your Profile!
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card variant="default">
        <CardHeader>
          <CardTitle>Potential Mentee Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const mentees = matchData?.mentees.slice(0, limit) || [];

  if (mentees.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mentees.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mentees.length - 1 ? prev + 1 : 0));
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

  const handleViewClick = (menteeId: string) => {
    router.push(`/mentees/${menteeId}`);
  };

  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Potential Mentee Matches</CardTitle>
          <Link href="/match?role=mentee">
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
              {mentees.map((mentee) => (
                <div key={mentee.id} className="min-w-full flex-shrink-0 px-2">
                  <MenteeCard
                    mentee={mentee}
                    matchExplanation={matchData?.matchExplanations[mentee.id]}
                    showMatchReason={true}
                    onViewClick={handleViewClick}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {mentees.length > 1 && (
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
                {mentees.map((_, index) => (
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
                disabled={currentIndex === mentees.length - 1}
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

