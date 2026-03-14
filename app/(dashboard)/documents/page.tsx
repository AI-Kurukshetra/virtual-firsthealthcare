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
  title: "Documents | Virtual Health Platform"
};

type PatientOption = { id: string; users: { full_name: string | null } | null };

type DocumentRow = {
  id: string;
  title: string | null;
  created_at: string | null;
  patients: { id: string; users: { full_name: string | null } | null } | null;
  files:
    | { id: string; s3_key: string | null; mime_type: string | null; bucket: string | null }[]
    | null;
};

const bucketOptions = [
  { label: "All", value: "" },
  { label: "Documents", value: "documents" },
  { label: "Reports", value: "reports" }
];

export default async function DocumentsPage({
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
  const rawBucket = Array.isArray(searchParams.bucket) ? searchParams.bucket[0] : searchParams.bucket;
  const bucketFilter = (rawBucket ?? "").trim();

  let documentsQuery = supabase
    .from("documents")
    .select("id, title, created_at, patients(id, users(full_name)), files(id, s3_key, mime_type, bucket)", {
      count: "exact"
    })
    .range(from, to)
    .order("created_at", { ascending: false });

  if (query) {
    documentsQuery = documentsQuery.ilike("title", `%${query}%`);
  }

  if (bucketFilter) {
    documentsQuery = documentsQuery.eq("files.bucket", bucketFilter);
  }

  const { data: documents, error, count } = await documentsQuery.returns<DocumentRow[]>();

  const { data: patientOptions } = await supabase
    .from("patients")
    .select("id, users(full_name)")
    .order("created_at", { ascending: false })
    .returns<PatientOption[]>();

  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (document) => {
      const file = document.files?.[0];
      if (!file?.s3_key) {
        return { ...document, downloadUrl: null };
      }

      try {
        const signedUrl = await createDocumentDownloadUrl(file.s3_key, file.bucket ?? "documents");
        return { ...document, downloadUrl: signedUrl };
      } catch (error) {
        return { ...document, downloadUrl: null };
      }
    })
  );

  const patientId = context.patientId ?? "";

  return (
    <DashboardShell title="Documents" description="Uploads and reports">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Patient documents</CardTitle>
            <CardDescription>Secure storage for reports and uploads.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect param="bucket" label="Bucket" options={bucketOptions} basePath="/documents" />
            <SearchBar placeholder="Search documents" basePath="/documents" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ActionForm
            action={createDocumentAction}
            encType="multipart/form-data"
            className="grid gap-3 rounded-2xl border border-border/60 bg-card/60 p-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Upload document</p>
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="title" placeholder="Title" />
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
                name="bucket"
                className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
              >
                <option value="documents">Documents</option>
                <option value="reports">Reports</option>
              </select>
              <input
                type="file"
                name="file"
                className="md:col-span-2 text-sm text-foreground/70"
              />
            </div>
            <Button size="sm" type="submit">Upload</Button>
          </ActionForm>

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="space-y-4">
            {documentsWithUrls.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-border/60 bg-card/60 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                    <p className="text-xs text-foreground/50">
                      {doc.patients?.users?.full_name ?? "Patient"}
                    </p>
                  </div>
                  {doc.downloadUrl ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-border/80 px-3 py-1 text-xs text-foreground/80 hover:bg-card/70"
                      >
                        Preview
                      </a>
                      <a
                        href={doc.downloadUrl}
                        download
                        className="rounded-full border border-border/80 px-3 py-1 text-xs text-foreground/80 hover:bg-card/70"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-foreground/40">No file</span>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  <ActionForm action={updateDocumentAction}>
                    <input type="hidden" name="id" value={doc.id} />
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input name="title" placeholder="Title" defaultValue={doc.title ?? ""} />
                      {role === "patient" ? (
                        <input type="hidden" name="patientId" value={patientId} />
                      ) : (
                        <select
                          name="patientId"
                          defaultValue={doc.patients?.id ?? ""}
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
                    </div>
                    <Button size="sm" type="submit">Update</Button>
                  </ActionForm>

                  <ActionForm action={deleteDocumentAction}>
                    <input type="hidden" name="id" value={doc.id} />
                    <Button size="sm" variant="outline" type="submit">Delete</Button>
                  </ActionForm>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            basePath="/documents"
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
