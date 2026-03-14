import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractRoleName, type Role } from "@/lib/auth/roles";

export async function requireRole(allowed: Role[]) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", data.user.id);

  const roleNames = roles
    ?.map((row) => extractRoleName(row.roles))
    .filter((name): name is Role => Boolean(name)) ?? [];

  if (!roleNames.some((role) => allowed.includes(role))) {
    redirect("/dashboard");
  }
}
