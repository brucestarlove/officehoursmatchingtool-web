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
      const result = await signIn(email, password);
      if (result.error) {
        throw new Error(result.error.message || "Sign in failed");
      }
      // Invalidate and refetch user
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      return getCurrentUser();
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
      const result = await signUp(email, password, name);
      if (result.error) {
        throw new Error(result.error.message || "Sign up failed");
      }
      // Invalidate and refetch user
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      return getCurrentUser();
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
      queryClient.clear();
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      logger.error("Sign out failed", error, { context: "useAuth.signOutMutation" });
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
