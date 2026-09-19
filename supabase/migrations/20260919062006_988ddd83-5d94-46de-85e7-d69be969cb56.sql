create or replace function public.match_chunks(query_embedding extensions.vector, query_text text, match_count integer DEFAULT 6)
returns table(id uuid, document_id uuid, chunk_text text, clause_ref text, heading text, standard_number text, title text, source_url text, data_origin text, score double precision)
language sql
stable
set search_path = 'public'
as $$
  select c.id, c.document_id, c.chunk_text, c.clause_ref, c.heading,
         d.standard_number, d.title, d.source_url, d.data_origin,
         case when c.embedding is not null and query_embedding is not null
           then (1 - (c.embedding OPERATOR(extensions.<=>) query_embedding))::float
           else ts_rank(to_tsvector('english', c.chunk_text), plainto_tsquery('english', query_text))::float
         end as score
  from public.chunks c
  join public.documents d on d.id = c.document_id
  where (case when c.embedding is not null and query_embedding is not null
           then (1 - (c.embedding OPERATOR(extensions.<=>) query_embedding))::float
           else ts_rank(to_tsvector('english', c.chunk_text), plainto_tsquery('english', query_text))::float
         end) > 0.01
  order by score desc
  limit match_count;
$$;

grant execute on function public.match_chunks(extensions.vector, text, integer) to anon, authenticated, service_role;