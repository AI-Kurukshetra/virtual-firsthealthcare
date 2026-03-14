-- Allow providers to read prescriptions for assigned patients

drop policy if exists "prescriptions_select" on prescriptions;

create policy "prescriptions_select" on prescriptions
  for select using (
    organization_id = public.current_org_id()
    and (
      public.has_role('admin')
      or provider_id = public.current_provider_id()
      or (public.has_role('provider') and public.is_provider_for_patient(patient_id))
      or (public.has_role('patient') and patient_id = public.current_patient_id())
    )
  );
