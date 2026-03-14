import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFeedback } from "@/components/forms/AuthFeedback";
import { ActionForm } from "@/components/forms/ActionForm";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import { getUserContext } from "@/lib/auth/user-context";
import { getPaginationParams } from "@/lib/utils/pagination";
import {
  createNotificationAction,
  deleteNotificationAction,
  updateNotificationAction
} from "@/app/(dashboard)/notifications/actions";

export const metadata = {
  title: "Notifications | Virtual Health Platform"
};

export default async function NotificationsPage({
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
  const { page, pageSize, query, from, to } = getPaginationParams(searchParams, 10);

  let notificationsQuery = supabase
    .from("notifications")
    .select("id, title, body, read_at, created_at, users(full_name)", { count: "exact" })
    .range(from, to)
    .order("created_at", { ascending: false });

  if (query) {
    notificationsQuery = notificationsQuery.or(`title.ilike.%${query}%,body.ilike.%${query}%`);
  }

  const { data: notifications, error, count } = await notificationsQuery;

  const { data: userOptions } = await supabase
    .from("users")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  const userId = context.userId;

  return (
    <DashboardShell title="Notifications" description="Alerts and reminders">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Delivery status and follow-up.</CardDescription>
          </div>
          <SearchBar placeholder="Search notifications" basePath="/notifications" />
        </CardHeader>
        <CardContent className="space-y-6">
          <ActionForm action={createNotificationAction} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Send notification</p>
            <div className="grid gap-3 md:grid-cols-2">
              {role === "admin" ? (
                <select
                  name="userId"
                  className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                >
                  <option value="">Select recipient</option>
                  {(userOptions ?? []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name ?? "Unnamed"}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="hidden" name="userId" value={userId} />
              )}
              <Input name="title" placeholder="Title" />
              <Input name="body" placeholder="Message" className="md:col-span-2" />
            </div>
            <Button size="sm" type="submit">Send</Button>
          </ActionForm>

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="space-y-4">
            {(notifications ?? []).map((notification) => (
              <div
                key={notification.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{notification.title}</p>
                    <p className="text-xs text-white/50">{notification.body}</p>
                  </div>
                  <span className="text-xs text-white/40">
                    {notification.read_at ? "Read" : "Unread"}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <ActionForm action={updateNotificationAction}>
                    <input type="hidden" name="id" value={notification.id} />
                    {role === "admin" ? (
                      <>
                        <Input name="title" defaultValue={notification.title} />
                        <Input name="body" defaultValue={notification.body} />
                      </>
                    ) : null}
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input type="checkbox" name="read" defaultChecked={Boolean(notification.read_at)} />
                      Mark as read
                    </label>
                    <Button size="sm" type="submit">Update</Button>
                  </ActionForm>
                  <ActionForm action={deleteNotificationAction}>
                    <input type="hidden" name="id" value={notification.id} />
                    <Button size="sm" variant="outline" type="submit">Delete</Button>
                  </ActionForm>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            basePath="/notifications"
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
