"use client";

import { useParams, useRouter } from "next/navigation";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useFeedback } from "@/lib/hooks/useFeedback";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "@/lib/api/sessions";
import { Skeleton } from "@/components/ui/Skeleton";
import { getErrorMessage } from "@/lib/utils/errorMessages";
import type { FeedbackSubmission } from "@/types";

/**
 * Post-session feedback page
 * Protected route - mentee only
 */
function FeedbackPageContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { submitFeedback, isSubmitting } = useFeedback();

  // Get session details
  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: () => getSessionById(sessionId),
  });

  const handleSubmit = async (data: FeedbackSubmission) => {
    try {
      await submitFeedback({ sessionId, data });
      toast.success("Feedback submitted!", {
        description: "Thank you for your feedback. It helps us improve the matching experience.",
      });
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Failed to submit feedback", {
        description: getErrorMessage(error),
      });
    }
  };

  if (isLoadingSession) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-cf-red-200 bg-cf-red-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-cf-red-800">
            Session not found
          </h2>
          <p className="text-sm text-cf-red-600">
            The session you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  // Check if session is completed (should only allow feedback for completed sessions)
  if (session.status !== "completed") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-cf-yellow-200 bg-cf-yellow-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-cf-yellow-800">
            Session not completed
          </h2>
          <p className="text-sm text-cf-yellow-600">
            You can only submit feedback for completed sessions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Session Feedback</h1>
        <p className="text-gray-600">
          Help us improve by sharing your experience with this session.
        </p>
        {session.mentor && (
          <p className="mt-2 text-sm text-gray-500">
            Mentor: {session.mentor.name}
          </p>
        )}
      </div>

      <FeedbackForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <ProtectedRoute requiredRole="mentee">
      <FeedbackPageContent />
    </ProtectedRoute>
  );
}
