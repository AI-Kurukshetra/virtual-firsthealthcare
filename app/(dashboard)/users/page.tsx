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
import { extractRoleName } from "@/lib/auth/roles";
import { getDashboardPath } from "@/lib/auth/profile";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction
} from "@/app/(dashboard)/users/actions";

export const metadata = {
  title: "Users | Virtual Health Platform"
};

type UserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  user_roles: { roles: { name: string | null } | null }[] | null;
};

const roleOptions = [
  { label: "All roles", value: "" },
  { label: "Admin", value: "admin" },
  { label: "Provider", value: "provider" },
  { label: "Patient", value: "patient" }
];

export default async function UsersPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  if (context.role !== "admin") {
    redirect(getDashboardPath(context.role));
  }

  const { page, pageSize, query, from, to } = getPaginationParams(searchParams, 8);
  const rawRole = Array.isArray(searchParams.role) ? searchParams.role[0] : searchParams.role;
  const roleFilter = (rawRole ?? "").trim();

  let usersQuery = context.supabase
    .from("users")
    .select("id, full_name, email, phone, created_at, user_roles(roles(name))", {
      count: "exact"
    })
    .range(from, to)
    .order("created_at", { ascending: false });

  if (query) {
    usersQuery = usersQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  if (roleFilter) {
    usersQuery = usersQuery.eq("user_roles.roles.name", roleFilter);
  }

  const { data: users, error, count } = await usersQuery.returns<UserRow[]>();

  return (
    <DashboardShell title="Users" description="Accounts & access">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Team directory</CardTitle>
            <CardDescription>Manage user access and roles.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect param="role" label="Role" options={roleOptions} basePath="/users" />
            <SearchBar placeholder="Search users" basePath="/users" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ActionForm action={createUserAction} className="grid gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Add user</p>
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="fullName" placeholder="Full name" />
              <Input name="email" type="email" placeholder="Email" />
              <Input name="password" type="password" placeholder="Temporary password" />
              <Input name="phone" placeholder="Phone" />
              <select
                name="role"
                className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
              >
                <option value="admin">Admin</option>
                <option value="provider">Provider</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            <Button size="sm" type="submit">Create user</Button>
          </ActionForm>

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="space-y-4">
            {(users ?? []).map((user) => {
              const roleName = extractRoleName(user.user_roles?.[0]?.roles) ?? "member";
              return (
                <div
                  key={user.id}
                  className="rounded-2xl border border-border/60 bg-card/60 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {user.full_name ?? "Unnamed"}
                      </p>
                      <p className="text-xs text-foreground/50">{user.email ?? ""}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                      {roleName}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <ActionForm action={updateUserAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <div className="grid gap-2 md:grid-cols-2">
                        <Input name="fullName" defaultValue={user.full_name ?? ""} />
                        <Input name="phone" defaultValue={user.phone ?? ""} />
                        <select
                          name="role"
                          defaultValue={roleName}
                          className="h-10 rounded-2xl border border-border/60 bg-card/60 px-4 text-sm text-foreground"
                        >
                          <option value="admin">Admin</option>
                          <option value="provider">Provider</option>
                          <option value="patient">Patient</option>
                        </select>
                      </div>
                      <Button size="sm" type="submit">Update</Button>
                    </ActionForm>

                    <ActionForm action={deleteUserAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <Button size="sm" variant="outline" type="submit">Delete</Button>
                    </ActionForm>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            basePath="/users"
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
