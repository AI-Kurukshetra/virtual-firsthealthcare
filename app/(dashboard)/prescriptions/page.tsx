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
  createPrescriptionAction,
  deletePrescriptionAction,
  updatePrescriptionAction
} from "@/app/(dashboard)/prescriptions/actions";

export const metadata = {
  title: "Prescriptions | Virtual Health Platform"
};

type PrescriptionRow = {
  id: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  patients: { id: string; users: { full_name: string | null } | null } | null;
  providers: { id: string; users: { full_name: string | null } | null } | null;
  medications: { name: string | null } | null;
};

type PatientOption = { id: string; users: { full_name: string | null } | null };

type ProviderOption = { id: string; users: { full_name: string | null } | null };

export default async function PrescriptionsPage({
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

  let prescriptions: PrescriptionRow[] = [];
  let count = 0;
  let error: { message: string } | null = null;

  if (query) {
    const { data: medications } = await supabase
      .from("medications")
      .select("id")
      .ilike("name", `%${query}%`)
      .returns<{ id: string }[]>();

    const medicationIds = medications?.map((item) => item.id) ?? [];

    if (medicationIds.length === 0) {
      prescriptions = [];
      count = 0;
    } else {
      const response = await supabase
        .from("prescriptions")
        .select(
          "id, dosage, frequency, start_date, end_date, patients(id, users(full_name)), providers(id, users(full_name)), medications(name)",
          { count: "exact" }
        )
        .in("medication_id", medicationIds)
        .range(from, to)
        .order("created_at", { ascending: false })
        .returns<PrescriptionRow[]>();

      prescriptions = response.data ?? [];
      count = response.count ?? 0;
      error = response.error ? { message: response.error.message } : null;
    }
  } else {
    const response = await supabase
      .from("prescriptions")
      .select(
        "id, dosage, frequency, start_date, end_date, patients(id, users(full_name)), providers(id, users(full_name)), medications(name)",
        { count: "exact" }
      )
      .range(from, to)
      .order("created_at", { ascending: false })
      .returns<PrescriptionRow[]>();

    prescriptions = response.data ?? [];
    count = response.count ?? 0;
    error = response.error ? { message: response.error.message } : null;
  }

  const { data: patientOptions } = await supabase
    .from("patients")
    .select("id, users(full_name)")
    .order("created_at", { ascending: false })
    .returns<PatientOption[]>();

  const { data: providerOptions } = await supabase
    .from("providers")
    .select("id, users(full_name)")
    .order("created_at", { ascending: false })
    .returns<ProviderOption[]>();

  const canManage = role === "admin" || role === "provider";
  const providerId = context.providerId ?? "";

  return (
    <DashboardShell title="Prescriptions" description="Medication management">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Active prescriptions</CardTitle>
            <CardDescription>Provider-issued medications and refills.</CardDescription>
          </div>
          <form method="get" className="flex w-full items-center gap-2 md:w-auto">
            <Input
              name="q"
              placeholder="Search medication"
              defaultValue={query}
              className="h-9 md:w-56"
            />
            <Button size="sm" type="submit">Search</Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6">
          {canManage ? (
            <ActionForm action={createPrescriptionAction} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Create prescription</p>
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
                <Input name="medicationName" placeholder="Medication" />
                <Input name="dosage" placeholder="Dosage" />
                <Input name="frequency" placeholder="Frequency" />
                <Input name="startDate" type="date" placeholder="Start date" />
                <Input name="endDate" type="date" placeholder="End date" />
              </div>
              <Button size="sm" type="submit">Create prescription</Button>
            </ActionForm>
          ) : null}

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="space-y-4">
            {(prescriptions ?? []).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.patients?.users?.full_name ?? "Patient"}
                    </p>
                    <p className="text-xs text-white/50">{item.medications?.name ?? "Medication"}</p>
                  </div>
                  <p className="text-xs text-white/60">
                    {item.dosage ?? ""} {item.frequency ?? ""}
                  </p>
                </div>
                {canManage ? (
                  <div className="mt-4 space-y-3">
                    <ActionForm action={updatePrescriptionAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <div className="grid gap-2 md:grid-cols-2">
                        <select
                          name="patientId"
                          defaultValue={item.patients?.id ?? ""}
                          className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                        >
                          <option value="">Select patient</option>
                          {(patientOptions ?? []).map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.users?.full_name ?? "Unnamed"}
                            </option>
                          ))}
                        </select>
                        {role === "provider" ? (
                          <input type="hidden" name="providerId" value={providerId} />
                        ) : (
                          <select
                            name="providerId"
                            defaultValue={item.providers?.id ?? ""}
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
                          name="medicationName"
                          placeholder="Medication"
                          defaultValue={item.medications?.name ?? ""}
                        />
                        <Input name="dosage" placeholder="Dosage" defaultValue={item.dosage ?? ""} />
                        <Input
                          name="frequency"
                          placeholder="Frequency"
                          defaultValue={item.frequency ?? ""}
                        />
                        <Input
                          name="startDate"
                          type="date"
                          defaultValue={item.start_date ?? ""}
                        />
                        <Input
                          name="endDate"
                          type="date"
                          defaultValue={item.end_date ?? ""}
                        />
                      </div>
                      <Button size="sm" type="submit">Update</Button>
                    </ActionForm>

                    <ActionForm action={deletePrescriptionAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button size="sm" variant="outline" type="submit">Remove</Button>
                    </ActionForm>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <Pagination
            basePath="/prescriptions"
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
