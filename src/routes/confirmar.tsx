import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, Check, Loader2, ShieldCheck, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TAXAS: Record<number, number> = {
  1: 0.12, 2: 0.19, 3: 0.25, 4: 0.28, 5: 0.30, 6: 0.32,
  7: 0.35, 8: 0.37, 9: 0.38, 10: 0.39, 11: 0.40, 12: 0.40,
};

type Search = { valor?: number; parcelas?: number };

export const Route = createFileRoute("/confirmar")({
  component: ConfirmarPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    valor: s.valor ? Number(s.valor) : undefined,
    parcelas: s.parcelas ? Number(s.parcelas) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Confirmar Operação — APRIXPAY" },
      { name: "description", content: "Confirme seus dados para liberar o Pix." },
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

function maskCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCPF(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10) r = 0;
  if (r !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10) r = 0;
  return r === parseInt(d[10]);
}

function ConfirmarPage() {
  const { valor: vQuery, parcelas: pQuery } = Route.useSearch();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [valor, setValor] = useState<number>(vQuery ?? 2500);
  const [parcelas, setParcelas] = useState<number>(pQuery ?? 12);
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

  const canSubmit = nome.trim().length >= 3 && isValidCPF(cpf) && valor >= 500 && aceite && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.from("operacoes_vendas").insert({
      nome: nome.trim(),
      cpf: cpf.replace(/\D/g, ""),
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
            <h1 className="mt-6 font-display text-3xl font-black">Operação confirmada!</h1>
            <p className="mt-3 text-muted-foreground">
              Recebemos seus dados. Em instantes nosso time entrará em contato para liberar seu Pix de{" "}
              <span className="font-bold text-neon">R$ {formatBRL(valor)}</span>.
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <button
            onClick={() => navigate({ to: "/simular" })}
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
          {/* Resumo de conversão - valor recebido em destaque máximo */}
          <div className="rounded-3xl border-2 border-neon/40 bg-gradient-to-b from-neon/10 to-transparent p-6 text-center md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Você vai receber no Pix</p>
            <p className="mt-2 font-display text-6xl font-black text-neon md:text-7xl">
              R$ {formatBRL(valor)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Em instantes direto na sua conta
            </p>

            <div className="mt-6 flex flex-col items-center gap-1">
              <p className="text-sm text-foreground">
                <span className="font-bold">{parcelas}x</span> de <span className="font-bold text-neon">R$ {formatBRL(valorParcela)}</span> no cartão
              </p>
              <p className="text-xs text-muted-foreground">
                Total no cartão: R$ {formatBRL(totalCartao)}
              </p>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="font-bold text-neon">{(taxa * 100 / parcelas).toFixed(2).replace('.', ',')}%</span> ao mês
              <span className="text-muted-foreground/60">· Taxa mensal aplicada ao seu saldo</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-neon">Última etapa</p>
            <h1 className="mt-2 font-display text-3xl font-black leading-[0.95] tracking-tight md:text-4xl">
              Confirme seus dados
            </h1>
            <p className="mt-3 text-balance text-sm text-muted-foreground">
              Preencha abaixo para liberar seu Pix. Leva menos de 1 minuto.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8"
          >
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Nome completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como no seu documento"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                CPF
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={(e) => setCpf(maskCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                required
              />
              {cpf.length > 0 && !isValidCPF(cpf) && (
                <p className="mt-1 text-xs text-red-400">CPF inválido</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Valor da venda
                </label>
                <div className="mt-2 flex items-center rounded-xl border border-border bg-background px-4 py-3">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <input
                    type="number"
                    min={500}
                    max={15000}
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value))}
                    className="ml-2 w-full bg-transparent text-base font-bold text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Parcelas
                </label>
                <select
                  value={parcelas}
                  onChange={(e) => setParcelas(Number(e.target.value))}
                  className="mt-2 w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 text-base font-bold text-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                >
                  {Object.keys(TAXAS).map((p) => (
                    <option key={p} value={p}>
                      {p}x
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/50 p-3 transition-colors hover:border-neon/30">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-neon"
              />
              <span className="text-xs text-muted-foreground">
                Confirmo os valores e autorizo o depósito imediato na minha conta.
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-4 font-display text-base font-bold uppercase tracking-wide text-white transition-all hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 animate-pulse-ring"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Confirmar e receber agora
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-neon" />
              Seus dados são criptografados e protegidos.
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
      </footer>
    </div>
  );
}
