"use client";

import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BookingFlow } from "@/components/sessions/BookingFlow";

export default function BookSessionPage() {
  return (
    <ProtectedRoute>
      <BookSessionPageContent />
    </ProtectedRoute>
  );
}

function BookSessionPageContent() {
  const searchParams = useSearchParams();
  const mentorId = searchParams.get("mentorId") || "";
  const startTime = searchParams.get("startTime") || undefined;

  if (!mentorId) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          No mentor selected. Please select a mentor to book a session.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <BookingFlow mentorId={mentorId} initialStartTime={startTime} />
    </div>
  );
}

