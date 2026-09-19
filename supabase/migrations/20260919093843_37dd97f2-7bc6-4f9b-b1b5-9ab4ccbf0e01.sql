CREATE TABLE public.standard_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  standard_number text NOT NULL,
  product_category text,
  test_name text NOT NULL,
  clause_ref text,
  requirement text,
  method text,
  data_origin text NOT NULL DEFAULT 'Verified source',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.standard_tests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.standard_tests TO authenticated;
GRANT ALL ON public.standard_tests TO service_role;

ALTER TABLE public.standard_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Standard tests are publicly readable"
  ON public.standard_tests FOR SELECT USING (true);
CREATE POLICY "Admins can add standard tests"
  ON public.standard_tests FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update standard tests"
  ON public.standard_tests FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete standard tests"
  ON public.standard_tests FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_standard_tests_updated_at
  BEFORE UPDATE ON public.standard_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX standard_tests_standard_idx ON public.standard_tests (standard_number);

ALTER TABLE public.products_map ADD COLUMN IF NOT EXISTS product_category text;

GRANT SELECT ON public.products_map TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products_map TO authenticated;
GRANT ALL ON public.products_map TO service_role;

CREATE POLICY "Admins can add product links"
  ON public.products_map FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update product links"
  ON public.products_map FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete product links"
  ON public.products_map FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));