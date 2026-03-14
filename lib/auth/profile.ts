import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization_id: string | null;
  role: string | null;
};

export async function getProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Not authenticated." } as const;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, organization_id, role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (error) {
    return { error: error.message } as const;
  }

  if (!data) {
    return { error: "Profile not found." } as const;
  }

  return { profile: data as Profile } as const;
}

export function getDashboardPath(role: string | null | undefined) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "provider":
      return "/provider/dashboard";
    case "patient":
      return "/patient/dashboard";
    default:
      return "/settings";
  }
}
