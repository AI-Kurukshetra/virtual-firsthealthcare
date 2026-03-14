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
import { getUserContext } from "@/lib/auth/user-context";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createDocumentAction,
  deleteDocumentAction,
  updateDocumentAction,
  createDocumentDownloadUrl
} from "@/app/(dashboard)/documents/actions";

export const metadata = {
  title: "Reports | Virtual Health Platform"
};

type PatientOption = { id: string; users: { full_name: string | null } | null };

type ReportRow = {
  id: string;
  title: string | null;
  document_type: string | null;
  created_at: string | null;
  patients: { id: string; users: { full_name: string | null } | null } | null;
  files:
    | { id: string; s3_key: string | null; mime_type: string | null; bucket: string | null }[]
    | null;
};

const typeOptions = [
  { label: "All types", value: "" },
  { label: "Lab Report", value: "Lab Report" },
  { label: "Radiology", value: "Radiology" },
  { label: "Discharge Summary", value: "Discharge Summary" },
  { label: "Referral", value: "Referral" },
  { label: "Insurance", value: "Insurance" }
];

export default async function ReportsPage({
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
  const { page, pageSize, query, from, to } = getPaginationParams(searchParams, 6);
  const rawType = Array.isArray(searchParams.type) ? searchParams.type[0] : searchParams.type;
  const typeFilter = (rawType ?? "").trim();

  let reportsQuery = supabase
    .from("documents")
    .select(
      "id, title, document_type, created_at, patients(id, users(full_name)), files(id, s3_key, mime_type, bucket)",
      { count: "exact" }
    )
    .eq("files.bucket", "reports")
    .range(from, to)
    .order("created_at", { ascending: false });

  if (query) {
    reportsQuery = reportsQuery.ilike("title", `%${query}%`);
  }

  if (typeFilter) {
    reportsQuery = reportsQuery.eq("document_type", typeFilter);
  }

  const { data: reports, error, count } = await reportsQuery.returns<ReportRow[]>();

  const { data: patientOptions } = await supabase
    .from("patients")
    .select("id, users(full_name)")
    .order("created_at", { ascending: false })
    .returns<PatientOption[]>();

  const reportsWithUrls = await Promise.all(
    (reports ?? []).map(async (report) => {
      const file = report.files?.[0];
      if (!file?.s3_key) {
        return { ...report, downloadUrl: null };
      }

      try {
        const signedUrl = await createDocumentDownloadUrl(file.s3_key, file.bucket ?? "reports");
        return { ...report, downloadUrl: signedUrl };
      } catch {
        return { ...report, downloadUrl: null };
      }
    })
  );

  const patientId = context.patientId ?? "";

  return (
    <DashboardShell title="Reports" description="Clinical reports">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Reports library</CardTitle>
            <CardDescription>Lab results, referrals, and summaries.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect param="type" label="Type" options={typeOptions} basePath="/reports" />
            <SearchBar placeholder="Search reports" basePath="/reports" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ActionForm
            action={createDocumentAction}
            encType="multipart/form-data"
            className="grid gap-3 rounded-2xl border border-border/60 bg-card/60 p-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Upload report</p>
            <input type="hidden" name="bucket" value="reports" />
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="title" placeholder="Report title" />
              {role === "patient" ? (
                <input type="hidden" name="patientId" value={patientId} />
              ) : (
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
              )}
              <select
                name="documentType"
                className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
              >
                {typeOptions
                  .filter((option) => option.value)
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
              <input type="file" name="file" className="md:col-span-2 text-sm text-foreground/70" />
            </div>
            <Button size="sm" type="submit">Upload</Button>
          </ActionForm>

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="space-y-4">
            {reportsWithUrls.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-border/60 bg-card/60 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{report.title}</p>
                    <p className="text-xs text-foreground/50">
                      {report.document_type ?? "Report"} · {report.patients?.users?.full_name ?? "Patient"}
                    </p>
                  </div>
                  {report.downloadUrl ? (
                    <a
                      href={report.downloadUrl}
                      className="rounded-full border border-border/80 px-3 py-1 text-xs text-foreground/80 hover:bg-card/70"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Preview
                    </a>
                  ) : (
                    <span className="text-xs text-foreground/40">No file</span>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  <ActionForm action={updateDocumentAction}>
                    <input type="hidden" name="id" value={report.id} />
                    <input type="hidden" name="bucket" value="reports" />
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input name="title" placeholder="Title" defaultValue={report.title ?? ""} />
                      {role === "patient" ? (
                        <input type="hidden" name="patientId" value={patientId} />
                      ) : (
                        <select
                          name="patientId"
                          defaultValue={report.patients?.id ?? ""}
                          className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                        >
                          <option value="">Select patient</option>
                          {(patientOptions ?? []).map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.users?.full_name ?? "Unnamed"}
                            </option>
                          ))}
                        </select>
                      )}
                      <select
                        name="documentType"
                        defaultValue={report.document_type ?? ""}
                        className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                      >
                        {typeOptions
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

                  <ActionForm action={deleteDocumentAction}>
                    <input type="hidden" name="id" value={report.id} />
                    <Button size="sm" variant="outline" type="submit">Delete</Button>
                  </ActionForm>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            basePath="/reports"
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
