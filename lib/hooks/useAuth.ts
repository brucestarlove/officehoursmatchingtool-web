"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getCurrentUser } from "@/lib/api/auth";
import { signIn, signUp, signOut, forgotPassword, confirmPassword } from "@/lib/auth/client";
import { logger } from "@/lib/utils/logger";
import { QUERY_STALE_TIMES, QUERY_RETRY } from "@/lib/constants/query";

const AUTH_QUERY_KEY = ["auth", "user"];

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();

  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      // Check NextAuth session
      if (!session?.user) {
        return null;
      }
      
      // Get full user profile from backend
      const user = await getCurrentUser();
      return user;
    },
    enabled: sessionStatus !== "loading" && !!session?.user,
    retry: QUERY_RETRY.NONE,
    staleTime: QUERY_STALE_TIMES.STANDARD,
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      try {
        const result = await signIn(email, password);
        
        if (result.error) {
          // Extract error message with fallback
          const errorMessage = result.error.message?.trim() || "Sign in failed";
          throw new Error(errorMessage);
        }
        
        if (!result.data) {
          throw new Error("Sign in failed: No data returned");
        }
        
        // Invalidate and refetch user
        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        return getCurrentUser();
      } catch (error) {
        // Ensure we always throw an Error with a valid message
        if (error instanceof Error) {
          if (!error.message || error.message.trim() === "") {
            error.message = "Sign in failed: Unknown error occurred";
          }
          throw error;
        }
        throw new Error(error instanceof Error ? error.message : "Sign in failed: Unexpected error");
      }
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      logger.error("Sign in failed", error, { context: "useAuth.signInMutation" });
    },
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
      role,
    }: {
      email: string;
      password: string;
      name?: string;
      role?: "mentor" | "mentee";
    }) => {
      try {
        const result = await signUp(email, password, name);
        
        if (result.error) {
          // Extract error message with fallback
          const errorMessage = result.error.message?.trim() || "Sign up failed";
          throw new Error(errorMessage);
        }
        
        if (!result.data) {
          throw new Error("Sign up failed: No data returned");
        }
        
        // Invalidate and refetch user
        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        return getCurrentUser();
      } catch (error) {
        // Ensure we always throw an Error with a valid message
        if (error instanceof Error) {
          if (!error.message || error.message.trim() === "") {
            error.message = "Sign up failed: Unknown error occurred";
          }
          throw error;
        }
        throw new Error(error instanceof Error ? error.message : "Sign up failed: Unexpected error");
      }
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      logger.error("Sign up failed", error, { context: "useAuth.signUpMutation" });
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await signOut();
      // Clear all queries
      queryClient.clear();
      // Invalidate auth query to ensure session is cleared
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
    onSuccess: () => {
      // Force a hard redirect to ensure session is cleared
      window.location.href = "/login";
    },
    onError: (error) => {
      logger.error("Sign out failed", error, { context: "useAuth.signOutMutation" });
      // Even on error, try to redirect
      window.location.href = "/login";
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return await forgotPassword(email);
    },
    onError: (error) => {
      logger.error("Forgot password failed", error, { context: "useAuth.forgotPasswordMutation" });
    },
  });

  // Confirm password mutation
  const confirmPasswordMutation = useMutation({
    mutationFn: async ({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }) => {
      return await confirmPassword({ email, code, newPassword });
    },
    onError: (error) => {
      logger.error("Confirm password failed", error, { context: "useAuth.confirmPasswordMutation" });
    },
  });

  return {
    user,
    isLoading: isLoading || sessionStatus === "loading",
    error,
    isAuthenticated: !!user,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    confirmPassword: confirmPasswordMutation.mutateAsync,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isResettingPassword: confirmPasswordMutation.isPending,
  };
}
