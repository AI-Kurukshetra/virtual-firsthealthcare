import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { ActionForm } from "@/components/forms/ActionForm";
import { Pagination } from "@/components/common/Pagination";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserContext } from "@/lib/auth/user-context";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createAppointmentAction,
  deleteAppointmentAction,
  updateAppointmentAction
} from "@/app/(dashboard)/appointments/actions";

export const metadata = {
  title: "Appointments | Virtual Health Platform"
};

const statusOptions = [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
];

type PatientOption = { id: string; users: { full_name: string | null } | null };

type ProviderOption = { id: string; users: { full_name: string | null } | null };

type AppointmentRow = {
  id: string;
  scheduled_at: string | null;
  status: string | null;
  reason: string | null;
  patients: { id: string; users: { full_name: string | null } | null } | null;
  providers: { id: string; users: { full_name: string | null } | null } | null;
};

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  const role = context.role;
  const supabase = context.supabase;
  const { page, pageSize, query, from, to } = getPaginationParams(searchParams, 8);

  let appointmentsQuery = supabase
    .from("appointments")
    .select(
      "id, scheduled_at, status, reason, patients(id, users(full_name)), providers(id, users(full_name))",
      { count: "exact" }
    )
    .range(from, to)
    .order("scheduled_at", { ascending: true });

  if (query) {
    appointmentsQuery = appointmentsQuery.or(`reason.ilike.%${query}%,status.ilike.%${query}%`);
  }

  const { data: appointments, error, count } =
    await appointmentsQuery.returns<AppointmentRow[]>();

  let patientOptions: PatientOption[] = [];
  let providerOptions: ProviderOption[] = [];

  if (role !== "patient") {
    const { data: patients } = await supabase
      .from("patients")
      .select("id, users(full_name)")
      .order("created_at", { ascending: false })
      .returns<PatientOption[]>();
    patientOptions = patients ?? [];
  }

  if (role === "patient") {
    const adminClient = createSupabaseAdminClient();
    const { data: providers } = await adminClient
      .from("providers")
      .select("id, users(full_name)")
      .eq("organization_id", context.organizationId ?? "")
      .order("created_at", { ascending: false })
      .returns<ProviderOption[]>();
    providerOptions = providers ?? [];
  } else {
    const { data: providers } = await supabase
      .from("providers")
      .select("id, users(full_name)")
      .order("created_at", { ascending: false })
      .returns<ProviderOption[]>();
    providerOptions = providers ?? [];
  }

  const patientId = context.patientId ?? "";
  const providerId = context.providerId ?? "";

  return (
    <DashboardShell title="Appointments" description="Scheduling">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Upcoming appointments</CardTitle>
            <CardDescription>Provider availability and patient schedules.</CardDescription>
          </div>
          <form method="get" className="flex w-full items-center gap-2 md:w-auto">
            <Input
              name="q"
              placeholder="Search status or reason"
              defaultValue={query}
              className="h-9 md:w-56"
            />
            <Button size="sm" type="submit">Search</Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6">
          {role === "patient" && !patientId ? (
            <AuthFeedback message="Missing patient profile." />
          ) : null}
          {role === "provider" && !providerId ? (
            <AuthFeedback message="Missing provider profile." />
          ) : null}

          <ActionForm action={createAppointmentAction} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Book appointment</p>
            <div className="grid gap-3 md:grid-cols-2">
              {role === "patient" ? (
                <input type="hidden" name="patientId" value={patientId} />
              ) : (
                <select
                  name="patientId"
                  className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                >
                  <option value="">Select patient</option>
                  {(patientOptions ?? []).map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.users?.full_name ?? "Unnamed"}
                    </option>
                  ))}
                </select>
              )}

              {role === "provider" ? (
                <input type="hidden" name="providerId" value={providerId} />
              ) : (
                <select
                  name="providerId"
                  className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                >
                  <option value="">Select provider</option>
                  {(providerOptions ?? []).map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.users?.full_name ?? "Unnamed"}
                    </option>
                  ))}
                </select>
              )}

              <Input name="scheduledAt" type="datetime-local" />
              <select
                name="status"
                className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <Input name="reason" placeholder="Reason" className="md:col-span-2" />
            </div>
            <Button size="sm" type="submit">Create appointment</Button>
          </ActionForm>

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="space-y-4">
            {(appointments ?? []).map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {appointment.patients?.users?.full_name ?? "Patient"} · {" "}
                      {appointment.providers?.users?.full_name ?? "Provider"}
                    </p>
                    <p className="text-xs text-white/50">
                      {appointment.scheduled_at
                        ? new Date(appointment.scheduled_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                  <Badge variant={appointment.status === "confirmed" ? "success" : "warning"}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-3">
                  <ActionForm action={updateAppointmentAction}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <div className="grid gap-2 md:grid-cols-2">
                      {role === "patient" ? (
                        <input type="hidden" name="patientId" value={patientId} />
                      ) : (
                        <select
                          name="patientId"
                          defaultValue={appointment.patients?.id ?? ""}
                          className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                        >
                          <option value="">Select patient</option>
                          {(patientOptions ?? []).map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.users?.full_name ?? "Unnamed"}
                            </option>
                          ))}
                        </select>
                      )}

                      {role === "provider" ? (
                        <input type="hidden" name="providerId" value={providerId} />
                      ) : (
                        <select
                          name="providerId"
                          defaultValue={appointment.providers?.id ?? ""}
                          className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                        >
                          <option value="">Select provider</option>
                          {(providerOptions ?? []).map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.users?.full_name ?? "Unnamed"}
                            </option>
                          ))}
                        </select>
                      )}
                      <Input
                        name="scheduledAt"
                        type="datetime-local"
                        defaultValue={appointment.scheduled_at?.slice(0, 16) ?? ""}
                      />
                      <select
                        name="status"
                        defaultValue={appointment.status ?? ""}
                        className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <Input
                        name="reason"
                        placeholder="Reason"
                        defaultValue={appointment.reason ?? ""}
                        className="md:col-span-2"
                      />
                    </div>
                    <Button size="sm" type="submit">Update</Button>
                  </ActionForm>

                  <ActionForm action={deleteAppointmentAction}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <Button size="sm" variant="outline" type="submit">Cancel</Button>
                  </ActionForm>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            basePath="/appointments"
            page={page}
            pageSize={pageSize}
            total={count ?? 0}
            searchParams={searchParams}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
