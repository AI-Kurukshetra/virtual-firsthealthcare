"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { loginAction } from "@/app/(auth)/actions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";

export function AuthLoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (values: LoginInput) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Email
        </label>
        <Input type="email" placeholder="you@health.org" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Password
        </label>
        <Input type="password" placeholder="••••••••" {...form.register("password")} />
      </div>
      <AuthFeedback message={error} />
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-xs text-white/50">
        By continuing, you agree to HIPAA-grade security and audit logging.
      </p>
      <p className="text-xs text-white/60">
        New here?{" "}
        <Link className="text-accent hover:text-white" href="/register">
          Create an account
        </Link>
      </p>
    </form>
  );
}
