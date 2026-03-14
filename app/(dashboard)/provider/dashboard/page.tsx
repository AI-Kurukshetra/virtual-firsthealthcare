import { redirect } from "next/navigation";
import { CalendarClock, ClipboardPlus, MessageSquareText, Pill, Users } from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserContext } from "@/lib/auth/user-context";

export const metadata = {
  title: "Provider Dashboard | Virtual Health Platform"
};

type AppointmentRow = {
  id: string;
  scheduled_at: string | null;
  status: string | null;
  patients: { users: { full_name: string | null } | null } | null;
};

type PatientRow = {
  id: string;
  users: { full_name: string | null; email: string | null } | null;
};

type RecordRow = {
  id: string;
  created_at: string | null;
  patients: { users: { full_name: string | null } | null } | null;
};

type PrescriptionRow = {
  id: string;
  medications: { name: string | null } | null;
  patients: { users: { full_name: string | null } | null } | null;
};

type MessageRow = {
  id: string;
  body: string | null;
  created_at: string | null;
  sender_id: string | null;
};

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default async function ProviderDashboardPage() {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  const providerId = context.providerId;
  if (!providerId) {
    return (
      <DashboardShell title="Provider dashboard" description="Your clinic view">
        <AuthFeedback message="Provider profile not found. Please contact support or your administrator." />
      </DashboardShell>
    );
  }

  const supabase = context.supabase;
  const today = getTodayRange();

  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, patients(users(full_name))")
    .eq("provider_id", providerId)
    .gte("scheduled_at", today.start)
    .lte("scheduled_at", today.end)
    .order("scheduled_at", { ascending: true })
    .returns<AppointmentRow[]>();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, users(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(6)
    .returns<PatientRow[]>();

  const { data: recentRecords } = await supabase
    .from("medical_records")
    .select("id, created_at, patients(users(full_name))")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<RecordRow[]>();

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("id, medications(name), patients(users(full_name))")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<PrescriptionRow[]>();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, created_at, sender_id")
    .eq("receiver_id", context.userId)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<MessageRow[]>();

  return (
    <DashboardShell title="Provider dashboard" description="Your clinic view">
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard
          title="Today's appointments"
          value={String(todayAppointments?.length ?? 0)}
          change="Your scheduled visits"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <MetricCard
          title="Assigned patients"
          value={String(patients?.length ?? 0)}
          change="Active patient list"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Recent records"
          value={String(recentRecords?.length ?? 0)}
          change="Last updates"
          icon={<ClipboardPlus className="h-5 w-5" />}
        />
        <MetricCard
          title="Prescriptions"
          value={String(prescriptions?.length ?? 0)}
          change="Recent prescriptions"
          icon={<Pill className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s appointments</CardTitle>
            <CardDescription>Upcoming visits for today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            {(todayAppointments ?? []).length === 0 ? (
              <p className="text-foreground/50">No appointments scheduled.</p>
            ) : (
              todayAppointments?.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <span>{appointment.patients?.users?.full_name ?? "Patient"}</span>
                  <span>
                    {appointment.scheduled_at
                      ? new Date(appointment.scheduled_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : ""}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient list</CardTitle>
            <CardDescription>Recently assigned patients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            {(patients ?? []).length === 0 ? (
              <p className="text-foreground/50">No assigned patients yet.</p>
            ) : (
              patients?.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between">
                  <span>{patient.users?.full_name ?? "Patient"}</span>
                  <span className="text-foreground/40">{patient.users?.email ?? ""}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent records</CardTitle>
            <CardDescription>Latest patient updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            {(recentRecords ?? []).length === 0 ? (
              <p className="text-foreground/50">No recent records.</p>
            ) : (
              recentRecords?.map((record) => (
                <div key={record.id} className="flex items-center justify-between">
                  <span>{record.patients?.users?.full_name ?? "Patient"}</span>
                  <span className="text-foreground/40">
                    {record.created_at
                      ? new Date(record.created_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent messages</CardTitle>
            <CardDescription>Patient communications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            {(messages ?? []).length === 0 ? (
              <p className="text-foreground/50">No new messages.</p>
            ) : (
              messages?.map((message) => (
                <div key={message.id} className="flex items-center justify-between">
                  <span className="line-clamp-1">{message.body ?? ""}</span>
                  <span className="text-foreground/40">
                    {message.created_at
                      ? new Date(message.created_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
