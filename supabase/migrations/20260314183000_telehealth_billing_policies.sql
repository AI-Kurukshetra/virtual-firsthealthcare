-- Add RLS policies for appointment rooms (telehealth sessions) and invoices

drop policy if exists "appointment_rooms_select" on appointment_rooms;
drop policy if exists "appointment_rooms_insert" on appointment_rooms;
drop policy if exists "appointment_rooms_update" on appointment_rooms;
drop policy if exists "appointment_rooms_delete" on appointment_rooms;

create policy "appointment_rooms_select" on appointment_rooms
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (
        public.has_role('provider') and exists (
          select 1
          from public.appointments a
          where a.id = appointment_rooms.appointment_id
            and a.organization_id = public.current_org_id()
            and a.provider_id = public.current_provider_id()
        )
      )
      or (
        public.has_role('patient') and exists (
          select 1
          from public.appointments a
          where a.id = appointment_rooms.appointment_id
            and a.organization_id = public.current_org_id()
            and a.patient_id = public.current_patient_id()
        )
      )
    )
  );

create policy "appointment_rooms_insert" on appointment_rooms
  for insert with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (
        public.has_role('provider') and exists (
          select 1
          from public.appointments a
          where a.id = appointment_rooms.appointment_id
            and a.organization_id = public.current_org_id()
            and a.provider_id = public.current_provider_id()
        )
      )
    )
  );

create policy "appointment_rooms_update" on appointment_rooms
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (
        public.has_role('provider') and exists (
          select 1
          from public.appointments a
          where a.id = appointment_rooms.appointment_id
            and a.organization_id = public.current_org_id()
            and a.provider_id = public.current_provider_id()
        )
      )
    )
  )
  with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (
        public.has_role('provider') and exists (
          select 1
          from public.appointments a
          where a.id = appointment_rooms.appointment_id
            and a.organization_id = public.current_org_id()
            and a.provider_id = public.current_provider_id()
        )
      )
    )
  );

create policy "appointment_rooms_delete" on appointment_rooms
  for delete using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (
        public.has_role('provider') and exists (
          select 1
          from public.appointments a
          where a.id = appointment_rooms.appointment_id
            and a.organization_id = public.current_org_id()
            and a.provider_id = public.current_provider_id()
        )
      )
    )
  );

-- Invoices policies (billing)

drop policy if exists "billing_access" on invoices;
drop policy if exists "invoices_select" on invoices;
drop policy if exists "invoices_insert" on invoices;
drop policy if exists "invoices_update" on invoices;
drop policy if exists "invoices_delete" on invoices;

create policy "invoices_select" on invoices
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and provider_id = public.current_provider_id())
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  );

create policy "invoices_insert" on invoices
  for insert with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and provider_id = public.current_provider_id())
    )
  );

create policy "invoices_update" on invoices
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and provider_id = public.current_provider_id())
    )
  )
  with check (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and provider_id = public.current_provider_id())
    )
  );

create policy "invoices_delete" on invoices
  for delete using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (public.has_role('provider') and provider_id = public.current_provider_id())
    )
  );

-- Payments policies (read for revenue charts)

drop policy if exists "payments_select" on payments;
drop policy if exists "payments_insert" on payments;
drop policy if exists "payments_update" on payments;
drop policy if exists "payments_delete" on payments;

create policy "payments_select" on payments
  for select using (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  );

create policy "payments_insert" on payments
  for insert with check (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  );

create policy "payments_update" on payments
  for update using (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  )
  with check (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  );

create policy "payments_delete" on payments
  for delete using (
    organization_id = public.current_org_id()
    and public.has_role('admin')
  );
