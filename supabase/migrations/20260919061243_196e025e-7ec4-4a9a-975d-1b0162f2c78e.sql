create extension if not exists vector;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  doc_key text unique,
  standard_number text not null,
  title text not null,
  division text,
  sector text,
  year int,
  status text default 'Active',
  enforcement text,
  summary text,
  tags text[] default '{}',
  source_url text,
  full_text text,
  data_origin text default 'Sample',
  created_at timestamptz not null default now()
);
grant select on public.documents to anon, authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "Documents are publicly readable" on public.documents for select using (true);

create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_text text not null,
  clause_ref text,
  heading text,
  page int,
  embedding vector(1536),
  language text default 'en',
  created_at timestamptz not null default now()
);
grant select on public.chunks to anon, authenticated;
grant all on public.chunks to service_role;
alter table public.chunks enable row level security;
create policy "Chunks are publicly readable" on public.chunks for select using (true);

create table public.schemes (
  id uuid primary key default gen_random_uuid(),
  scheme_key text unique,
  name text not null,
  short_name text,
  description text,
  eligibility text,
  steps jsonb default '[]'::jsonb,
  documents_required jsonb default '[]'::jsonb,
  source_url text,
  data_origin text default 'Sample',
  created_at timestamptz not null default now()
);
grant select on public.schemes to anon, authenticated;
grant all on public.schemes to service_role;
alter table public.schemes enable row level security;
create policy "Schemes are publicly readable" on public.schemes for select using (true);

create table public.labs (
  id uuid primary key default gen_random_uuid(),
  lab_key text unique,
  name text not null,
  city text,
  state text,
  recognized_scope text[] default '{}',
  contact text,
  email text,
  source_url text,
  created_at timestamptz not null default now()
);
grant select on public.labs to anon, authenticated;
grant all on public.labs to service_role;
alter table public.labs enable row level security;
create policy "Labs are publicly readable" on public.labs for select using (true);

create table public.products_map (
  id uuid primary key default gen_random_uuid(),
  product_keywords text[] not null default '{}',
  standard_number text not null,
  mandatory boolean default false,
  scheme_key text,
  created_at timestamptz not null default now()
);
grant select on public.products_map to anon, authenticated;
grant all on public.products_map to service_role;
alter table public.products_map enable row level security;
create policy "Products map is publicly readable" on public.products_map for select using (true);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  language text default 'en',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.conversations to authenticated;
grant all on public.conversations to service_role;
alter table public.conversations enable row level security;
create policy "Users manage their own conversations" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null,
  content text not null,
  citations jsonb default '[]'::jsonb,
  confidence text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "Users manage messages in their conversations" on public.messages for all using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())) with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid,
  rating int not null,
  comment text,
  created_at timestamptz not null default now()
);
grant insert on public.feedback to anon, authenticated;
grant all on public.feedback to service_role;
alter table public.feedback enable row level security;
create policy "Anyone can leave feedback" on public.feedback for insert with check (true);

create or replace function public.match_chunks(query_embedding vector(1536), query_text text, match_count int default 6)
returns table(id uuid, document_id uuid, chunk_text text, clause_ref text, heading text, standard_number text, title text, source_url text, data_origin text, score float)
language sql stable
set search_path = public
as $$
  select c.id, c.document_id, c.chunk_text, c.clause_ref, c.heading,
         d.standard_number, d.title, d.source_url, d.data_origin,
         case when c.embedding is not null and query_embedding is not null
           then (1 - (c.embedding <=> query_embedding))::float
           else ts_rank(to_tsvector('english', c.chunk_text), plainto_tsquery('english', query_text))::float
         end as score
  from public.chunks c
  join public.documents d on d.id = c.document_id
  where (case when c.embedding is not null and query_embedding is not null
           then (1 - (c.embedding <=> query_embedding))::float
           else ts_rank(to_tsvector('english', c.chunk_text), plainto_tsquery('english', query_text))::float
         end) > 0.01
  order by score desc
  limit match_count;
$$;