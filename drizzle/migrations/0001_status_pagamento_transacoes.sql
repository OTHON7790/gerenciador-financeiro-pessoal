DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pagamento') THEN
    CREATE TYPE public.status_pagamento AS ENUM ('pago', 'pendente');
  END IF;
END$$;

ALTER TABLE public.transacoes
  ADD COLUMN IF NOT EXISTS status_pagamento public.status_pagamento NOT NULL DEFAULT 'pago',
  ADD COLUMN IF NOT EXISTS data_vencimento date,
  ADD COLUMN IF NOT EXISTS data_pagamento date;

UPDATE public.transacoes
   SET data_pagamento = data
 WHERE tipo = 'despesa' AND status_pagamento = 'pago' AND data_pagamento IS NULL;

CREATE INDEX IF NOT EXISTS transacoes_status_idx
  ON public.transacoes (user_id, status_pagamento, data_vencimento);