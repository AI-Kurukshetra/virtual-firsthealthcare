import { Users, Stethoscope, CalendarCheck, ClipboardList, HeartPulse } from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RevenueChart } from "@/components/charts/RevenueChart";

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
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    { count: totalUsers },
    { count: totalProviders },
    { count: totalPatients },
    { count: totalAppointments }
  ] =
    await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("providers").select("id", { count: "exact", head: true }),
      supabase.from("patients").select("id", { count: "exact", head: true }),
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

  const { data: paymentRows } = await supabase
    .from("payments")
    .select("paid_at, amount")
    .gte("paid_at", startMonth.toISOString());

  const revenueBuckets = new Map<string, number>();
  for (let i = 0; i < 6; i += 1) {
    const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    revenueBuckets.set(key, 0);
  }

  (paymentRows ?? []).forEach((row) => {
    if (!row.paid_at) return;
    const date = new Date(row.paid_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    revenueBuckets.set(key, (revenueBuckets.get(key) ?? 0) + Number(row.amount ?? 0));
  });

  const revenueData = Array.from(revenueBuckets.entries()).map(([key, value]) => {
    const date = new Date(`${key}-01`);
    return { name: date.toLocaleString("en-US", { month: "short" }), revenue: Math.round(value) };
  });

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

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
          title="Total patients"
          value={String(totalPatients ?? 0)}
          change="Active patient profiles"
          icon={<HeartPulse className="h-5 w-5" />}
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
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Paid invoices by month.</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointment statistics</CardTitle>
            <CardDescription>Completion and cancellation rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            <div className="flex items-center justify-between">
              <span>Completed</span>
              <span className="text-foreground">{completedAppointments ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cancelled</span>
              <span className="text-foreground">{cancelledAppointments ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Today</span>
              <span className="text-foreground">{todayAppointments ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Revenue (6 mo)</span>
              <span className="text-foreground">${totalRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
