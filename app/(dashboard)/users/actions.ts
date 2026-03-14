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
  userCreateSchema,
  userUpdateSchema,
  type UserCreateInput,
  type UserUpdateInput
} from "@/lib/validations/users";

function parseUserCreate(formData: FormData): UserCreateInput {
  return {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "patient") as UserCreateInput["role"],
    phone: String(formData.get("phone") ?? "").trim() || undefined
  };
}

function parseUserUpdate(formData: FormData): UserUpdateInput {
  const roleValue = String(formData.get("role") ?? "").trim();
  return {
    id: String(formData.get("id") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    role: roleValue ? (roleValue as UserUpdateInput["role"]) : undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined
  };
}

export async function createUserAction(formData: FormData) {
  const parsed = userCreateSchema.safeParse(parseUserCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid user." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin") {
    return { error: "Only admins can create users." };
  }

  const adminClient = createSupabaseAdminClient();
  const orgId = await ensureOrg(adminClient);
  const roleId = await ensureRoleId(adminClient, parsed.data.role);

  const { data: created, error: adminError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      phone: parsed.data.phone ?? null
    }
  });

  if (adminError || !created?.user) {
    return { error: adminError?.message ?? "Failed to create user." };
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
    role: parsed.data.role,
    organizationId: orgId,
    userId
  });

  await adminClient
    .from("users")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null
    })
    .eq("id", userId);

  return { success: "User created." };
}

export async function updateUserAction(formData: FormData) {
  const parsed = userUpdateSchema.safeParse(parseUserUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid user." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin") {
    return { error: "Only admins can update users." };
  }

  const adminClient = createSupabaseAdminClient();

  const { data: userRow } = await adminClient
    .from("users")
    .select("id, organization_id, email")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!userRow?.id) {
    return { error: "User not found." };
  }

  const { error: updateError } = await adminClient
    .from("users")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null
    })
    .eq("id", parsed.data.id);

  if (updateError) {
    return { error: updateError.message };
  }

  if (parsed.data.role) {
    const roleId = await ensureRoleId(adminClient, parsed.data.role);
    await adminClient.from("user_roles").delete().eq("user_id", parsed.data.id);
    await ensureRoleMapping({ adminClient, userId: parsed.data.id, roleId });

    await ensurePatientOrProvider({
      adminClient,
      role: parsed.data.role,
      organizationId: userRow.organization_id,
      userId: parsed.data.id
    });

    await adminClient.auth.admin.updateUserById(parsed.data.id, {
      user_metadata: {
        role: parsed.data.role,
        full_name: parsed.data.fullName,
        phone: parsed.data.phone ?? null
      }
    });
  }

  return { success: "User updated." };
}

export async function deleteUserAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing user id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin") {
    return { error: "Only admins can delete users." };
  }

  const adminClient = createSupabaseAdminClient();
  await adminClient.from("user_roles").delete().eq("user_id", id);
  await adminClient.from("patients").delete().eq("user_id", id);
  await adminClient.from("providers").delete().eq("user_id", id);
  await adminClient.from("users").delete().eq("id", id);

  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error) {
    return { error: error.message };
  }

  return { success: "User removed." };
}
