-- Terços dos stands (A, B, C). Rode uma vez no Supabase → SQL Editor → Run.
ALTER TABLE public.stands ADD COLUMN IF NOT EXISTS partes jsonb;
