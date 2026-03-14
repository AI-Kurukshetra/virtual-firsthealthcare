-- Scope users visibility to current organization

drop policy if exists "users_select" on users;

create policy "users_select" on users
  for select using (
    (
      organization_id = public.current_org_id()
      or id = auth.uid()
    )
    and (
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
    )
  );
