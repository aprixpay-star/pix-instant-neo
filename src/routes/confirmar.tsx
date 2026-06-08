import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, Check, Loader2, ShieldCheck, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TAXAS: Record<number, number> = {
  1: 0.12, 2: 0.19, 3: 0.25, 4: 0.28, 5: 0.30, 6: 0.32,
  7: 0.35, 8: 0.37, 9: 0.38, 10: 0.39, 11: 0.40, 12: 0.40,
};

type Search = {
  valor?: number;
  parcelas?: number;
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  chavePix?: string;
};

export const Route = createFileRoute("/confirmar")({
  component: ConfirmarPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    valor: s.valor ? Number(s.valor) : undefined,
    parcelas: s.parcelas ? Number(s.parcelas) : undefined,
    nome: typeof s.nome === "string" ? s.nome : undefined,
    cpf: typeof s.cpf === "string" ? s.cpf : undefined,
    telefone: typeof s.telefone === "string" ? s.telefone : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
    chavePix: typeof s.chavePix === "string" ? s.chavePix : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Autorizar Operação — APRIXPAY" },
      { name: "description", content: "Revise e autorize sua operação." },
    ],
  }),
});

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon font-display font-black text-primary-foreground">
        A
      </div>
      <span className="font-display text-xl font-bold tracking-tight">
        APRIX<span className="text-neon">PAY</span>
      </span>
    </div>
  );
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCPF(d: string) {
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatPhone(d: string) {
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return d;
}

function ConfirmarPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const valor = search.valor ?? 0;
  const parcelas = search.parcelas ?? 12;
  const nome = search.nome ?? "";
  const cpf = search.cpf ?? "";
  const telefone = search.telefone ?? "";
  const email = search.email ?? "";
  const chavePix = search.chavePix ?? "";

  const missingData = !nome || !cpf || !telefone || !email || !chavePix || !valor;

  useEffect(() => {
    if (missingData) {
      navigate({ to: "/cadastro", search: { valor: valor || undefined, parcelas } });
    }
  }, [missingData, navigate, valor, parcelas]);

  const [aceite, setAceite] = useState(false);
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setIp(d.ip))
      .catch(() => setIp(null));
  }, []);

  const taxa = TAXAS[parcelas] ?? 0.4;
  const totalCartao = useMemo(() => valor * (1 + taxa), [valor, taxa]);
  const valorParcela = useMemo(() => totalCartao / parcelas, [totalCartao, parcelas]);

  const canSubmit = aceite && !loading && !missingData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.from("operacoes_vendas").insert({
      nome,
      cpf,
      telefone,
      email,
      chave_pix: chavePix,
      valor_venda: valor,
      parcelas,
      aceite_termos: aceite,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      ip_address: ip,
    });

    setLoading(false);
    if (err) {
      setError("Erro ao enviar. Tente novamente em instantes.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neon text-primary-foreground">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-black">Operação autorizada!</h1>
            <p className="mt-3 text-muted-foreground">
              Recebemos sua autorização. Seu Pix de{" "}
              <span className="font-bold text-neon">R$ {formatBRL(valor)}</span> será liberado em instantes na chave informada.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 font-display font-bold uppercase tracking-wide text-primary-foreground transition-all hover:brightness-110"
            >
              Voltar ao início <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (missingData) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <button
            onClick={() =>
              navigate({ to: "/cadastro", search: { valor, parcelas } })
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-neon/15 blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-4 py-10 md:py-16">
          <div className="flex items-center justify-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">1</span>
            <span className="h-px w-8 bg-border" />
            <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">2</span>
            <span className="h-px w-8 bg-border" />
            <span className="grid h-6 w-6 place-items-center rounded-full bg-neon text-[10px] font-bold text-primary-foreground">3</span>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-neon">Etapa final</p>
            <h1 className="mt-2 font-display text-3xl font-black leading-[0.95] tracking-tight md:text-4xl">
              Revise e autorize
            </h1>
          </div>

          {/* Hero: valor solicitado em destaque máximo */}
          <div className="mt-8 rounded-3xl border-2 border-neon/40 bg-gradient-to-b from-neon/10 to-transparent p-6 text-center md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Valor solicitado
            </p>
            <p className="mt-2 font-display text-6xl font-black text-neon md:text-7xl">
              R$ {formatBRL(valor)}
            </p>
            <p className="mt-3 text-sm text-foreground">
              <span className="font-bold">{parcelas}x</span> de{" "}
              <span className="font-bold text-neon">R$ {formatBRL(valorParcela)}</span>{" "}
              no cartão
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Total no cartão: R$ {formatBRL(totalCartao)}
            </p>
          </div>

          {/* Dados do recebedor */}
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Dados do recebedor
              </h2>
              <Link
                to="/cadastro"
                search={{ valor, parcelas }}
                className="text-xs font-medium text-neon hover:underline"
              >
                Editar
              </Link>
            </div>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Row label="Nome" value={nome} />
              <Row label="CPF" value={formatCPF(cpf)} />
              <Row label="Telefone" value={formatPhone(telefone)} />
              <Row label="E-mail" value={email} />
              <Row label="Chave Pix" value={chavePix} full />
            </dl>
          </div>

          {/* Autorização */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:border-neon/40">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-neon"
              />
              <span className="text-sm font-medium text-foreground">
                Declaro que autorizo esta operação.
              </span>
            </label>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-neon py-4 font-display text-base font-black uppercase tracking-wide text-primary-foreground transition-all hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Autorizando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Autorizar e receber no Pix
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-neon" /> Conexão segura
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-neon" /> Operação protegida APRIXPAY
              </span>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-center md:flex-row md:text-left">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} APRIXPAY. Todos os direitos reservados.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-6">
          <p className="text-center text-[10px] leading-relaxed text-muted-foreground/50">
            A APRIXPAY é uma plataforma de intermediação financeira digital responsável pela facilitação de operações de liquidez via cartão de crédito. A empresa não realiza empréstimos, financiamentos ou concessão de crédito direto ao consumidor.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Row({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate font-medium text-foreground">{value}</dd>
    </div>
  );
}
