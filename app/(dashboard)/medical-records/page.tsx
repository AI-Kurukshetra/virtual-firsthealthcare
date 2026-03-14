import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { ActionForm } from "@/components/forms/ActionForm";
import { Pagination } from "@/components/common/Pagination";
import { getUserContext } from "@/lib/auth/user-context";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createMedicalRecordAction,
  deleteMedicalRecordAction,
  updateMedicalRecordAction
} from "@/app/(dashboard)/medical-records/actions";

export const metadata = {
  title: "Medical Records | Virtual Health Platform"
};

type MedicalRecordRow = {
  id: string;
  created_at: string | null;
  patients: { id: string; users: { full_name: string | null } | null } | null;
};

type PatientOption = { id: string; users: { full_name: string | null } | null };

export default async function MedicalRecordsPage({
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

  let records: MedicalRecordRow[] = [];
  let count = 0;
  let error: { message: string } | null = null;

  if (query) {
    const { data: matchedPatients } = await supabase
      .from("patients")
      .select("id, users!inner(full_name)")
      .ilike("users.full_name", `%${query}%`)
      .returns<PatientOption[]>();

    const patientIds = matchedPatients?.map((patient) => patient.id) ?? [];

    if (patientIds.length === 0) {
      records = [];
      count = 0;
    } else {
      const response = await supabase
        .from("medical_records")
        .select("id, created_at, patients(id, users(full_name))", { count: "exact" })
        .in("patient_id", patientIds)
        .range(from, to)
        .order("created_at", { ascending: false })
        .returns<MedicalRecordRow[]>();

      records = response.data ?? [];
      count = response.count ?? 0;
      error = response.error ? { message: response.error.message } : null;
    }
  } else {
    const response = await supabase
      .from("medical_records")
      .select("id, created_at, patients(id, users(full_name))", { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false })
      .returns<MedicalRecordRow[]>();

    records = response.data ?? [];
    count = response.count ?? 0;
    error = response.error ? { message: response.error.message } : null;
  }

  const { data: patientOptions } = await supabase
    .from("patients")
    .select("id, users(full_name)")
    .order("created_at", { ascending: false })
    .returns<PatientOption[]>();

  const canManage = role === "admin" || role === "provider";

  return (
    <DashboardShell title="Medical records" description="EHR overview">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Recent clinical updates</CardTitle>
            <CardDescription>SOAP notes, diagnoses, and care plans.</CardDescription>
          </div>
          <form method="get" className="flex w-full items-center gap-2 md:w-auto">
            <Input
              name="q"
              placeholder="Search patients"
              defaultValue={query}
              className="h-9 md:w-56"
            />
            <Button size="sm" type="submit">Search</Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6">
          {canManage ? (
            <ActionForm action={createMedicalRecordAction} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Create record</p>
              <div className="grid gap-3 md:grid-cols-2">
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
              </div>
              <Button size="sm" type="submit">Create record</Button>
            </ActionForm>
          ) : null}

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="space-y-4">
            {(records ?? []).map((record) => (
              <div
                key={record.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-white">
                  {record.patients?.users?.full_name ?? "Patient"}
                </p>
                <p className="text-xs text-white/50">Record ID: {record.id}</p>
                <p className="mt-2 text-xs text-white/40">
                  Updated {record.created_at ? new Date(record.created_at).toLocaleDateString() : ""}
                </p>
                {canManage ? (
                  <div className="mt-4 space-y-3">
                    <ActionForm action={updateMedicalRecordAction}>
                      <input type="hidden" name="id" value={record.id} />
                      <select
                        name="patientId"
                        defaultValue={record.patients?.id ?? ""}
                        className="h-10 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                      >
                        <option value="">Select patient</option>
                        {(patientOptions ?? []).map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.users?.full_name ?? "Unnamed"}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" type="submit">Update</Button>
                    </ActionForm>

                    <ActionForm action={deleteMedicalRecordAction}>
                      <input type="hidden" name="id" value={record.id} />
                      <Button size="sm" variant="outline" type="submit">Delete</Button>
                    </ActionForm>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <Pagination
            basePath="/medical-records"
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
