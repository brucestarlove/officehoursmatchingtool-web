"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { TimeSlotSelector } from "@/components/sessions/TimeSlotSelector";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useSession, useRescheduleSession } from "@/lib/hooks/useSessions";
import { useMentorAvailability } from "@/lib/hooks/useMentors";
import { useToast } from "@/lib/hooks/useToast";
import { getErrorMessage } from "@/lib/utils/errorMessages";
import type { TimeSlot } from "@/types";
import { ChevronLeft } from "lucide-react";

export default function ReschedulePage() {
  return (
    <ProtectedRoute>
      <ReschedulePageContent />
    </ProtectedRoute>
  );
}

function ReschedulePageContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const { data: session, isLoading: sessionLoading, error: sessionError } =
    useSession(sessionId || null);
  const rescheduleMutation = useRescheduleSession();
  const toast = useToast();

  // Get mentor availability for the mentor in this session
  const mentorId = session?.mentorId;
  const { data: availability, isLoading: availabilityLoading } =
    useMentorAvailability(mentorId || null);

  // Clear error when slot changes
  useEffect(() => {
    setRescheduleError(null);
  }, [selectedSlot]);

  if (!sessionId) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Invalid session ID. Please check the URL and try again.
        </div>
      </div>
    );
  }

  if (sessionLoading || availabilityLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Failed to load session. Please try again.
        </div>
      </div>
    );
  }

  if (!session.mentor) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Mentor information not found for this session.
        </div>
      </div>
    );
  }

  // Check if session can be rescheduled
  if (session.status !== "scheduled") {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Only scheduled sessions can be rescheduled. This session is currently{" "}
          {session.status}.
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setRescheduleError("Please select a new time slot.");
      return;
    }

    setRescheduleError(null);

    try {
      await rescheduleMutation.mutateAsync({
        sessionId: session.id,
        newStartTime: selectedSlot.startTime,
      });

      toast.success(
        "Session rescheduled!",
        "Your session has been successfully rescheduled."
      );
      router.push(`/sessions/${sessionId}`);
    } catch (error: any) {
      let errorMessage = getErrorMessage(error);

      // Check for specific error messages from API
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (
        errorMessage.includes("not available") ||
        errorMessage.includes("conflicts")
      ) {
        setRescheduleError(
          "This time slot is not available. Please select a different time."
        );
      } else if (errorMessage.includes("authorized")) {
        setRescheduleError(
          "You are not authorized to reschedule this session."
        );
      } else {
        setRescheduleError(errorMessage);
      }

      toast.error("Failed to reschedule session", errorMessage);
    }
  };

  const currentStartTime = new Date(session.startTime);
  const currentEndTime = new Date(
    currentStartTime.getTime() + session.duration * 60 * 1000
  );

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold uppercase">
              Reschedule Session
            </h1>
            <p className="mt-2 text-muted-foreground">
              Select a new time for your session
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Current Session Info */}
        <Card variant="default" className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Current Session</h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Mentor:
              </span>{" "}
              <span className="font-medium">{session.mentor.name}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Current Time:
              </span>{" "}
              <span className="font-medium">
                {currentStartTime.toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                -{" "}
                {currentEndTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Duration:
              </span>{" "}
              <span className="font-medium">{session.duration} minutes</span>
            </div>
          </div>
        </Card>

        {/* Time Slot Selector */}
        {availability ? (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Select New Time</h2>
            <TimeSlotSelector
              availableSlots={availability.availableSlots}
              selectedSlot={selectedSlot}
              onSlotSelect={setSelectedSlot}
              duration={session.duration}
              onDurationChange={() => {
                // Duration is fixed for rescheduling
              }}
              timezone={availability.timezone}
            />
          </div>
        ) : (
          <Card variant="default" className="p-6">
            <div className="text-center text-muted-foreground">
              Loading available time slots...
            </div>
          </Card>
        )}

        {/* Error Display */}
        {rescheduleError && (
          <Card variant="default" className="border-cf-red-200 bg-cf-red-50 p-4">
            <ErrorMessage message={rescheduleError} />
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedSlot || rescheduleMutation.isPending}
          >
            {rescheduleMutation.isPending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Rescheduling...
              </>
            ) : (
              "Confirm Reschedule"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

