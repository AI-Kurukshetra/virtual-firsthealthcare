-- Recreate profiles view with profile_image column in correct order

alter table public.users
  add column if not exists profile_image text;

drop view if exists public.profiles;

create view public.profiles as
select
  u.id,
  u.full_name,
  u.email,
  u.organization_id,
  u.created_at,
  u.profile_image,
  (
    select r.name
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = u.id
    limit 1
  ) as role
from public.users u;

grant select on public.profiles to anon, authenticated;
