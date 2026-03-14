import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function ensureOrg(
  adminClient: ReturnType<typeof createSupabaseAdminClient>
) {
  const { data: existingOrg, error: orgError } = await adminClient
    .from("organizations")
    .select("id")
    .eq("slug", "healthcare-plus")
    .maybeSingle();

  if (orgError) {
    throw orgError;
  }

  if (existingOrg?.id) {
    return existingOrg.id as string;
  }

  const { data: newOrg, error: createError } = await adminClient
    .from("organizations")
    .insert({ name: "HealthCare Plus", slug: "healthcare-plus" })
    .select("id")
    .single();

  if (createError) {
    throw createError;
  }

  return newOrg.id as string;
}

export async function ensureRoleId(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  role: string
) {
  const { data, error } = await adminClient
    .from("roles")
    .select("id")
    .eq("name", role)
    .maybeSingle();

  if (error) throw error;
  if (data?.id) return data.id as string;

  const { data: created, error: createError } = await adminClient
    .from("roles")
    .insert({ name: role })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id as string;
}

export async function upsertPublicProfile({
  adminClient,
  userId,
  organizationId,
  fullName,
  email
}: {
  adminClient: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
  organizationId: string;
  fullName: string;
  email: string;
}) {
  const { data: existing } = await adminClient
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing?.id) return;

  const { error } = await adminClient.from("users").insert({
    id: userId,
    organization_id: organizationId,
    full_name: fullName,
    email
  });

  if (error) throw error;
}

export async function ensureRoleMapping({
  adminClient,
  userId,
  roleId
}: {
  adminClient: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
  roleId: string;
}) {
  const { error } = await adminClient
    .from("user_roles")
    .upsert({ user_id: userId, role_id: roleId }, { onConflict: "user_id,role_id" });

  if (error) throw error;
}

export async function ensurePatientOrProvider({
  adminClient,
  role,
  organizationId,
  userId
}: {
  adminClient: ReturnType<typeof createSupabaseAdminClient>;
  role: string;
  organizationId: string;
  userId: string;
}) {
  if (role === "patient") {
    const { data } = await adminClient
      .from("patients")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (data?.id) return;
    const { error } = await adminClient.from("patients").insert({
      organization_id: organizationId,
      user_id: userId
    });
    if (error) throw error;
  }

  if (role === "provider") {
    const { data } = await adminClient
      .from("providers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (data?.id) return;
    const { error } = await adminClient.from("providers").insert({
      organization_id: organizationId,
      user_id: userId,
      specialty: "General"
    });
    if (error) throw error;
  }
}
