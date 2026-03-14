-- Tighten users/providers visibility to assigned relationships

drop policy if exists "users_org_select" on users;
drop policy if exists "users_select" on users;

create policy "users_select" on users
  for select using (
    public.has_role('admin')
    or id = auth.uid()
    or (
      public.has_role('provider') and exists (
        select 1
        from public.patients p
        where p.user_id = users.id
          and public.is_provider_for_patient(p.id)
      )
    )
    or (
      public.has_role('patient') and exists (
        select 1
        from public.providers pr
        join public.appointments a on a.provider_id = pr.id
        where pr.user_id = users.id
          and a.patient_id = public.current_patient_id()
      )
    )
  );

drop policy if exists "providers_select" on providers;

create policy "providers_select" on providers
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or user_id = auth.uid()
      or (
        public.has_role('patient') and exists (
          select 1
          from public.appointments a
          where a.provider_id = providers.id
            and a.patient_id = public.current_patient_id()
        )
      )
    )
  );
