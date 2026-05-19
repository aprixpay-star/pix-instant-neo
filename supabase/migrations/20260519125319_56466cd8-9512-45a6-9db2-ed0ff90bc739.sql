
CREATE TABLE public.operacoes_vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  valor_venda NUMERIC NOT NULL,
  parcelas INTEGER NOT NULL,
  aceite_termos BOOLEAN NOT NULL DEFAULT false,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operacoes_vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert sales operations"
ON public.operacoes_vendas
FOR INSERT
TO anon, authenticated
WITH CHECK (aceite_termos = true);
