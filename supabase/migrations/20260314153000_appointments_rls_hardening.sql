-- Harden appointments RLS to prevent provider self-assignment and cross-org links

drop policy if exists "appointments_insert" on appointments;
drop policy if exists "appointments_update" on appointments;

create policy "appointments_insert" on appointments
  for insert with check (
    organization_id = public.current_org_id()
    and exists (
      select 1
      from public.patients p
      where p.id = patient_id
        and p.organization_id = public.current_org_id()
    )
    and exists (
      select 1
      from public.providers pr
      where pr.id = provider_id
        and pr.organization_id = public.current_org_id()
    )
    and (
      public.has_role('admin')
      or (
        public.has_role('provider')
        and provider_id = public.current_provider_id()
        and public.is_provider_for_patient(patient_id)
      )
      or (
        public.has_role('patient')
        and patient_id = public.current_patient_id()
      )
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
  )
  with check (
    organization_id = public.current_org_id()
    and exists (
      select 1
      from public.patients p
      where p.id = patient_id
        and p.organization_id = public.current_org_id()
    )
    and exists (
      select 1
      from public.providers pr
      where pr.id = provider_id
        and pr.organization_id = public.current_org_id()
    )
    and (
      public.has_role('admin')
      or (
        public.has_role('provider')
        and provider_id = public.current_provider_id()
        and public.is_provider_for_patient(patient_id)
      )
      or (
        public.has_role('patient')
        and patient_id = public.current_patient_id()
      )
    )
  );
