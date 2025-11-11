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
      // Then get user from backend
      return getCurrentUser();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return forgotPassword(email);
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

