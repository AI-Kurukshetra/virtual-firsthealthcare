import { redirect } from "next/navigation";
import { getProfile, getDashboardPath } from "@/lib/auth/profile";

export default async function PatientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const result = await getProfile();
  if ("error" in result) {
    redirect("/login");
  }

  if (result.profile.role !== "patient") {
    redirect(getDashboardPath(result.profile.role));
  }

  return <>{children}</>;
}
