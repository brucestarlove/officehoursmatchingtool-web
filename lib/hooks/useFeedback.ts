"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  submitFeedback,
  getMentorReputation,
  getMentorStats,
} from "@/lib/api/feedback";
import type { FeedbackSubmission } from "@/types";
import { logger } from "@/lib/utils/logger";

/**
 * Hook for feedback mutations and queries
 */
export function useFeedback() {
  const queryClient = useQueryClient();

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: FeedbackSubmission;
    }) => {
      await submitFeedback(sessionId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["sessions", variables.sessionId],
      });
      // Invalidate mentor reputation/stats if we have mentorId
      // This would need to be passed or fetched from session
    },
    onError: (error) => {
      logger.error("Failed to submit feedback", error, { context: "useFeedback.submitFeedbackMutation" });
    },
  });

  // Get mentor reputation query
  const useMentorReputation = (mentorId: string | undefined) => {
    return useQuery({
      queryKey: ["mentors", mentorId, "reputation"],
      queryFn: () => getMentorReputation(mentorId!),
      enabled: !!mentorId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get mentor stats query
  const useMentorStats = (mentorId: string | undefined) => {
    return useQuery({
      queryKey: ["mentors", mentorId, "stats"],
      queryFn: () => getMentorStats(mentorId!),
      enabled: !!mentorId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    submitFeedback: submitFeedbackMutation.mutateAsync,
    isSubmitting: submitFeedbackMutation.isPending,
    submitError: submitFeedbackMutation.error,
    useMentorReputation,
    useMentorStats,
  };
}


