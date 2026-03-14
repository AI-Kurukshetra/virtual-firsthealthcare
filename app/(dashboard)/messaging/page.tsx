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
  createConversationAction,
  deleteMessageAction,
  sendMessageAction,
  updateMessageAction
} from "@/app/(dashboard)/messaging/actions";

export const metadata = {
  title: "Messaging | Virtual Health Platform"
};

type ConversationRow = {
  id: string;
  created_at: string | null;
  conversation_members:
    | { user_id: string | null; users: { full_name: string | null } | null }[]
    | null;
};

type MessageRow = {
  id: string;
  body: string | null;
  status: string | null;
  created_at: string | null;
  conversation_id: string | null;
  sender_id: string | null;
  conversations:
    | { conversation_members: { users: { full_name: string | null } | null }[] | null }
    | null;
};

type UserOption = { id: string; full_name: string | null };

export default async function MessagingPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const context = await getUserContext();
  if ("error" in context) {
    redirect("/login");
  }

  const supabase = context.supabase;
  const userId = context.userId;
  const { page, pageSize, query, from, to } = getPaginationParams(searchParams, 10);

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, created_at, conversation_members(user_id, users(full_name))")
    .order("created_at", { ascending: false })
    .returns<ConversationRow[]>();

  let messagesQuery = supabase
    .from("messages")
    .select(
      "id, body, status, created_at, conversation_id, sender_id, conversations(conversation_members(users(full_name)))",
      { count: "exact" }
    )
    .range(from, to)
    .order("created_at", { ascending: false });

  if (query) {
    messagesQuery = messagesQuery.ilike("body", `%${query}%`);
  }

  const { data: messages, error, count } = await messagesQuery.returns<MessageRow[]>();

  const { data: userOptions } = await supabase
    .from("users")
    .select("id, full_name")
    .order("full_name", { ascending: true })
    .returns<UserOption[]>();

  const participants = (userOptions ?? []).filter((user) => user.id !== userId);

  return (
    <DashboardShell title="Messaging" description="Realtime inbox">
      <Card className="space-y-6">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Secure provider-patient messaging.</CardDescription>
          </div>
          <SearchBar placeholder="Search messages" basePath="/messaging" />
        </CardHeader>
        <CardContent className="space-y-6">
          <ActionForm action={createConversationAction} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Start conversation</p>
            <div className="grid gap-3 md:grid-cols-2">
              <select
                name="participantId"
                className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              >
                <option value="">Select participant</option>
                {participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.full_name ?? "Unnamed"}
                  </option>
                ))}
              </select>
            </div>
            <Button size="sm" type="submit">Start</Button>
          </ActionForm>

          <ActionForm action={sendMessageAction} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Send message</p>
            <div className="grid gap-3 md:grid-cols-2">
              <select
                name="conversationId"
                className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              >
                <option value="">Select conversation</option>
                {(conversations ?? []).map((conversation) => {
                  const members = conversation.conversation_members ?? [];
                  const label = members
                    .map((member) => member.users?.full_name)
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <option key={conversation.id} value={conversation.id}>
                      {label || conversation.id}
                    </option>
                  );
                })}
              </select>
              <Input name="body" placeholder="Message" />
            </div>
            <Button size="sm" type="submit">Send</Button>
          </ActionForm>

          {error ? <AuthFeedback message={error.message} /> : null}

          <div className="space-y-4">
            {(messages ?? []).map((message) => (
              <div
                key={message.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <p className="text-xs text-white/40">
                  {message.created_at ? new Date(message.created_at).toLocaleString() : ""}
                </p>
                <p className="text-sm text-white">{message.body ?? ""}</p>
                <div className="mt-4 space-y-3">
                  <ActionForm action={updateMessageAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <Input name="body" defaultValue={message.body ?? ""} />
                    <Button size="sm" type="submit">Update</Button>
                  </ActionForm>
                  <ActionForm action={deleteMessageAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <Button size="sm" variant="outline" type="submit">Delete</Button>
                  </ActionForm>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            basePath="/messaging"
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
