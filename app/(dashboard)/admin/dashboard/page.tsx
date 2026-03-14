import { Users, Stethoscope, CalendarCheck, ClipboardList } from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Dashboard | Virtual Health Platform"
};

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const today = getTodayRange();

  const [{ count: totalUsers }, { count: totalProviders }, { count: totalAppointments }] =
    await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("providers").select("id", { count: "exact", head: true }),
      supabase.from("appointments").select("id", { count: "exact", head: true })
    ]);

  const [{ count: todayAppointments }, { count: completedAppointments }, { count: cancelledAppointments }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .gte("scheduled_at", today.start)
        .lte("scheduled_at", today.end),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", "cancelled")
    ]);

  return (
    <DashboardShell title="Admin dashboard" description="System-wide operations">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total users"
          value={String(totalUsers ?? 0)}
          change="Across the organization"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Total providers"
          value={String(totalProviders ?? 0)}
          change="Active clinical staff"
          icon={<Stethoscope className="h-5 w-5" />}
        />
        <MetricCard
          title="Appointments today"
          value={String(todayAppointments ?? 0)}
          change="Scheduled for today"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <MetricCard
          title="Total appointments"
          value={String(totalAppointments ?? 0)}
          change="All-time appointments"
          icon={<ClipboardList className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment statistics</CardTitle>
            <CardDescription>Completion and cancellation rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Completed</span>
              <span className="text-white">{completedAppointments ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cancelled</span>
              <span className="text-white">{cancelledAppointments ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Today</span>
              <span className="text-white">{todayAppointments ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
