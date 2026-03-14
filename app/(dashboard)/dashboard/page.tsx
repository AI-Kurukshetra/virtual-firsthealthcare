import { redirect } from "next/navigation";
import { getProfile, getDashboardPath } from "@/lib/auth/profile";

export const metadata = {
  title: "Dashboard | Virtual Health Platform"
};

export default async function DashboardPage() {
  const result = await getProfile();
  if ("error" in result) {
    redirect("/login");
  }

  redirect(getDashboardPath(result.profile.role));
}
