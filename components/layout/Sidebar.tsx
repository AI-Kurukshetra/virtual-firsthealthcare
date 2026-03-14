import Link from "next/link";
import {
  Bell,
  Calendar,
  ClipboardPlus,
  FileText,
  HeartPulse,
  LayoutDashboard,
  MessageSquareText,
  Pill,
  Settings,
  Stethoscope,
  Users,
  Video
} from "lucide-react";
import { getProfile, getDashboardPath } from "@/lib/auth/profile";

const navItems = [
  { href: "/users", label: "Users", icon: Users },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/providers", label: "Providers", icon: Stethoscope },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/medical-records", label: "Records", icon: ClipboardPlus },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/labs", label: "Labs", icon: HeartPulse },
  { href: "/messaging", label: "Messaging", icon: MessageSquareText },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/telehealth", label: "Telehealth", icon: Video },
  { href: "/settings", label: "Settings", icon: Settings }
];

const roleVisibility: Record<string, Set<string>> = {
  admin: new Set([
    "/users",
    "/patients",
    "/providers",
    "/appointments",
    "/medical-records",
    "/documents",
    "/reports",
    "/prescriptions",
    "/labs",
    "/messaging",
    "/notifications",
    "/telehealth",
    "/settings"
  ]),
  provider: new Set([
    "/patients",
    "/appointments",
    "/medical-records",
    "/documents",
    "/reports",
    "/prescriptions",
    "/labs",
    "/messaging",
    "/telehealth",
    "/settings"
  ]),
  patient: new Set([
    "/appointments",
    "/documents",
    "/reports",
    "/prescriptions",
    "/messaging",
    "/telehealth",
    "/settings"
  ])
};

export async function Sidebar() {
  const profileResult = await getProfile();
  const role =
    "profile" in profileResult && profileResult.profile
      ? profileResult.profile.role ?? ""
      : "";
  const dashboardHref = getDashboardPath(role);
  const allowed = role && roleVisibility[role] ? roleVisibility[role] : null;

  const visibleItems = navItems.filter((item) => {
    if (!allowed) return true;
    return allowed.has(item.href);
  });

  return (
    <aside className="glass noise hidden h-full w-72 flex-col gap-6 rounded-[32px] p-6 md:flex">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">Virtual Health</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          HealthCare Plus
        </h1>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        <Link
          href={dashboardHref}
          className="flex items-center gap-3 rounded-2xl border border-border/40 px-4 py-3 text-sm text-foreground/70 transition hover:border-border/80 hover:bg-card/60"
        >
          <LayoutDashboard className="h-4 w-4 text-accent" />
          Dashboard
        </Link>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-border/40 px-4 py-3 text-sm text-foreground/70 transition hover:border-border/80 hover:bg-card/60"
            >
              <Icon className="h-4 w-4 text-accent" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">Active Org</p>
        <p className="text-sm font-semibold text-foreground">HealthCare Plus</p>
      </div>
    </aside>
  );
}
