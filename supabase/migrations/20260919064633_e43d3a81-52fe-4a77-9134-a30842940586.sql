create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins can read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
-- First-admin bootstrap: a signed-in user may claim admin only while no admin exists.
create policy "First user can claim admin" on public.user_roles
  for insert to authenticated
  with check (
    auth.uid() = user_id and role = 'admin'
    and not exists (select 1 from public.user_roles where role = 'admin')
  );
create policy "Admins can grant roles" on public.user_roles
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can revoke roles" on public.user_roles
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Analytics events (one row per answered question)
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  lang text not null default 'en',
  confidence text,
  retrieved_count int default 0,
  top_standard text,
  created_at timestamptz not null default now()
);
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;
alter table public.analytics_events enable row level security;
create policy "Anyone can log a question event" on public.analytics_events
  for insert to anon, authenticated with check (true);
create policy "Admins can read analytics" on public.analytics_events
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Admin-only writes for ingested documents and chunks (reads stay public from Prompt 2)
create policy "Admins can add documents" on public.documents
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update documents" on public.documents
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete documents" on public.documents
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can add chunks" on public.chunks
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete chunks" on public.chunks
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Let feedback be readable by admins for the insights page
create policy "Admins can read feedback" on public.feedback
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));