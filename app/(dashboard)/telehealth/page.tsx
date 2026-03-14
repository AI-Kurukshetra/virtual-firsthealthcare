import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { ActionForm } from "@/components/forms/ActionForm";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterSelect } from "@/components/common/FilterSelect";
import { TelehealthRoom } from "@/components/telehealth/TelehealthRoom";
import { getUserContext } from "@/lib/auth/user-context";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createTelehealthSessionAction,
  deleteTelehealthSessionAction,
  endTelehealthSessionAction,
  startTelehealthSessionAction
} from "@/app/(dashboard)/telehealth/actions";

export const metadata = {
  title: "Telehealth | Virtual Health Platform"
};

type SessionRow = {
  id: string;
  room_token: string | null;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  appointments:
    | {
        id: string;
        scheduled_at: string | null;
        patients: { users: { full_name: string | null } | null } | null;
        providers: { users: { full_name: string | null } | null } | null;
      }
    | null;
};

type AppointmentOption = { id: string; scheduled_at: string | null };

type UserMatch = { id: string };
type PatientMatch = { id: string };
type ProviderMatch = { id: string };

type AppointmentMatch = { id: string };

const statusOptions = [
  { label: "All", value: "" },
  { label: "Ready", value: "ready" },
  { label: "Live", value: "live" },
  { label: "Ended", value: "ended" }
];

export default async function TelehealthPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  const { page, pageSize, query, from, to } = getPaginationParams(searchParams, 6);
  const canManage = context.role === "admin" || context.role === "provider";
  const canDelete = context.role === "admin";
  const rawStatus = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;
  const statusFilter = (rawStatus ?? "").trim();

  let sessionQuery = context.supabase
    .from("appointment_rooms")
    .select(
      "id, room_token, status, started_at, ended_at, appointments(id, scheduled_at, patients(users(full_name)), providers(users(full_name)))",
      { count: "exact" }
    )
    .range(from, to)
    .order("created_at", { ascending: false });
  let noMatches = false;

  if (statusFilter) {
    sessionQuery = sessionQuery.eq("status", statusFilter);
  }

  if (query) {
    const { data: matchedUsers } = await context.supabase
      .from("users")
      .select("id")
      .ilike("full_name", `%${query}%`)
      .returns<UserMatch[]>();

    const userIds = matchedUsers?.map((user) => user.id) ?? [];

    if (userIds.length === 0) {
      noMatches = true;
    } else {
      const [{ data: matchedPatients }, { data: matchedProviders }] = await Promise.all([
        context.supabase
          .from("patients")
          .select("id")
          .in("user_id", userIds)
          .returns<PatientMatch[]>(),
        context.supabase
          .from("providers")
          .select("id")
          .in("user_id", userIds)
          .returns<ProviderMatch[]>()
      ]);

      const patientIds = matchedPatients?.map((patient) => patient.id) ?? [];
      const providerIds = matchedProviders?.map((provider) => provider.id) ?? [];

      if (patientIds.length === 0 && providerIds.length === 0) {
        noMatches = true;
      } else {
        const filterParts: string[] = [];
        if (patientIds.length > 0) {
          filterParts.push(`patient_id.in.(${patientIds.join(",")})`);
        }
        if (providerIds.length > 0) {
          filterParts.push(`provider_id.in.(${providerIds.join(",")})`);
        }
        const { data: matchedAppointments } = await context.supabase
          .from("appointments")
          .select("id")
          .or(filterParts.join(","))
          .returns<AppointmentMatch[]>();

        const appointmentIds = matchedAppointments?.map((appointment) => appointment.id) ?? [];
        if (appointmentIds.length === 0) {
          noMatches = true;
        } else {
          sessionQuery = sessionQuery.in("appointment_id", appointmentIds);
        }
      }
    }
  }

  const { data: sessions, error, count } = noMatches
    ? { data: [], error: null, count: 0 }
    : await sessionQuery.returns<SessionRow[]>();

  const { data: appointmentOptions } = await context.supabase
    .from("appointments")
    .select("id, scheduled_at")
    .order("scheduled_at", { ascending: false })
    .limit(20)
    .returns<AppointmentOption[]>();

  return (
    <DashboardShell title="Telehealth" description="Live consultations">
      <div className="grid gap-6">
        <Card className="space-y-6">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Telehealth sessions</CardTitle>
              <CardDescription>Launch video sessions from appointments.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect param="status" label="Status" options={statusOptions} basePath="/telehealth" />
              <SearchBar placeholder="Search sessions" basePath="/telehealth" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {canManage ? (
              <ActionForm action={createTelehealthSessionAction} className="grid gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Create session</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    name="appointmentId"
                    className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                  >
                    <option value="">Select appointment</option>
                    {(appointmentOptions ?? []).map((appointment) => (
                      <option key={appointment.id} value={appointment.id}>
                        {appointment.scheduled_at
                          ? new Date(appointment.scheduled_at).toLocaleString()
                          : appointment.id}
                      </option>
                    ))}
                  </select>
                </div>
                <Button size="sm" type="submit">Create session</Button>
              </ActionForm>
            ) : null}

            {error ? <AuthFeedback message={error.message} /> : null}

            <div className="space-y-4">
              {(sessions ?? []).map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border/60 bg-card/60 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {session.appointments?.patients?.users?.full_name ?? "Patient"} · {session.appointments?.providers?.users?.full_name ?? "Provider"}
                      </p>
                      <p className="text-xs text-foreground/50">
                        Room {session.room_token?.slice(0, 8) ?? "-"} · {session.status}
                      </p>
                    </div>
                    <span className="text-xs text-foreground/40">
                      {session.started_at ? new Date(session.started_at).toLocaleString() : "Not started"}
                    </span>
                  </div>
                  {canManage ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <ActionForm action={startTelehealthSessionAction}>
                        <input type="hidden" name="id" value={session.id} />
                        <Button size="sm" type="submit">Start</Button>
                      </ActionForm>
                      <ActionForm action={endTelehealthSessionAction}>
                        <input type="hidden" name="id" value={session.id} />
                        <Button size="sm" variant="outline" type="submit">End</Button>
                      </ActionForm>
                      {canDelete ? (
                        <ActionForm action={deleteTelehealthSessionAction}>
                          <input type="hidden" name="id" value={session.id} />
                          <Button size="sm" variant="outline" type="submit">Delete</Button>
                        </ActionForm>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <Pagination
              basePath="/telehealth"
              page={page}
              pageSize={pageSize}
              total={count ?? 0}
              searchParams={searchParams}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live room</CardTitle>
            <CardDescription>Use this space to join the active session.</CardDescription>
          </CardHeader>
          <CardContent>
            <TelehealthRoom />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
