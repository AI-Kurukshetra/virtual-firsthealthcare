import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { ActionForm } from "@/components/forms/ActionForm";
import { Pagination } from "@/components/common/Pagination";
import { getUserContext } from "@/lib/auth/user-context";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createPatientAction,
  deletePatientAction,
  updatePatientAction
} from "@/app/(dashboard)/patients/actions";

export const metadata = {
  title: "Patients | Virtual Health Platform"
};

type PatientRow = {
  id: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  users: { full_name: string | null; email: string | null } | null;
};

export default async function PatientsPage({
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

  let patients: PatientRow[] = [];
  let count = 0;
  let error: { message: string } | null = null;

  if (query) {
    const { data: matchedUsers } = await supabase
      .from("users")
      .select("id")
      .ilike("full_name", `%${query}%`)
      .returns<{ id: string }[]>();

    const userIds = matchedUsers?.map((user) => user.id) ?? [];

    if (userIds.length === 0) {
      patients = [];
      count = 0;
    } else {
      const response = await supabase
        .from("patients")
        .select("id, date_of_birth, gender, phone, address, users(full_name, email)", {
          count: "exact"
        })
        .in("user_id", userIds)
        .range(from, to)
        .order("created_at", { ascending: false })
        .returns<PatientRow[]>();

      patients = response.data ?? [];
      count = response.count ?? 0;
      error = response.error ? { message: response.error.message } : null;
    }
  } else {
    const response = await supabase
      .from("patients")
      .select("id, date_of_birth, gender, phone, address, users(full_name, email)", {
        count: "exact"
      })
      .range(from, to)
      .order("created_at", { ascending: false })
      .returns<PatientRow[]>();

    patients = response.data ?? [];
    count = response.count ?? 0;
    error = response.error ? { message: response.error.message } : null;
  }

  const canCreate = role === "admin";
  const canDelete = role === "admin";

  return (
    <DashboardShell title="Patients" description="Patient registry">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Active patients</CardTitle>
            <CardDescription>Clinical history, care plans, and alerts.</CardDescription>
          </div>
          <form method="get" className="flex w-full items-center gap-2 md:w-auto">
            <Input
              name="q"
              placeholder="Search patients"
              defaultValue={query}
              className="h-9 md:w-56"
            />
            <Button size="sm" type="submit">
              Search
            </Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6">
          {canCreate ? (
            <ActionForm
              action={createPatientAction}
              className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Add patient</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input name="fullName" placeholder="Full name" />
                <Input name="email" type="email" placeholder="Email" />
                <Input name="password" type="password" placeholder="Temporary password" />
                <Input name="dateOfBirth" type="date" placeholder="Date of birth" />
                <Input name="gender" placeholder="Gender" />
                <Input name="phone" placeholder="Phone" />
                <Input name="address" placeholder="Address" />
              </div>
              <Button size="sm" type="submit">Add patient</Button>
            </ActionForm>
          ) : null}

          {error ? <AuthFeedback message={error.message} /> : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(patients ?? []).map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium text-white">
                    {patient.users?.full_name ?? "Unassigned"}
                  </TableCell>
                  <TableCell>{patient.users?.email ?? "-"}</TableCell>
                  <TableCell>{patient.gender ?? "-"}</TableCell>
                  <TableCell>{patient.phone ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-3">
                      <ActionForm action={updatePatientAction}>
                        <input type="hidden" name="id" value={patient.id} />
                        <div className="grid gap-2 md:grid-cols-2">
                          <Input
                            name="fullName"
                            placeholder="Full name"
                            defaultValue={patient.users?.full_name ?? ""}
                          />
                          <Input
                            name="dateOfBirth"
                            type="date"
                            defaultValue={patient.date_of_birth ?? ""}
                          />
                          <Input
                            name="gender"
                            placeholder="Gender"
                            defaultValue={patient.gender ?? ""}
                          />
                          <Input
                            name="phone"
                            placeholder="Phone"
                            defaultValue={patient.phone ?? ""}
                          />
                          <Input
                            name="address"
                            placeholder="Address"
                            defaultValue={patient.address ?? ""}
                            className="md:col-span-2"
                          />
                        </div>
                        <Button size="sm" type="submit">Update</Button>
                      </ActionForm>

                      {canDelete ? (
                        <ActionForm action={deletePatientAction}>
                          <input type="hidden" name="id" value={patient.id} />
                          <Button size="sm" variant="outline" type="submit">
                            Delete
                          </Button>
                        </ActionForm>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            basePath="/patients"
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
