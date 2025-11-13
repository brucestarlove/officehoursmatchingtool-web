"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MentorProfile } from "@/components/mentor/MentorProfile";
import { Button } from "@/components/ui/button-cf";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMentor, useMentorAvailability } from "@/lib/hooks/useMentors";
import { useState } from "react";

export default function MentorPage() {
  return (
    <ProtectedRoute>
      <MentorPageContent />
    </ProtectedRoute>
  );
}

function MentorPageContent() {
  const router = useRouter();
  const params = useParams();
  const mentorId = params?.id as string;

  const { data: mentor, isLoading: mentorLoading, error: mentorError } = useMentor(mentorId || "");
  const { data: availability, isLoading: availabilityLoading } = useMentorAvailability(
    mentorId || "",
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

  if (!mentorId) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Invalid mentor ID. Please check the URL and try again.
        </div>
      </div>
    );
  }

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

