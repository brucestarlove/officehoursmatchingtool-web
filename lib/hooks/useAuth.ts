"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut as cognitoSignOut,
  getCurrentSession,
  forgotPassword,
  confirmPassword,
} from "@/lib/cognito/auth";
import type { UserAttributes } from "@/lib/cognito/auth";
import { logger } from "@/lib/utils/logger";
import { QUERY_STALE_TIMES, QUERY_RETRY } from "@/lib/constants/query";

const AUTH_QUERY_KEY = ["auth", "user"];

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      // First check if we have a valid Cognito session
      const session = await getCurrentSession();
      if (!session) {
        return null;
      }
      // Check if we have a pending role from signup (stored in localStorage)
      // This is used to set the role for new users when custom:role isn't in Cognito
      const pendingRole = typeof window !== 'undefined' 
        ? localStorage.getItem('pendingRole') as "mentor" | "mentee" | null
        : null;
      
      // Get user from backend, passing role if available
      const user = await getCurrentUser(pendingRole || undefined);
      
      // Clear pending role after successful fetch (role is now set in database)
      if (pendingRole && typeof window !== 'undefined') {
        localStorage.removeItem('pendingRole');
      }
      
      return user;
    },
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
      await signIn(email, password);
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
      attributes,
    }: {
      email: string;
      password: string;
      attributes?: UserAttributes;
    }) => {
      return signUp(email, password, attributes);
    },
    onError: (error) => {
      logger.error("Sign up failed", error, { context: "useAuth.signUpMutation" });
    },
  });

  // Confirm sign up mutation
  const confirmSignUpMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      await confirmSignUp(email, code);
      // After confirmation, sign in automatically
      // Note: You may want to get password from state or ask user to sign in
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      logger.error("Confirm sign up failed", error, { context: "useAuth.confirmSignUpMutation" });
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      cognitoSignOut();
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
      return forgotPassword(email);
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
      return confirmPassword(email, code, newPassword);
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      logger.error("Confirm password failed", error, { context: "useAuth.confirmPasswordMutation" });
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    confirmSignUp: confirmSignUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    confirmPassword: confirmPasswordMutation.mutateAsync,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isConfirmingSignUp: confirmSignUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
}
