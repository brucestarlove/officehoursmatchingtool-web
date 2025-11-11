"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionDetail } from "@/components/sessions/SessionDetail";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSession } from "@/lib/hooks/useSessions";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  return (
    <ProtectedRoute>
      <SessionPageContent params={params} />
    </ProtectedRoute>
  );
}

function SessionPageContent({ params }: SessionPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const sessionId = resolvedParams.id;

  const { data: session, isLoading, error } = useSession(sessionId);

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

