"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { registerAction } from "@/app/(auth)/actions";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";

export function AuthRegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "patient"
    }
  });

  const onSubmit = (values: RegisterInput) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await registerAction(values);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.success) {
        setSuccess(result.success);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
          Full name
        </label>
        <Input placeholder="Jane Smith" {...form.register("fullName")} />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
          Work email
        </label>
        <Input type="email" placeholder="you@health.org" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
          Password
        </label>
        <Input type="password" placeholder="••••••••" {...form.register("password")} />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
          Role
        </label>
        <select
          {...form.register("role")}
          className="h-10 w-full rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
        >
          <option value="patient">Patient</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <AuthFeedback message={error} />
      <AuthFeedback message={success} tone="success" />
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-xs text-foreground/60">
        Already have an account?{" "}
        <Link className="text-accent hover:text-foreground" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
