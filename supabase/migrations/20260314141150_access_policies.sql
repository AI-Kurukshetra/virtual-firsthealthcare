-- Role-based access refinements and messaging membership

create or replace function public.current_provider_id() returns uuid
language sql stable as $$
  select id from public.providers where user_id = auth.uid();
$$;

create or replace function public.is_provider_for_patient(patient_uuid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1
    from public.appointments a
    where a.patient_id = patient_uuid
      and a.provider_id = public.current_provider_id()
  );
$$;

create table if not exists conversation_members (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table conversation_members enable row level security;

create or replace function public.is_conversation_member(conversation_uuid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = conversation_uuid
      and cm.user_id = auth.uid()
  );
$$;

-- Drop legacy policies we are replacing

drop policy if exists "patients_access" on patients;
drop policy if exists "patients_write" on patients;
drop policy if exists "providers_access" on providers;
drop policy if exists "appointments_access" on appointments;
drop policy if exists "records_access" on medical_records;
drop policy if exists "prescriptions_access" on prescriptions;
drop policy if exists "documents_access" on documents;
drop policy if exists "files_access" on files;
drop policy if exists "messages_access" on messages;
drop policy if exists "notifications_access" on notifications;

drop policy if exists "conversation_members_select" on conversation_members;
drop policy if exists "conversation_members_insert" on conversation_members;
drop policy if exists "conversation_members_update" on conversation_members;
drop policy if exists "conversation_members_delete" on conversation_members;

drop policy if exists "conversations_select" on conversations;
drop policy if exists "conversations_insert" on conversations;
drop policy if exists "conversations_update" on conversations;
drop policy if exists "conversations_delete" on conversations;

drop policy if exists "medications_select" on medications;
drop policy if exists "medications_insert" on medications;
drop policy if exists "medications_update" on medications;
drop policy if exists "medications_delete" on medications;

-- Patients
create policy "patients_select" on patients
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(id))
      or (public.has_role('patient') and user_id = auth.uid())
    )
  );

create policy "patients_insert" on patients
  for insert with check (
    organization_id = public.current_org_id() and public.has_role('admin')
  );

create policy "patients_update" on patients
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(id))
      or (public.has_role('patient') and user_id = auth.uid())
    )
  );

create policy "patients_delete" on patients
  for delete using (
    organization_id = public.current_org_id() and public.has_role('admin')
  );

-- Providers
create policy "providers_select" on providers
  for select using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  );

create policy "providers_insert" on providers
  for insert with check (
    organization_id = public.current_org_id() and public.has_role('admin')
  );

create policy "providers_update" on providers
  for update using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  );

create policy "providers_delete" on providers
  for delete using (
    organization_id = public.current_org_id() and public.has_role('admin')
  );

-- Appointments
create policy "appointments_select" on appointments
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
      or patient_id = public.current_patient_id()
    )
  );

create policy "appointments_insert" on appointments
  for insert with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
      or patient_id = public.current_patient_id()
    )
  );

create policy "appointments_update" on appointments
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
      or patient_id = public.current_patient_id()
    )
  );

create policy "appointments_delete" on appointments
  for delete using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
      or patient_id = public.current_patient_id()
    )
  );

-- Medical records
create policy "medical_records_select" on medical_records
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  );

create policy "medical_records_insert" on medical_records
  for insert with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
    )
  );

create policy "medical_records_update" on medical_records
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
    )
  );

create policy "medical_records_delete" on medical_records
  for delete using (
    organization_id = public.current_org_id() and public.has_role('admin')
  );

-- Prescriptions
create policy "prescriptions_select" on prescriptions
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
      or patient_id = public.current_patient_id()
    )
  );

create policy "prescriptions_insert" on prescriptions
  for insert with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
    )
  );

create policy "prescriptions_update" on prescriptions
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
    )
  );

create policy "prescriptions_delete" on prescriptions
  for delete using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
    )
  );

-- Documents
create policy "documents_select" on documents
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  );

create policy "documents_insert" on documents
  for insert with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  );

create policy "documents_update" on documents
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  );

create policy "documents_delete" on documents
  for delete using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  );

-- Files (documents)
create policy "files_select" on files
  for select using (
    exists (
      select 1
      from public.documents d
      where d.id = files.document_id
        and d.organization_id = public.current_org_id()
        and (
          public.has_role('admin')
          or (public.has_role('provider') and public.is_provider_for_patient(d.patient_id))
          or (public.has_role('patient') and d.patient_id = public.current_patient_id())
        )
    )
  );

create policy "files_insert" on files
  for insert with check (
    exists (
      select 1
      from public.documents d
      where d.id = files.document_id
        and d.organization_id = public.current_org_id()
        and (
          public.has_role('admin')
          or (public.has_role('provider') and public.is_provider_for_patient(d.patient_id))
          or (public.has_role('patient') and d.patient_id = public.current_patient_id())
        )
    )
  );

create policy "files_update" on files
  for update using (
    exists (
      select 1
      from public.documents d
      where d.id = files.document_id
        and d.organization_id = public.current_org_id()
        and (
          public.has_role('admin')
          or (public.has_role('provider') and public.is_provider_for_patient(d.patient_id))
          or (public.has_role('patient') and d.patient_id = public.current_patient_id())
        )
    )
  );

create policy "files_delete" on files
  for delete using (
    exists (
      select 1
      from public.documents d
      where d.id = files.document_id
        and d.organization_id = public.current_org_id()
        and (
          public.has_role('admin')
          or (public.has_role('provider') and public.is_provider_for_patient(d.patient_id))
          or (public.has_role('patient') and d.patient_id = public.current_patient_id())
        )
    )
  );

-- Conversations
create policy "conversations_select" on conversations
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin') or public.is_conversation_member(id)
    )
  );

create policy "conversations_insert" on conversations
  for insert with check (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or public.has_role('provider') or public.has_role('patient'))
  );

create policy "conversations_update" on conversations
  for update using (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  );

create policy "conversations_delete" on conversations
  for delete using (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  );

-- Conversation members
create policy "conversation_members_select" on conversation_members
  for select using (
    public.has_role('admin') or user_id = auth.uid()
  );

create policy "conversation_members_insert" on conversation_members
  for insert with check (
    public.has_role('admin') or user_id = auth.uid()
  );

create policy "conversation_members_update" on conversation_members
  for update using (
    public.has_role('admin') or user_id = auth.uid()
  );

create policy "conversation_members_delete" on conversation_members
  for delete using (
    public.has_role('admin') or user_id = auth.uid()
  );

-- Messages
create policy "messages_select" on messages
  for select using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or public.is_conversation_member(conversation_id))
  );

create policy "messages_insert" on messages
  for insert with check (
    organization_id = public.current_org_id()
    and sender_id = auth.uid()
    and public.is_conversation_member(conversation_id)
  );

create policy "messages_update" on messages
  for update using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or sender_id = auth.uid())
  );

create policy "messages_delete" on messages
  for delete using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or sender_id = auth.uid())
  );

-- Notifications
create policy "notifications_select" on notifications
  for select using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  );

create policy "notifications_insert" on notifications
  for insert with check (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  );

create policy "notifications_update" on notifications
  for update using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  );

create policy "notifications_delete" on notifications
  for delete using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  );

-- Medications
create policy "medications_select" on medications
  for select using (
    public.has_role('admin') or public.has_role('provider') or public.has_role('patient')
  );

create policy "medications_insert" on medications
  for insert with check (public.has_role('admin') or public.has_role('provider'));

create policy "medications_update" on medications
  for update using (public.has_role('admin') or public.has_role('provider'));

create policy "medications_delete" on medications
  for delete using (public.has_role('admin'));

-- Storage buckets for documents/reports
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;
