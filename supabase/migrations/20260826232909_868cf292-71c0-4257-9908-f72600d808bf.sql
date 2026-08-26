CREATE TABLE public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  valor_alvo numeric(12,2) NOT NULL CHECK (valor_alvo > 0),
  valor_acumulado numeric(12,2) NOT NULL DEFAULT 0 CHECK (valor_acumulado >= 0),
  prazo date,
  cor text NOT NULL DEFAULT '#3b82f6',
  icone text NOT NULL DEFAULT 'target',
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.metas TO authenticated;
GRANT ALL ON public.metas TO service_role;

ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metas dono" ON public.metas
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER metas_set_atualizado_em
  BEFORE UPDATE ON public.metas
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

CREATE INDEX metas_user_id_idx ON public.metas (user_id, criado_em DESC);