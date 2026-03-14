"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDashboardPath } from "@/lib/auth/profile";
import {
  ensureOrg,
  ensurePatientOrProvider,
  ensureRoleId,
  ensureRoleMapping,
  upsertPublicProfile
} from "@/lib/auth/provision";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput
} from "@/lib/validations/auth";


export async function loginAction(values: LoginInput) {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid credentials." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return { error: error.message };
  }

  const roleResponse = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user?.id ?? "")
    .maybeSingle();

  const redirectPath = getDashboardPath(roleResponse.data?.role ?? null);
  redirect(redirectPath);
}

export async function registerAction(values: RegisterInput) {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please complete all fields." };
  }

  const supabase = await createSupabaseServerClient();

  let userId: string | null = null;
  let hasSession = false;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role
      }
    }
  });

  if (error) {
    const isRateLimited = /rate limit|too many requests|over_email_send_rate_limit/i.test(
      error.message
    );

    if (!isRateLimited) {
      return { error: error.message };
    }

    // Dev-friendly fallback: create user via service role to bypass email rate limits.
    const adminClient = createSupabaseAdminClient();
    const { data: created, error: adminError } = await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.fullName,
        role: parsed.data.role
      }
    });

    if (adminError || !created?.user) {
      return { error: adminError?.message ?? "Failed to create account." };
    }

    userId = created.user.id;

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password
    });

    if (loginError) {
      return { error: loginError.message };
    }

    hasSession = true;
  } else {
    if (!data.user) {
      return { error: "Check your email to confirm your account." };
    }

    userId = data.user.id;
    hasSession = Boolean(data.session);
  }

  const adminClient = createSupabaseAdminClient();
  const orgId = await ensureOrg(adminClient);
  const roleId = await ensureRoleId(adminClient, parsed.data.role);

  await upsertPublicProfile({
    adminClient,
    userId,
    organizationId: orgId,
    fullName: parsed.data.fullName,
    email: parsed.data.email
  });

  await ensureRoleMapping({
    adminClient,
    userId,
    roleId
  });

  await ensurePatientOrProvider({
    adminClient,
    role: parsed.data.role,
    organizationId: orgId,
    userId
  });

  if (!hasSession) {
    return { success: "Check your email to confirm your account." };
  }

  const roleResponse = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const redirectPath = getDashboardPath(roleResponse.data?.role ?? null);
  redirect(redirectPath);
}

export async function forgotPasswordAction(values: ForgotPasswordInput) {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Reset link sent." };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
