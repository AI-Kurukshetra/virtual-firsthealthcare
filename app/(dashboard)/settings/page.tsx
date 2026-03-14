import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractRoleName } from "@/lib/auth/roles";

export const metadata = {
  title: "Settings | Virtual Health Platform"
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const userId = userData.user?.id ?? null;
  let fullName = userData.user?.user_metadata?.full_name ?? "";
  const email = userData.user?.email ?? "";

  let role = "";
  let organization = "";

  if (userId) {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, organization_id")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.full_name) {
      fullName = profile.full_name;
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", userId)
      .maybeSingle();

    role = extractRoleName(roleRow?.roles) ?? "";

    if (profile?.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", profile.organization_id)
        .maybeSingle();
      const orgName = Array.isArray(org) ? org[0]?.name : org?.name;
      organization = typeof orgName === "string" ? orgName : "";
    }
  }

  return (
    <DashboardShell title="Settings" description="Profile & organization">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialFullName={fullName}
            email={email}
            role={role || "member"}
            organization={organization || "HealthCare Plus"}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
