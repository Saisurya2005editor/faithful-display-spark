create schema if not exists private;

-- Private role-check helpers: not exposed through the API schema, so they cannot be called directly by clients.
create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create or replace function private.any_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;

revoke all on function private.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke all on function private.any_admin() from public, anon, authenticated;
grant execute on function private.has_role(uuid, public.app_role) to anon, authenticated;
grant execute on function private.any_admin() to authenticated;

-- Policies: switch from the exposed public.has_role to the private helper.
drop policy "Admins can read all roles" on public.user_roles;
create policy "Admins can read all roles" on public.user_roles
  for select to authenticated using (private.has_role(auth.uid(), 'admin'));

drop policy "Admins can grant roles" on public.user_roles;
create policy "Admins can grant roles" on public.user_roles
  for insert to authenticated with check (private.has_role(auth.uid(), 'admin'));

drop policy "Admins can revoke roles" on public.user_roles;
create policy "Admins can revoke roles" on public.user_roles
  for delete to authenticated using (private.has_role(auth.uid(), 'admin'));

drop policy "First user can claim admin" on public.user_roles;
create policy "First user can claim admin" on public.user_roles
  for insert to authenticated
  with check (auth.uid() = user_id and role = 'admin' and not private.any_admin());

drop policy "Admins can add documents" on public.documents;
create policy "Admins can add documents" on public.documents
  for insert to authenticated with check (private.has_role(auth.uid(), 'admin'));
drop policy "Admins can update documents" on public.documents;
create policy "Admins can update documents" on public.documents
  for update to authenticated using (private.has_role(auth.uid(), 'admin'));
drop policy "Admins can delete documents" on public.documents;
create policy "Admins can delete documents" on public.documents
  for delete to authenticated using (private.has_role(auth.uid(), 'admin'));
drop policy "Admins can add chunks" on public.chunks;
create policy "Admins can add chunks" on public.chunks
  for insert to authenticated with check (private.has_role(auth.uid(), 'admin'));
drop policy "Admins can delete chunks" on public.chunks;
create policy "Admins can delete chunks" on public.chunks
  for delete to authenticated using (private.has_role(auth.uid(), 'admin'));

drop policy "Admins can read analytics" on public.analytics_events;
create policy "Admins can read analytics" on public.analytics_events
  for select to authenticated using (private.has_role(auth.uid(), 'admin'));

drop policy "Admins can read feedback" on public.feedback;
create policy "Admins can read feedback" on public.feedback
  for select to authenticated using (private.has_role(auth.uid(), 'admin'));

drop function public.has_role(uuid, public.app_role);

-- Boolean flag for "an admin already exists" without exposing role rows.
create or replace view public.admin_presence as
  select exists (select 1 from public.user_roles where role = 'admin') as admin_exists;
grant select on public.admin_presence to authenticated;

-- Labs: serve a sanitized public directory without contact/phone/email.
create or replace view public.labs_public as
  select lab_key, name, city, state, recognized_scope, source_url, created_at
  from public.labs;
grant select on public.labs_public to anon, authenticated;
revoke select on public.labs from anon, authenticated;