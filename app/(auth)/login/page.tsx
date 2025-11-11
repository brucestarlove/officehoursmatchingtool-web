"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/hooks/useAuth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button-cf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card-cf";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isSigningIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);
      await signIn({ email: data.email, password: data.password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Invalid email or password. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cf-beige-50 px-4 py-12">
      <Card variant="default" className="w-full max-w-md">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-display font-bold uppercase">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your CF account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                disabled={isSigningIn}
              />
              {errors.email && (
                <ErrorMessage message={errors.email.message} />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-cf-teal-600 hover:text-cf-teal-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isSigningIn}
              />
              {errors.password && (
                <ErrorMessage message={errors.password.message} />
              )}
            </div>

            {error && <ErrorMessage message={error} />}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="font-medium text-cf-teal-600 hover:text-cf-teal-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

