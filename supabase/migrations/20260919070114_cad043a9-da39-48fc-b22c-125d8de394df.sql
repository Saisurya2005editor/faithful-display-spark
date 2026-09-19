drop view public.labs_public;
drop view public.admin_presence;

-- Labs: column-level read access. Public roles may read only the non-sensitive columns.
revoke select on public.labs from anon, authenticated;
grant select (lab_key, name, city, state, recognized_scope, source_url, created_at) on public.labs to anon, authenticated;

-- Admin-existence check: invoker wrapper around the private definer helper.
create or replace function public.admin_exists()
returns boolean
language sql stable security invoker set search_path = public
as $$ select private.any_admin() $$;
grant execute on function private.any_admin() to authenticated;
grant execute on function public.admin_exists() to authenticated;