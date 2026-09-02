ALTER TABLE public.recorrencias
  ADD COLUMN IF NOT EXISTS status_pagamento public.status_pagamento NOT NULL DEFAULT 'pago';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recorrencias TO authenticated;
GRANT ALL ON public.recorrencias TO service_role;

ALTER TABLE public.transacoes
  ALTER COLUMN status_pagamento SET DEFAULT 'pago';