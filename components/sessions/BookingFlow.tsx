"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { SessionConfirmation } from "./SessionConfirmation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useMentor, useMentorAvailability } from "@/lib/hooks/useMentors";
import { useBookSession } from "@/lib/hooks/useSessions";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/errorMessages";
import type { TimeSlot } from "@/types";
import Image from "next/image";

interface BookingFlowProps {
  mentorId: string;
  initialStartTime?: string;
}

/**
 * Multi-step booking wizard
 */
export function BookingFlow({ mentorId, initialStartTime }: BookingFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(
    initialStartTime
      ? {
          startTime: initialStartTime,
          endTime: "",
          available: true,
          duration: 60,
        }
      : null
  );
  const [duration, setDuration] = useState(60);
  const [meetingType, setMeetingType] = useState<"video" | "in-person">("video");
  const [goals, setGoals] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingTimeout, setBookingTimeout] = useState<NodeJS.Timeout | null>(null);

  const { data: mentor, isLoading: mentorLoading } = useMentor(mentorId);
  const { data: availability, isLoading: availabilityLoading } = useMentorAvailability(
    mentorId
  );

  const bookSessionMutation = useBookSession();

  // Clear error when step changes or slot changes
  useEffect(() => {
    setBookingError(null);
  }, [step, selectedSlot]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (bookingTimeout) {
        clearTimeout(bookingTimeout);
      }
    };
  }, [bookingTimeout]);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    // Auto-advance to next step if slot is selected
    if (step === 1) {
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !user) {
      setBookingError("Please select a time slot and ensure you're logged in.");
      return;
    }

    // Get mentee ID from user profile
    // The user.profile should contain the mentee profile with the actual mentee ID
    if (user.role !== "mentee") {
      setBookingError(
        "Only mentees can book sessions. Please log in with a mentee account."
      );
      return;
    }

    if (!user.profile) {
      setBookingError(
        "Your mentee profile is missing. Please complete your profile before booking."
      );
      return;
    }

    // TypeScript: we know it's a MenteeProfile since role is "mentee"
    const menteeProfile = user.profile as { id: string; userId?: string };
    const menteeId = menteeProfile.id;
    
    if (!menteeId) {
      setBookingError(
        "Unable to find your mentee profile ID. Please refresh the page and try again."
      );
      return;
    }

    // Clear any previous errors
    setBookingError(null);

    // Set timeout to show error if booking takes too long
    const timeout = setTimeout(() => {
      if (bookSessionMutation.isPending) {
        setBookingError(
          "Booking is taking longer than expected. Please check your connection and try again."
        );
      }
    }, 30000); // 30 seconds
    setBookingTimeout(timeout);

    try {
      await bookSessionMutation.mutateAsync({
        mentorId,
        menteeId: menteeId,
        startTime: selectedSlot.startTime,
        duration,
        meetingType,
        goals: goals.trim() || undefined,
      });

      // Clear timeout on success
      if (timeout) {
        clearTimeout(timeout);
        setBookingTimeout(null);
      }

      toast.success("Session booked!", {
        description: "Your session has been successfully booked.",
      });
      setStep(3);
    } catch (error: any) {
      // Clear timeout on error
      if (timeout) {
        clearTimeout(timeout);
        setBookingTimeout(null);
      }

      // Extract error message from API response if available
      let errorMessage = getErrorMessage(error);
      
      // Check for specific error messages from API
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (errorMessage.includes("not available") || errorMessage.includes("already been booked")) {
        setBookingError(
          "This time slot is no longer available. Please go back and select a different time."
        );
      } else if (errorMessage.includes("Mentee profile not found")) {
        setBookingError(
          "Your mentee profile is missing. Please complete your profile before booking."
        );
      } else if (errorMessage.includes("timeout") || errorMessage.includes("time out")) {
        setBookingError(
          "The booking request timed out. Please check your connection and try again."
        );
      } else {
        setBookingError(errorMessage);
      }

      toast.error("Failed to book session", {
        description: errorMessage,
      });
    }
  };

  if (mentorLoading || availabilityLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!mentor || !availability) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Failed to load mentor information. Please try again.
      </div>
    );
  }

  // Step 3: Confirmation
  if (step === 3 && bookSessionMutation.data) {
    return (
      <SessionConfirmation
        session={bookSessionMutation.data.session}
        mentor={mentor}
        calendarEventUrl={bookSessionMutation.data.calendarEvent?.icsUrl}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`h-2 w-24 rounded-full ${
            step >= 1 ? "bg-cf-yellow-500" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-2 w-24 rounded-full ${
            step >= 2 ? "bg-cf-yellow-500" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-2 w-24 rounded-full ${
            step >= 3 ? "bg-cf-yellow-500" : "bg-gray-200"
          }`}
        />
      </div>

      {/* Step 1: Select Time */}
      {step === 1 && (
        <div>
          <h2 className="mb-6 text-2xl font-bold">Select a Time</h2>
          <TimeSlotSelector
            availableSlots={availability.availableSlots}
            selectedSlot={selectedSlot}
            onSlotSelect={handleSlotSelect}
            duration={duration}
            onDurationChange={setDuration}
            timezone={availability.timezone}
          />
          {selectedSlot && (
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Confirm Details */}
      {step === 2 && (
        <div>
          <h2 className="mb-6 text-2xl font-bold">Confirm Details</h2>

          {/* Mentor Info */}
          <Card variant="default" className="mb-6 p-6">
            <h3 className="mb-4 text-lg font-semibold">Mentor</h3>
            <div className="flex items-center gap-4">
              {mentor.profilePhoto ? (
                <Image
                  src={mentor.profilePhoto as string}
                  alt={mentor.name}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cf-teal-100 text-cf-teal-800">
                  <span className="text-xl font-semibold">
                    {mentor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium">{mentor.name}</p>
                {mentor.title && (
                  <p className="text-sm text-muted-foreground">{mentor.title}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Date/Time Summary */}
          {selectedSlot && (
            <Card variant="default" className="mb-6 p-6">
              <h3 className="mb-4 text-lg font-semibold">Date & Time</h3>
              <p className="text-muted-foreground">
                {new Date(selectedSlot.startTime).toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Duration: {duration} minutes
              </p>
            </Card>
          )}

          {/* Meeting Type */}
          <Card variant="default" className="mb-6 p-6">
            <h3 className="mb-4 text-lg font-semibold">Meeting Type</h3>
            <div className="flex gap-2">
              <Button
                variant={meetingType === "video" ? "default" : "outline"}
                onClick={() => setMeetingType("video")}
              >
                Video Call
              </Button>
              <Button
                variant={meetingType === "in-person" ? "default" : "outline"}
                onClick={() => setMeetingType("in-person")}
              >
                In-Person
              </Button>
            </div>
          </Card>

          {/* Session Goals */}
          <Card variant="default" className="mb-6 p-6">
            <h3 className="mb-4 text-lg font-semibold">Session Goals (Optional)</h3>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="What would you like to discuss in this session?"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
              rows={4}
            />
          </Card>

          {/* Error Display */}
          {bookingError && (
            <Card variant="default" className="mb-6 border-cf-red-200 bg-cf-red-50 p-4">
              <ErrorMessage message={bookingError} />
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={bookSessionMutation.isPending}
            >
              {bookSessionMutation.isPending ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>

        </div>
      )}
    </div>
  );
}
