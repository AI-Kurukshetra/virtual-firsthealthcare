import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { ActionForm } from "@/components/forms/ActionForm";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterSelect } from "@/components/common/FilterSelect";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { getUserContext } from "@/lib/auth/user-context";
import { getDashboardPath } from "@/lib/auth/profile";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createInvoiceAction,
  deleteInvoiceAction,
  updateInvoiceAction
} from "@/app/(dashboard)/billing/actions";

export const metadata = {
  title: "Billing | Virtual Health Platform"
};

type InvoiceRow = {
  id: string;
  status: string | null;
  total: number | null;
  currency: string | null;
  payment_method: string | null;
  due_date: string | null;
  created_at: string | null;
  patients: { id: string; users: { full_name: string | null } | null } | null;
  providers: { id: string; users: { full_name: string | null } | null } | null;
  appointments: { id: string; scheduled_at: string | null } | null;
};

type PatientOption = { id: string; users: { full_name: string | null } | null };

type ProviderOption = { id: string; users: { full_name: string | null } | null };

type AppointmentOption = { id: string; scheduled_at: string | null };

const statusOptions = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Issued", value: "issued" },
  { label: "Paid", value: "paid" },
  { label: "Void", value: "void" }
];

export default async function BillingPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  if (context.role === "patient") {
    redirect(getDashboardPath(context.role));
  }

  const { page, pageSize, query, from, to } = getPaginationParams(searchParams, 8);
  const rawStatus = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;
  const statusFilter = (rawStatus ?? "").trim();
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const revenueBuckets = new Map<string, number>();
  for (let i = 0; i < 6; i += 1) {
    const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    revenueBuckets.set(key, 0);
  }

  if (context.role === "admin") {
    const { data: paymentRows } = await context.supabase
      .from("payments")
      .select("paid_at, amount")
      .gte("paid_at", startMonth.toISOString());

    (paymentRows ?? []).forEach((row) => {
      if (!row.paid_at) return;
      const date = new Date(row.paid_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      revenueBuckets.set(key, (revenueBuckets.get(key) ?? 0) + Number(row.amount ?? 0));
    });
  }

  const revenueData = Array.from(revenueBuckets.entries()).map(([key, value]) => {
    const date = new Date(`${key}-01`);
    return { name: date.toLocaleString("en-US", { month: "short" }), revenue: Math.round(value) };
  });

  let invoiceQuery = context.supabase
    .from("invoices")
    .select(
      "id, status, total, currency, payment_method, due_date, created_at, patients(id, users(full_name)), providers(id, users(full_name)), appointments(id, scheduled_at)",
      { count: "exact" }
    )
    .range(from, to)
    .order("created_at", { ascending: false });

  if (query) {
    invoiceQuery = invoiceQuery.or(
      `status.ilike.%${query}%,payment_method.ilike.%${query}%,currency.ilike.%${query}%`
    );
  }

  if (statusFilter) {
    invoiceQuery = invoiceQuery.eq("status", statusFilter);
  }

  const { data: invoices, error, count } = await invoiceQuery.returns<InvoiceRow[]>();

  const { data: patientOptions } = await context.supabase
    .from("patients")
    .select("id, users(full_name)")
    .order("created_at", { ascending: false })
    .returns<PatientOption[]>();

  const { data: providerOptions } = await context.supabase
    .from("providers")
    .select("id, users(full_name)")
    .order("created_at", { ascending: false })
    .returns<ProviderOption[]>();

  const { data: appointmentOptions } = await context.supabase
    .from("appointments")
    .select("id, scheduled_at")
    .order("scheduled_at", { ascending: false })
    .limit(20)
    .returns<AppointmentOption[]>();

  const providerId = context.providerId ?? "";

  return (
    <DashboardShell title="Billing" description="Revenue and claims">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
            <CardDescription>Monthly collections and billing volume.</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card className="space-y-6">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Track payments and outstanding balances.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect param="status" label="Status" options={statusOptions} basePath="/billing" />
              <SearchBar placeholder="Search invoices" basePath="/billing" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ActionForm action={createInvoiceAction} className="grid gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Create invoice</p>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  name="patientId"
                  className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                >
                  <option value="">Select patient</option>
                  {(patientOptions ?? []).map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.users?.full_name ?? "Unnamed"}
                    </option>
                  ))}
                </select>
                {context.role === "provider" ? (
                  <input type="hidden" name="providerId" value={providerId} />
                ) : (
                  <select
                    name="providerId"
                    className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                  >
                    <option value="">Select provider</option>
                    {(providerOptions ?? []).map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.users?.full_name ?? "Unnamed"}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  name="appointmentId"
                  className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                >
                  <option value="">Link appointment (optional)</option>
                  {(appointmentOptions ?? []).map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.scheduled_at
                        ? new Date(appointment.scheduled_at).toLocaleDateString()
                        : appointment.id}
                    </option>
                  ))}
                </select>
                <Input name="total" type="number" min="0" step="0.01" placeholder="Total" />
                <Input name="currency" placeholder="Currency" defaultValue="USD" />
                <Input name="paymentMethod" placeholder="Payment method" />
                <Input name="dueDate" type="date" placeholder="Due date" />
                <select
                  name="status"
                  className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                >
                  {statusOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>
              <Button size="sm" type="submit">Create invoice</Button>
            </ActionForm>

            {error ? <AuthFeedback message={error.message} /> : null}

            <div className="space-y-4">
              {(invoices ?? []).map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-2xl border border-border/60 bg-card/60 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {invoice.patients?.users?.full_name ?? "Patient"} · {invoice.providers?.users?.full_name ?? "Provider"}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {invoice.currency ?? "USD"} {invoice.total ?? 0} · {invoice.status}
                      </p>
                    </div>
                    <span className="text-xs text-foreground/40">
                      Due {invoice.due_date ?? "-"}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <ActionForm action={updateInvoiceAction}>
                      <input type="hidden" name="id" value={invoice.id} />
                      <div className="grid gap-2 md:grid-cols-2">
                        <select
                          name="patientId"
                          defaultValue={invoice.patients?.id ?? ""}
                          className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                        >
                          <option value="">Select patient</option>
                          {(patientOptions ?? []).map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.users?.full_name ?? "Unnamed"}
                            </option>
                          ))}
                        </select>
                        {context.role === "provider" ? (
                          <input type="hidden" name="providerId" value={providerId} />
                        ) : (
                          <select
                            name="providerId"
                            defaultValue={invoice.providers?.id ?? ""}
                            className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                          >
                            <option value="">Select provider</option>
                            {(providerOptions ?? []).map((provider) => (
                              <option key={provider.id} value={provider.id}>
                                {provider.users?.full_name ?? "Unnamed"}
                              </option>
                            ))}
                          </select>
                        )}
                        <select
                          name="appointmentId"
                          defaultValue={invoice.appointments?.id ?? ""}
                          className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                        >
                          <option value="">Link appointment (optional)</option>
                          {(appointmentOptions ?? []).map((appointment) => (
                            <option key={appointment.id} value={appointment.id}>
                              {appointment.scheduled_at
                                ? new Date(appointment.scheduled_at).toLocaleDateString()
                                : appointment.id}
                            </option>
                          ))}
                        </select>
                        <Input name="total" type="number" min="0" step="0.01" defaultValue={invoice.total ?? 0} />
                        <Input name="currency" defaultValue={invoice.currency ?? "USD"} />
                        <Input name="paymentMethod" defaultValue={invoice.payment_method ?? ""} />
                        <Input name="dueDate" type="date" defaultValue={invoice.due_date ?? ""} />
                        <select
                          name="status"
                          defaultValue={invoice.status ?? "draft"}
                          className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                        >
                          {statusOptions
                            .filter((option) => option.value)
                            .map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                        </select>
                      </div>
                      <Button size="sm" type="submit">Update</Button>
                    </ActionForm>
                    <ActionForm action={deleteInvoiceAction}>
                      <input type="hidden" name="id" value={invoice.id} />
                      <Button size="sm" variant="outline" type="submit">Delete</Button>
                    </ActionForm>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              basePath="/billing"
              page={page}
              pageSize={pageSize}
              total={count ?? 0}
              searchParams={searchParams}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
