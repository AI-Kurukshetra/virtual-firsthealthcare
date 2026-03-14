-- Profiles view to expose role for redirects

create or replace view public.profiles as
select
  u.id,
  u.full_name,
  u.email,
  u.organization_id,
  u.created_at,
  (
    select r.name
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = u.id
    limit 1
  ) as role
from public.users u;

grant select on public.profiles to anon, authenticated;
