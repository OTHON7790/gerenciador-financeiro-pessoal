ALTER TABLE public.recorrencias
  ADD COLUMN IF NOT EXISTS data_vencimento date;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recorrencias TO authenticated;
GRANT ALL ON public.recorrencias TO service_role;