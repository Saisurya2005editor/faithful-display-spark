GRANT SELECT (id, lab_key, name, city, state, recognized_scope, source_url, data_origin, created_at) ON public.labs TO anon, authenticated;
GRANT ALL ON public.labs TO service_role;