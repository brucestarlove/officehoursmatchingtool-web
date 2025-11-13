"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/hooks/useAuth";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button-cf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card-cf";
import { Badge } from "@/components/ui/badge-cf";
import { logger } from "@/lib/utils/logger";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/errorMessages";
import { getAuthFormDefaults, saveAuthFormState, clearAuthFormState } from "@/lib/utils/authFormState";

export default function SignUpPage() {
  const { signUp, isSigningUp } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: getAuthFormDefaults(),
  });

  const emailValue = watch("email");
  const nameValue = watch("name");

  // Save form fields to localStorage as user types
  useEffect(() => {
    if (emailValue || nameValue) {
      saveAuthFormState({
        email: emailValue || undefined,
        name: nameValue || undefined,
      });
    }
  }, [emailValue, nameValue]);

  const selectedRole = watch("role");

  const onSubmit = async (data: SignUpInput) => {
    try {
      setError(null);
      
      // Sign up with NextAuth - automatically signs in after signup
      await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      });
      
      // Clear form state on successful signup
      clearAuthFormState();
      
      // User is automatically signed in and redirected to dashboard
      // No verification step needed for now
    } catch (err: any) {
      // Enhanced error handling
      const errorMessage = getErrorMessage(err, "Sign up failed. Please try again.");
      logger.error("Sign up error", err);
      setError(errorMessage);
      toast.error("Sign up failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cf-beige-50 px-4 py-12">
      <Card variant="default" className="w-full max-w-md">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-display font-bold uppercase">
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join CF Office Hours Matching Tool
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                disabled={isSigningUp}
              />
              {errors.name && <ErrorMessage message={errors.name.message} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                disabled={isSigningUp}
              />
              {errors.email && (
                <ErrorMessage message={errors.email.message} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    value="mentor"
                    {...register("role")}
                    className="peer sr-only"
                    disabled={isSigningUp}
                  />
                  <Card
                    variant={
                      selectedRole === "mentor" ? "yellow-border" : "default"
                    }
                    className="p-4 text-center transition-all peer-checked:bg-cf-yellow-50"
                  >
                    <Badge variant="accent" className="mb-2">
                      Mentor
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      I want to help startups
                    </p>
                  </Card>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    value="mentee"
                    {...register("role")}
                    className="peer sr-only"
                    disabled={isSigningUp}
                  />
                  <Card
                    variant={
                      selectedRole === "mentee" ? "yellow-border" : "default"
                    }
                    className="p-4 text-center transition-all peer-checked:bg-cf-yellow-50"
                  >
                    <Badge variant="default" className="mb-2">
                      Mentee
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      I need mentorship
                    </p>
                  </Card>
                </label>
              </div>
              {errors.role && <ErrorMessage message={errors.role.message} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isSigningUp}
              />
              {errors.password && (
                <ErrorMessage message={errors.password.message} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                disabled={isSigningUp}
              />
              {errors.confirmPassword && (
                <ErrorMessage message={errors.confirmPassword.message} />
              )}
            </div>

            {error && <ErrorMessage message={error} />}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              href="/login"
              className="font-medium text-cf-teal-600 hover:text-cf-teal-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
