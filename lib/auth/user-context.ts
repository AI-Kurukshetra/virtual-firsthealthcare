import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractRoleName, type Role } from "@/lib/auth/roles";

export type UserContext = {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
  role: Role | "member";
  organizationId: string | null;
  patientId: string | null;
  providerId: string | null;
};

export async function getUserContext(): Promise<UserContext | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return { error: "Not authenticated." };
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const roleName = extractRoleName(roleRow?.roles);
  const role = (roleName ?? "member") as Role | "member";

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", data.user.id)
    .maybeSingle();

  const { data: patientRow } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const { data: providerRow } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  return {
    supabase,
    userId: data.user.id,
    role,
    organizationId: profile?.organization_id ?? null,
    patientId: patientRow?.id ?? null,
    providerId: providerRow?.id ?? null
  };
}
