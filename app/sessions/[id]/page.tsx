"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionDetail } from "@/components/sessions/SessionDetail";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSession } from "@/lib/hooks/useSessions";

export default function SessionPage() {
  return (
    <ProtectedRoute>
      <SessionPageContent />
    </ProtectedRoute>
  );
}

function SessionPageContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  const { data: session, isLoading, error } = useSession(sessionId || null);

  if (!sessionId) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Invalid session ID. Please check the URL and try again.
        </div>
      </div>
    );
  }

  const handleReschedule = () => {
    // TODO: Open calendar modal or navigate to reschedule page
    router.push(`/sessions/${sessionId}/reschedule`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Failed to load session. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <SessionDetail session={session} onReschedule={handleReschedule} />
    </div>
  );
}

