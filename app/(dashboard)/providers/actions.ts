"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserContext } from "@/lib/auth/user-context";
import {
  ensureOrg,
  ensurePatientOrProvider,
  ensureRoleId,
  ensureRoleMapping,
  upsertPublicProfile
} from "@/lib/auth/provision";
import {
  providerCreateSchema,
  providerUpdateSchema,
  type ProviderCreateInput,
  type ProviderUpdateInput
} from "@/lib/validations/providers";

function parseProviderCreate(formData: FormData): ProviderCreateInput {
  return {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    specialty: String(formData.get("specialty") ?? "").trim() || undefined,
    licenseNumber: String(formData.get("licenseNumber") ?? "").trim() || undefined
  };
}

function parseProviderUpdate(formData: FormData): ProviderUpdateInput {
  return {
    id: String(formData.get("id") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    specialty: String(formData.get("specialty") ?? "").trim() || undefined,
    licenseNumber: String(formData.get("licenseNumber") ?? "").trim() || undefined
  };
}

export async function createProviderAction(formData: FormData) {
  const parsed = providerCreateSchema.safeParse(parseProviderCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid provider details." };
  }

  const context = await getUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  if (context.role !== "admin") {
    return { error: "Only admins can invite providers." };
  }

  const adminClient = createSupabaseAdminClient();
  const orgId = await ensureOrg(adminClient);
  const roleId = await ensureRoleId(adminClient, "provider");

  const { data: created, error: adminError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      role: "provider"
    }
  });

  if (adminError || !created?.user) {
    return { error: adminError?.message ?? "Failed to create provider." };
  }

  const userId = created.user.id;

  await upsertPublicProfile({
    adminClient,
    userId,
    organizationId: orgId,
    fullName: parsed.data.fullName,
    email: parsed.data.email
  });

  await ensureRoleMapping({ adminClient, userId, roleId });
  await ensurePatientOrProvider({
    adminClient,
    role: "provider",
    organizationId: orgId,
    userId
  });

  const { error: providerError } = await adminClient
    .from("providers")
    .update({
      specialty: parsed.data.specialty || null,
      license_number: parsed.data.licenseNumber || null
    })
    .eq("user_id", userId);

  if (providerError) {
    return { error: providerError.message };
  }

  return { success: "Provider created." };
}

export async function updateProviderAction(formData: FormData) {
  const parsed = providerUpdateSchema.safeParse(parseProviderUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid provider details." };
  }

  const context = await getUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  const { data: provider } = await context.supabase
    .from("providers")
    .select("id, user_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!provider?.id) {
    return { error: "Provider not found." };
  }

  const { error: updateError } = await context.supabase
    .from("providers")
    .update({
      specialty: parsed.data.specialty || null,
      license_number: parsed.data.licenseNumber || null
    })
    .eq("id", parsed.data.id);

  if (updateError) {
    return { error: updateError.message };
  }

  if (provider.user_id) {
    if (context.role === "admin") {
      const adminClient = createSupabaseAdminClient();
      const { error: userError } = await adminClient
        .from("users")
        .update({ full_name: parsed.data.fullName })
        .eq("id", provider.user_id);
      if (userError) {
        return { error: userError.message };
      }
    } else if (provider.user_id === context.userId) {
      const { error: userError } = await context.supabase
        .from("users")
        .update({ full_name: parsed.data.fullName })
        .eq("id", provider.user_id);
      if (userError) {
        return { error: userError.message };
      }
    }
  }

  return { success: "Provider updated." };
}

export async function deleteProviderAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing provider id." };

  const context = await getUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  if (context.role !== "admin") {
    return { error: "Only admins can remove providers." };
  }

  const { error } = await context.supabase.from("providers").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Provider removed." };
}
