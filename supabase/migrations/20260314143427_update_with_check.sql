-- Add WITH CHECK to update policies to prevent unauthorized row rewrites

-- Patients

drop policy if exists "patients_update" on patients;
create policy "patients_update" on patients
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(id))
      or (public.has_role('patient') and user_id = auth.uid())
    )
  )
  with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(id))
      or (public.has_role('patient') and user_id = auth.uid())
    )
  );

-- Providers

drop policy if exists "providers_update" on providers;
create policy "providers_update" on providers
  for update using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  )
  with check (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  );

-- Appointments

drop policy if exists "appointments_update" on appointments;
create policy "appointments_update" on appointments
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
      or patient_id = public.current_patient_id()
    )
  )
  with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
      or patient_id = public.current_patient_id()
    )
  );

-- Medical records

drop policy if exists "medical_records_update" on medical_records;
create policy "medical_records_update" on medical_records
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
    )
  )
  with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
    )
  );

-- Prescriptions

drop policy if exists "prescriptions_update" on prescriptions;
create policy "prescriptions_update" on prescriptions
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
    )
  )
  with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
    )
  );

-- Documents

drop policy if exists "documents_update" on documents;
create policy "documents_update" on documents
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  )
  with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  );

-- Files

drop policy if exists "files_update" on files;
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
  )
  with check (
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

drop policy if exists "conversations_update" on conversations;
create policy "conversations_update" on conversations
  for update using (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  )
  with check (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  );

-- Conversation members

drop policy if exists "conversation_members_update" on conversation_members;
create policy "conversation_members_update" on conversation_members
  for update using (
    public.has_role('admin') or user_id = auth.uid()
  )
  with check (
    public.has_role('admin') or user_id = auth.uid()
  );

-- Messages

drop policy if exists "messages_update" on messages;
create policy "messages_update" on messages
  for update using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or sender_id = auth.uid())
  )
  with check (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or sender_id = auth.uid())
  );

-- Notifications

drop policy if exists "notifications_update" on notifications;
create policy "notifications_update" on notifications
  for update using (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  )
  with check (
    organization_id = public.current_org_id()
    and (public.has_role('admin') or user_id = auth.uid())
  );

-- Medications

drop policy if exists "medications_update" on medications;
create policy "medications_update" on medications
  for update using (public.has_role('admin') or public.has_role('provider'))
  with check (public.has_role('admin') or public.has_role('provider'));
