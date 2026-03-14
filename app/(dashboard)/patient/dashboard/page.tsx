import { redirect } from "next/navigation";
import { CalendarClock, FileText, Pill } from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserContext } from "@/lib/auth/user-context";

export const metadata = {
  title: "Patient Dashboard | Virtual Health Platform"
};

type UpcomingAppointment = {
  id: string;
  scheduled_at: string | null;
  status: string | null;
  providers: { users: { full_name: string | null } | null } | null;
};

type PrescriptionRow = {
  id: string;
  dosage: string | null;
  frequency: string | null;
  medications: { name: string | null } | null;
};

type ReportRow = {
  id: string;
  bucket: string | null;
  documents: { title: string | null; created_at: string | null } | null;
};

export default async function PatientDashboardPage() {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  const patientId = context.patientId;
  if (!patientId) {
    return (
      <DashboardShell title="Patient dashboard" description="Your care summary">
        <AuthFeedback message="Patient profile not found. Please contact support or your administrator." />
      </DashboardShell>
    );
  }

  const supabase = context.supabase;
  const now = new Date().toISOString();

  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, providers(users(full_name))")
    .eq("patient_id", patientId)
    .gte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(5)
    .returns<UpcomingAppointment[]>();

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("id, dosage, frequency, medications(name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<PrescriptionRow[]>();

  const { data: reports } = await supabase
    .from("files")
    .select("id, bucket, documents(title, created_at)")
    .eq("bucket", "reports")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<ReportRow[]>();

  return (
    <DashboardShell title="Patient dashboard" description="Your care summary">
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          title="Upcoming appointments"
          value={String(upcomingAppointments?.length ?? 0)}
          change="Scheduled visits"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <MetricCard
          title="Prescriptions"
          value={String(prescriptions?.length ?? 0)}
          change="Active medications"
          icon={<Pill className="h-5 w-5" />}
        />
        <MetricCard
          title="Reports"
          value={String(reports?.length ?? 0)}
          change="Recent uploads"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming appointments</CardTitle>
            <CardDescription>Your next scheduled visits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            {(upcomingAppointments ?? []).length === 0 ? (
              <p className="text-white/50">No upcoming appointments.</p>
            ) : (
              upcomingAppointments?.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <span>{appointment.providers?.users?.full_name ?? "Provider"}</span>
                  <span>
                    {appointment.scheduled_at
                      ? new Date(appointment.scheduled_at).toLocaleString()
                      : ""}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
            <CardDescription>Your latest medications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            {(prescriptions ?? []).length === 0 ? (
              <p className="text-white/50">No prescriptions on file.</p>
            ) : (
              prescriptions?.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between">
                  <span>{prescription.medications?.name ?? "Medication"}</span>
                  <span className="text-white/40">
                    {prescription.dosage ?? ""} {prescription.frequency ?? ""}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Uploaded documents and reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/70">
          {(reports ?? []).length === 0 ? (
            <p className="text-white/50">No reports available.</p>
          ) : (
            reports?.map((report) => (
              <div key={report.id} className="flex items-center justify-between">
                <span>{report.documents?.title ?? "Report"}</span>
                <span className="text-white/40">
                  {report.documents?.created_at
                    ? new Date(report.documents.created_at).toLocaleDateString()
                    : ""}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
