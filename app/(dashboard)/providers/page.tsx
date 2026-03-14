import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { ActionForm } from "@/components/forms/ActionForm";
import { Pagination } from "@/components/common/Pagination";
import { getUserContext } from "@/lib/auth/user-context";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createProviderAction,
  deleteProviderAction,
  updateProviderAction
} from "@/app/(dashboard)/providers/actions";

export const metadata = {
  title: "Providers | Virtual Health Platform"
};

type ProviderRow = {
  id: string;
  specialty: string | null;
  license_number: string | null;
  users: { full_name: string | null; email: string | null } | null;
};

export default async function ProvidersPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  const role = context.role;
  if (role === "patient") {
    redirect("/dashboard");
  }

  const supabase = context.supabase;
  const { page, pageSize, query, from, to } = getPaginationParams(searchParams, 6);

  let providers: ProviderRow[] = [];
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
      providers = [];
      count = 0;
    } else {
      const response = await supabase
        .from("providers")
        .select("id, specialty, license_number, users(full_name, email)", {
          count: "exact"
        })
        .in("user_id", userIds)
        .range(from, to)
        .order("created_at", { ascending: false })
        .returns<ProviderRow[]>();

      providers = response.data ?? [];
      count = response.count ?? 0;
      error = response.error ? { message: response.error.message } : null;
    }
  } else {
    const response = await supabase
      .from("providers")
      .select("id, specialty, license_number, users(full_name, email)", {
        count: "exact"
      })
      .range(from, to)
      .order("created_at", { ascending: false })
      .returns<ProviderRow[]>();

    providers = response.data ?? [];
    count = response.count ?? 0;
    error = response.error ? { message: response.error.message } : null;
  }

  const canCreate = role === "admin";
  const canDelete = role === "admin";

  return (
    <DashboardShell title="Providers" description="Clinical teams">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Provider roster</CardTitle>
            <CardDescription>Licensing, specialties, and workloads.</CardDescription>
          </div>
          <form method="get" className="flex w-full items-center gap-2 md:w-auto">
            <Input
              name="q"
              placeholder="Search providers"
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
              action={createProviderAction}
              className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Invite provider</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input name="fullName" placeholder="Full name" />
                <Input name="email" type="email" placeholder="Email" />
                <Input name="password" type="password" placeholder="Temporary password" />
                <Input name="specialty" placeholder="Specialty" />
                <Input name="licenseNumber" placeholder="License number" />
              </div>
              <Button size="sm" type="submit">Invite provider</Button>
            </ActionForm>
          ) : null}

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            {(providers ?? []).map((provider) => (
              <div
                key={provider.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-white">
                    {provider.users?.full_name ?? "Unnamed provider"}
                  </p>
                  <p className="text-sm text-white/60">{provider.users?.email ?? ""}</p>
                  <p className="text-xs text-white/50">
                    {provider.specialty || "General"}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <ActionForm action={updateProviderAction}>
                    <input type="hidden" name="id" value={provider.id} />
                    <div className="grid gap-2">
                      <Input
                        name="fullName"
                        placeholder="Full name"
                        defaultValue={provider.users?.full_name ?? ""}
                      />
                      <Input
                        name="specialty"
                        placeholder="Specialty"
                        defaultValue={provider.specialty ?? ""}
                      />
                      <Input
                        name="licenseNumber"
                        placeholder="License number"
                        defaultValue={provider.license_number ?? ""}
                      />
                    </div>
                    <Button size="sm" type="submit">Update</Button>
                  </ActionForm>

                  {canDelete ? (
                    <ActionForm action={deleteProviderAction}>
                      <input type="hidden" name="id" value={provider.id} />
                      <Button size="sm" variant="outline" type="submit">
                        Remove
                      </Button>
                    </ActionForm>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            basePath="/providers"
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
