"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { SessionConfirmation } from "./SessionConfirmation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMentor, useMentorAvailability } from "@/lib/hooks/useMentors";
import { useBookSession } from "@/lib/hooks/useSessions";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/hooks/useToast";
import { getErrorMessage } from "@/lib/utils/errorMessages";
import type { TimeSlot, Mentor } from "@/types";

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

  const { data: mentor, isLoading: mentorLoading } = useMentor(mentorId);
  const { data: availability, isLoading: availabilityLoading } = useMentorAvailability(
    mentorId
  );

  const bookSessionMutation = useBookSession();
  const toast = useToast();

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    // Auto-advance to next step if slot is selected
    if (step === 1) {
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !user) {
      return;
    }

    try {
      await bookSessionMutation.mutateAsync({
        mentorId,
        menteeId: user.id,
        startTime: selectedSlot.startTime,
        duration,
        meetingType,
        goals: goals.trim() || undefined,
      });
      toast.success("Session booked!", "Your session has been successfully booked.");
      setStep(3);
    } catch (error) {
      toast.error("Failed to book session", getErrorMessage(error));
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
                <img
                  src={mentor.profilePhoto}
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

