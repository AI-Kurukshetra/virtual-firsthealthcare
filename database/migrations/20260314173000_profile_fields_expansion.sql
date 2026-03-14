-- Expand profile-related fields to support richer seed data

do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_type') then
    create type appointment_type as enum ('video', 'clinic');
  end if;
end $$;

alter table public.users
  add column if not exists phone text,
  add column if not exists avatar_url text;

alter table public.providers
  add column if not exists years_of_experience int,
  add column if not exists bio text,
  add column if not exists clinic_name text;

alter table public.patients
  add column if not exists blood_group text,
  add column if not exists emergency_contact text;

alter table public.appointments
  add column if not exists appointment_type appointment_type default 'video';

alter table public.documents
  add column if not exists document_type text,
  add column if not exists uploaded_at timestamptz not null default now();

alter table public.files
  add column if not exists file_name text,
  add column if not exists file_type text;

alter table public.messages
  add column if not exists receiver_id uuid references public.users(id) on delete set null;

alter table public.notifications
  add column if not exists type text,
  add column if not exists is_read boolean not null default false;

alter table public.invoices
  add column if not exists provider_id uuid references public.providers(id) on delete set null,
  add column if not exists appointment_id uuid references public.appointments(id) on delete set null,
  add column if not exists currency text not null default 'USD',
  add column if not exists payment_method text;

alter table public.appointment_rooms
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz;

-- Recreate profiles view to expose avatar_url and profile_image

drop view if exists public.profiles;

create view public.profiles as
select
  u.id,
  u.full_name,
  u.email,
  u.organization_id,
  u.created_at,
  u.profile_image,
  u.avatar_url,
  (
    select r.name
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = u.id
    limit 1
  ) as role
from public.users u;

grant select on public.profiles to anon, authenticated;
