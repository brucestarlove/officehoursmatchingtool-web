"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button-cf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card-cf";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, confirmPassword } = useAuth();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onRequestSubmit = async (data: ForgotPasswordInput) => {
    try {
      setError(null);
      setIsLoading(true);
      await forgotPassword(data.email);
      setEmail(data.email);
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordInput) => {
    try {
      setError(null);
      setIsLoading(true);
      await confirmPassword({
        email,
        code: data.code,
        newPassword: data.password,
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "reset") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cf-beige-50 px-4 py-12">
        <Card variant="default" className="w-full max-w-md">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-display font-bold uppercase">
                Reset Password
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter the code sent to {email} and your new password
              </p>
            </div>

            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  {...resetForm.register("code")}
                  disabled={isLoading}
                  maxLength={6}
                />
                {resetForm.formState.errors.code && (
                  <ErrorMessage
                    message={resetForm.formState.errors.code.message}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...resetForm.register("password")}
                  disabled={isLoading}
                />
                {resetForm.formState.errors.password && (
                  <ErrorMessage
                    message={resetForm.formState.errors.password.message}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...resetForm.register("confirmPassword")}
                  disabled={isLoading}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <ErrorMessage
                    message={resetForm.formState.errors.confirmPassword.message}
                  />
                )}
              </div>

              {error && <ErrorMessage message={error} />}

              <Button
                type="submit"
                variant="default"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="font-medium text-cf-teal-600 hover:text-cf-teal-700"
              >
                Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cf-beige-50 px-4 py-12">
      <Card variant="default" className="w-full max-w-md">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-display font-bold uppercase">
              Forgot Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset code
            </p>
          </div>

          <form
            onSubmit={requestForm.handleSubmit(onRequestSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...requestForm.register("email")}
                disabled={isLoading}
              />
              {requestForm.formState.errors.email && (
                <ErrorMessage
                  message={requestForm.formState.errors.email.message}
                />
              )}
            </div>

            {error && <ErrorMessage message={error} />}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-cf-teal-600 hover:text-cf-teal-700"
            >
              Back to login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

