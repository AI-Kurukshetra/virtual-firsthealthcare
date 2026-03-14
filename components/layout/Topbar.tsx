import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TopbarClient } from "@/components/layout/TopbarClient";

export async function Topbar() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  const user = data.user;
  let fullName = "";
  let email = "";
  let role = "";
  let avatarUrl: string | null = null;

  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, role, profile_image")
      .eq("id", user.id)
      .maybeSingle();

    fullName = profile?.full_name ?? "";
    email = profile?.email ?? user.email ?? "";
    role = profile?.role ?? "";
    avatarUrl = profile?.profile_image ?? null;
  }

  const { data: notifications } = user?.id
    ? await supabase
        .from("notifications")
        .select("id, title, body, read_at, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4)
    : { data: [] };

  const notificationList = notifications ?? [];
  const unreadCount = notificationList.filter((item) => !item.read_at && !item.is_read).length;
  const showBilling = role === "admin" || role === "provider";

  return (
    <TopbarClient
      name={fullName || user?.email || "User"}
      email={email || user?.email || ""}
      role={role || "member"}
      avatarUrl={avatarUrl}
      notifications={notificationList}
      unreadCount={unreadCount}
      showBilling={showBilling}
    />
  );
}
