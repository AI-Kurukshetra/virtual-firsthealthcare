-- Prevent recursive RLS by running helper functions as SECURITY DEFINER

create or replace function public.current_org_id() returns uuid
language sql
security definer
set search_path = public
stable as $$
  select organization_id
  from public.users
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.current_patient_id() returns uuid
language sql
security definer
set search_path = public
stable as $$
  select id
  from public.patients
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_provider_id() returns uuid
language sql
security definer
set search_path = public
stable as $$
  select id
  from public.providers
  where user_id = auth.uid()
    and organization_id = public.current_org_id()
  limit 1;
$$;

create or replace function public.has_role(role_name text) returns boolean
language sql
security definer
set search_path = public
stable as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = role_name
  );
$$;

create or replace function public.is_provider_for_patient(patient_uuid uuid) returns boolean
language sql
security definer
set search_path = public
stable as $$
  select exists (
    select 1
    from public.appointments a
    where a.patient_id = patient_uuid
      and a.provider_id = public.current_provider_id()
      and a.organization_id = public.current_org_id()
  );
$$;
