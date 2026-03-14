import Link from "next/link";
import { Bell, LogOut, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutAction } from "@/app/(auth)/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractRoleName } from "@/lib/auth/roles";

function formatRole(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function Topbar() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const user = data.user;
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const metadataName = typeof metadata.full_name === "string" ? metadata.full_name : "";
  let fullName = metadataName;
  let role = "";

  if (user?.id) {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.full_name) {
      fullName = profile.full_name;
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .maybeSingle();

    role = extractRoleName(roleRow?.roles) ?? "";
  }

  const displayName = fullName || user?.email || "User";
  const displayRole = formatRole(role || "member");

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/5 px-6 py-4">
      <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-white/10 bg-background/40 px-4 py-2 md:w-auto">
        <Search className="h-4 w-4 text-white/50" />
        <Input
          placeholder="Search patients, appointments, labs..."
          className="h-8 border-none bg-transparent px-0 text-sm focus-visible:ring-0"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm">
          <Sparkles className="h-4 w-4" />
          Quick Note
        </Button>
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div className="text-xs">
            <p className="text-white">{displayName}</p>
            <p className="text-white/50">{displayRole}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
              <Link href="/settings" className="hover:text-white">
                Profile
              </Link>
              <span className="text-white/20">•</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
