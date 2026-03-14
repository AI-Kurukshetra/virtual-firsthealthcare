-- Enforce provider assignment when writing prescriptions

drop policy if exists "prescriptions_insert" on prescriptions;
drop policy if exists "prescriptions_update" on prescriptions;
drop policy if exists "prescriptions_delete" on prescriptions;

create policy "prescriptions_insert" on prescriptions
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
    )
  );

create policy "prescriptions_update" on prescriptions
  for update using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (
        public.has_role('provider')
        and provider_id = public.current_provider_id()
        and public.is_provider_for_patient(patient_id)
      )
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
    )
  );

create policy "prescriptions_delete" on prescriptions
  for delete using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or (
        public.has_role('provider')
        and provider_id = public.current_provider_id()
        and public.is_provider_for_patient(patient_id)
      )
    )
  );
