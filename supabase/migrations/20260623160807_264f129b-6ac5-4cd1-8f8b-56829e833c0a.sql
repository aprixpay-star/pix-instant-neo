
ALTER TABLE public.operacoes_vendas
  ADD COLUMN IF NOT EXISTS valor_total_cartao NUMERIC,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDENTE',
  ADD COLUMN IF NOT EXISTS status_detail TEXT;

CREATE INDEX IF NOT EXISTS operacoes_vendas_payment_id_idx ON public.operacoes_vendas (payment_id);

-- Service role already has ALL via earlier grant; ensure explicit policy isn't needed because
-- service_role bypasses RLS. No additional policy required for webhook updates.
