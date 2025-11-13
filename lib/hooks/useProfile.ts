"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/auth";
import apiClient from "@/lib/api/client";
import type { User } from "@/types";
import { QUERY_STALE_TIMES, QUERY_RETRY } from "@/lib/constants/query";
import { logger } from "@/lib/utils/logger";

const PROFILE_QUERY_KEY = ["profile", "me"];
const AUTH_QUERY_KEY = ["auth", "user"];

/**
 * Hook to fetch and update current user profile
 */
export function useProfile() {
  const queryClient = useQueryClient();

  // Get current user profile
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const user = await getCurrentUser();
      return user;
    },
    retry: QUERY_RETRY.DEFAULT,
    staleTime: QUERY_STALE_TIMES.STANDARD,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<User & { profile?: any }>) => {
      if (!profile) {
        throw new Error("No profile loaded");
      }

      // Update profile using the /api/profiles/[id] endpoint
      const response = await apiClient.put<User>(`/profiles/${profile.id}`, data);
      return response.data;
    },
    onSuccess: (updatedProfile) => {
      // Invalidate and refetch both profile and auth queries
      // This ensures the dashboard updates immediately after profile creation
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedProfile);
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedProfile);
    },
    onError: (error) => {
      logger.error("Profile update failed", error, { context: "useProfile.updateMutation" });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

