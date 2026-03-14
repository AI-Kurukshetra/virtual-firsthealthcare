"use client";

import type React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthFeedback } from "@/components/forms/AuthFeedback";

type ActionState = { error?: string; success?: string };

const initialState: ActionState = {};

export function ActionForm({
  action,
  children,
  className,
  encType
}: {
  action: (formData: FormData) => Promise<{ error?: string; success?: string }>;
  children: React.ReactNode;
  className?: string;
  encType?: React.FormHTMLAttributes<HTMLFormElement>["encType"];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_previous, formData) => action(formData),
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className={className ?? "space-y-3"} encType={encType}>
      {children}
      <AuthFeedback message={state?.error} />
      <AuthFeedback message={state?.success} tone="success" />
    </form>
  );
}
