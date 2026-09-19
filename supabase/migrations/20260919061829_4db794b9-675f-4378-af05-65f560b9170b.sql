create or replace function public.set_chunk_embedding(_id uuid, _embedding vector(1536))
returns void
language sql
security definer
set search_path = public
as $$
  update public.chunks set embedding = _embedding where id = _id;
$$;

revoke all on function public.set_chunk_embedding(uuid, vector) from public;
grant execute on function public.set_chunk_embedding(uuid, vector) to anon, authenticated, service_role;

grant execute on function public.match_chunks(vector, text, integer) to anon, authenticated, service_role;