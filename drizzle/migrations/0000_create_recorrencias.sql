CREATE TYPE public.frequencia_recorrencia AS ENUM ('mensal', 'anual');

CREATE TABLE public.recorrencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  categoria_id uuid REFERENCES public.categorias(id) ON DELETE SET NULL,
  frequencia public.frequencia_recorrencia NOT NULL DEFAULT 'mensal',
  dia_referencia smallint NOT NULL DEFAULT 1,
  data_inicio date NOT NULL,
  data_fim date,
  ativa boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recorrencias TO authenticated;
GRANT ALL ON public.recorrencias TO service_role;

ALTER TABLE public.recorrencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recorrencias dono" ON public.recorrencias
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER recorrencias_set_atualizado_em
  BEFORE UPDATE ON public.recorrencias
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

ALTER TABLE public.transacoes
  ADD COLUMN recorrencia_id uuid REFERENCES public.recorrencias(id) ON DELETE SET NULL,
  ADD COLUMN ocorrencia_ref text,
  ADD COLUMN editada_manualmente boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX transacoes_recorrencia_ocorrencia_key
  ON public.transacoes (recorrencia_id, ocorrencia_ref)
  WHERE recorrencia_id IS NOT NULL;

CREATE INDEX recorrencias_user_ativa_idx ON public.recorrencias (user_id, ativa);