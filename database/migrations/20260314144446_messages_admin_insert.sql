-- Allow admins to send messages without membership

drop policy if exists "messages_insert" on messages;

create policy "messages_insert" on messages
  for insert with check (
    organization_id = public.current_org_id()
    and sender_id = auth.uid()
    and (
      public.has_role('admin') or public.is_conversation_member(conversation_id)
    )
  );
