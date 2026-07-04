
-- =========================
-- ROLES (admin access)
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- CLIENTES
-- =========================
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text NOT NULL UNIQUE,
  telefone text NOT NULL,
  email text NOT NULL,
  chave_pix text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.clientes TO service_role;
GRANT SELECT ON public.clientes TO authenticated;

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view clientes"
  ON public.clientes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- STATUS ENUM + OPERACOES
-- =========================
CREATE TYPE public.operacao_status AS ENUM (
  'AGUARDANDO_ANALISE',
  'PIX_ENVIADO',
  'FINALIZADO',
  'CANCELADO',
  'APROVADO',
  'PENDENTE',
  'RECUSADO'
);

CREATE TABLE public.operacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  valor_solicitado numeric(12,2) NOT NULL,
  valor_cobrado numeric(12,2) NOT NULL,
  parcelas integer NOT NULL,
  payment_id text UNIQUE,
  status public.operacao_status NOT NULL DEFAULT 'AGUARDANDO_ANALISE',
  status_detail text,
  chave_pix text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX operacoes_cliente_idx ON public.operacoes (cliente_id);
CREATE INDEX operacoes_status_idx ON public.operacoes (status);
CREATE INDEX operacoes_created_idx ON public.operacoes (created_at DESC);

GRANT ALL ON public.operacoes TO service_role;
GRANT SELECT, UPDATE ON public.operacoes TO authenticated;

ALTER TABLE public.operacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view operacoes"
  ON public.operacoes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update operacoes"
  ON public.operacoes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- HISTORICO DE STATUS
-- =========================
CREATE TABLE public.historico_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operacao_id uuid NOT NULL REFERENCES public.operacoes(id) ON DELETE CASCADE,
  status_anterior public.operacao_status,
  status_novo public.operacao_status NOT NULL,
  alterado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX historico_status_operacao_idx ON public.historico_status (operacao_id, created_at DESC);

GRANT ALL ON public.historico_status TO service_role;
GRANT SELECT ON public.historico_status TO authenticated;

ALTER TABLE public.historico_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view historico"
  ON public.historico_status FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- TRIGGERS
-- =========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER clientes_set_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER operacoes_set_updated_at
BEFORE UPDATE ON public.operacoes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.log_operacao_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.historico_status (operacao_id, status_anterior, status_novo, alterado_por)
    VALUES (NEW.id, NULL, NEW.status, auth.uid());
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.historico_status (operacao_id, status_anterior, status_novo, alterado_por)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER operacoes_status_history_ins
AFTER INSERT ON public.operacoes
FOR EACH ROW EXECUTE FUNCTION public.log_operacao_status_change();

CREATE TRIGGER operacoes_status_history_upd
AFTER UPDATE ON public.operacoes
FOR EACH ROW EXECUTE FUNCTION public.log_operacao_status_change();
