"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import Link from "next/link";

export function AuthResetForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (values: ResetPasswordInput) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess("Password updated. You can now sign in.");
    });
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
          New password
        </label>
        <Input type="password" placeholder="••••••••" {...form.register("password")} />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
          Confirm password
        </label>
        <Input type="password" placeholder="••••••••" {...form.register("confirmPassword")} />
      </div>
      <AuthFeedback message={error} />
      <AuthFeedback message={success} tone="success" />
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Update password"}
      </Button>
      <Link className="text-xs text-accent hover:text-foreground" href="/login">
        Back to login
      </Link>
    </form>
  );
}
