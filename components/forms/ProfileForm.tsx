"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { updateProfileAction } from "@/app/(dashboard)/settings/actions";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";

export function ProfileForm({
  initialFullName,
  email,
  role,
  organization
}: {
  initialFullName: string;
  email: string;
  role: string;
  organization: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialFullName,
      phone: "",
      address: ""
    }
  });

  const onSubmit = (values: ProfileInput) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateProfileAction(values);
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
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            Full name
          </label>
          <Input {...form.register("fullName")} />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            Email
          </label>
          <Input value={email} disabled className="opacity-60" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            Role
          </label>
          <Input value={role} disabled className="opacity-60" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            Organization
          </label>
          <Input value={organization} disabled className="opacity-60" />
        </div>
      </div>
      <AuthFeedback message={error} />
      <AuthFeedback message={success} tone="success" />
      <Button size="sm" type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
