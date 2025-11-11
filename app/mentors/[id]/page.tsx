"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MentorProfile } from "@/components/mentor/MentorProfile";
import { Button } from "@/components/ui/button-cf";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMentor, useMentorAvailability } from "@/lib/hooks/useMentors";
import { useState } from "react";

interface MentorPageProps {
  params: Promise<{ id: string }>;
}

export default function MentorPage({ params }: MentorPageProps) {
  return (
    <ProtectedRoute>
      <MentorPageContent params={params} />
    </ProtectedRoute>
  );
}

function MentorPageContent({ params }: MentorPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const mentorId = resolvedParams.id;

  const { data: mentor, isLoading: mentorLoading, error: mentorError } = useMentor(mentorId);
  const { data: availability, isLoading: availabilityLoading } = useMentorAvailability(
    mentorId,
    undefined,
    undefined
  );

  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookClick = () => {
    if (selectedSlot) {
      router.push(`/sessions/book?mentorId=${mentorId}&startTime=${selectedSlot.startTime}`);
    } else {
      router.push(`/sessions/book?mentorId=${mentorId}`);
    }
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API call
  };

  if (mentorLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (mentorError || !mentor) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Failed to load mentor profile. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {/* Desktop Book Button - Sticky */}
      <div className="sticky top-4 z-10 mb-6 hidden md:block">
        <div className="flex justify-end">
          <Button variant="default" size="lg" onClick={handleBookClick}>
            Book Session
          </Button>
        </div>
      </div>

      <MentorProfile
        mentor={mentor}
        availableSlots={availability?.availableSlots || []}
        bookedSlots={availability?.bookedSlots || []}
        timezone={availability?.timezone || "UTC"}
        reviews={[]} // TODO: Fetch reviews when API is ready
        onBookClick={handleBookClick}
        onSlotSelect={handleSlotSelect}
        selectedSlot={selectedSlot}
        isBookmarked={isBookmarked}
        onBookmarkToggle={handleBookmarkToggle}
      />
    </div>
  );
}

