import { redirect } from "next/navigation";
import { getProfile, getDashboardPath } from "@/lib/auth/profile";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const result = await getProfile();
  if ("error" in result) {
    redirect("/login");
  }

  if (result.profile.role !== "admin") {
    redirect(getDashboardPath(result.profile.role));
  }

  return <>{children}</>;
}
