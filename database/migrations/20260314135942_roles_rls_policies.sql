-- RLS policies to allow users to read their roles

create policy "user_roles_self_select" on user_roles
  for select using (user_id = (select auth.uid()));

create policy "roles_assigned_select" on roles
  for select using (
    exists (
      select 1
      from public.user_roles ur
      where ur.role_id = roles.id
        and ur.user_id = (select auth.uid())
    )
  );
