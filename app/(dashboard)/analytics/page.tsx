import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientGrowthChart } from "@/components/charts/PatientGrowthChart";
import { AppointmentChart } from "@/components/charts/AppointmentChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { getUserContext } from "@/lib/auth/user-context";
import { getDashboardPath } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Analytics | Virtual Health Platform"
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

export default async function AnalyticsPage() {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  if (context.role !== "admin") {
    redirect(getDashboardPath(context.role));
  }

  const supabase = context.supabase;
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [{ data: patientRows }, { data: appointmentRows }, { data: paymentRows }] = await Promise.all([
    supabase
      .from("patients")
      .select("created_at")
      .gte("created_at", startMonth.toISOString()),
    supabase
      .from("appointments")
      .select("scheduled_at")
      .gte("scheduled_at", new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("payments")
      .select("paid_at, amount")
      .gte("paid_at", startMonth.toISOString())
  ]);

  const patientBuckets = new Map<string, number>();
  const revenueBuckets = new Map<string, number>();
  const appointmentBuckets = new Map<string, number>();

  for (let i = 0; i < 6; i += 1) {
    const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    patientBuckets.set(getMonthKey(month), 0);
    revenueBuckets.set(getMonthKey(month), 0);
  }

  (patientRows ?? []).forEach((row) => {
    if (!row.created_at) return;
    const date = new Date(row.created_at);
    const key = getMonthKey(date);
    patientBuckets.set(key, (patientBuckets.get(key) ?? 0) + 1);
  });

  (paymentRows ?? []).forEach((row) => {
    if (!row.paid_at) return;
    const date = new Date(row.paid_at);
    const key = getMonthKey(date);
    revenueBuckets.set(key, (revenueBuckets.get(key) ?? 0) + Number(row.amount ?? 0));
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  days.forEach((day) => appointmentBuckets.set(day, 0));

  (appointmentRows ?? []).forEach((row) => {
    if (!row.scheduled_at) return;
    const date = new Date(row.scheduled_at);
    const index = (date.getDay() + 6) % 7;
    const label = days[index];
    appointmentBuckets.set(label, (appointmentBuckets.get(label) ?? 0) + 1);
  });

  const patientGrowthData = Array.from(patientBuckets.entries()).map(([key, value]) => {
    const date = new Date(`${key}-01`);
    return { name: monthLabel(date), patients: value };
  });

  const revenueData = Array.from(revenueBuckets.entries()).map(([key, value]) => {
    const date = new Date(`${key}-01`);
    return { name: monthLabel(date), revenue: Math.round(value) };
  });

  const appointmentData = days.map((day) => ({ name: day, visits: appointmentBuckets.get(day) ?? 0 }));

  return (
    <DashboardShell title="Analytics" description="Insights">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient growth</CardTitle>
            <CardDescription>Net new patients across orgs.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientGrowthChart data={patientGrowthData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Weekly visit trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentChart data={appointmentData} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Monthly collections & billing cycles.</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
