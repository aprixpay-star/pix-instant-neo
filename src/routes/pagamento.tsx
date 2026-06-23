import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, Lock, ShieldCheck, Loader2, CreditCard } from "lucide-react";
import { processarPagamento } from "@/lib/mercadopago.functions";

const MP_PUBLIC_KEY = "TEST-4b6d4336-bd2e-4a96-bcc2-1b22a2bc73ba";

const TAXAS: Record<number, number> = {
  1: 0.12, 2: 0.19, 3: 0.25, 4: 0.28, 5: 0.30, 6: 0.32,
  7: 0.35, 8: 0.37, 9: 0.38, 10: 0.39, 11: 0.40, 12: 0.40,
};

type Search = { valor?: number; parcelas?: number };

export const Route = createFileRoute("/pagamento")({
  component: PagamentoPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    valor: s.valor ? Number(s.valor) : undefined,
    parcelas: s.parcelas ? Number(s.parcelas) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pagamento — APRIXPAY" },
      { name: "description", content: "Finalize sua operação com segurança." },
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

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})?(\d{3})?(\d{2})?/, (_, a, b, c, e) =>
    [a, b && "." + b, c && "." + c, e && "-" + e].filter(Boolean).join(""),
  );
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
    [a && `(${a}`, a && a.length === 2 && ") ", b, c && "-" + c].filter(Boolean).join(""));
  return d.replace(/(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
}
function maskCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}
function maskExp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length < 3 ? d : d.slice(0, 2) + "/" + d.slice(2);
}

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => MPInstance;
  }
}
interface MPInstance {
  createCardToken(params: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }): Promise<{ id: string; first_six_digits?: string }>;
  getPaymentMethods(params: { bin: string }): Promise<{
    results: Array<{ id: string; payment_type_id: string }>;
  }>;
}

function PagamentoPage() {
  const { valor: valorSearch, parcelas: parcelasSearch } = Route.useSearch();
  const navigate = useNavigate();

  const valor = valorSearch ?? 0;
  const parcelas = parcelasSearch ?? 12;

  useEffect(() => {
    if (!valor) navigate({ to: "/simular" });
  }, [valor, navigate]);

  const taxa = TAXAS[parcelas] ?? 0.4;
  const totalCartao = useMemo(() => valor * (1 + taxa), [valor, taxa]);
  const valorParcela = useMemo(() => totalCartao / parcelas, [totalCartao, parcelas]);

  // Cliente
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [chavePix, setChavePix] = useState("");

  // Cartão
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const [aceite, setAceite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mpRef = useRef<MPInstance | null>(null);
  const [mpReady, setMpReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tryInit = () => {
      if (cancelled) return;
      if (window.MercadoPago) {
        mpRef.current = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
        setMpReady(true);
        return;
      }
      setTimeout(tryInit, 200);
    };
    tryInit();
    return () => { cancelled = true; };
  }, []);

  const submit = useServerFn(processarPagamento);

  const cpfDigits = cpf.replace(/\D/g, "");
  const phoneDigits = telefone.replace(/\D/g, "");
  const cardDigits = cardNumber.replace(/\s/g, "");

  const formValid =
    nome.trim().length >= 3 &&
    cpfDigits.length === 11 &&
    phoneDigits.length >= 10 &&
    /.+@.+\..+/.test(email) &&
    chavePix.trim().length >= 3 &&
    cardDigits.length >= 13 &&
    cardName.trim().length >= 3 &&
    /^\d{2}\/\d{2}$/.test(exp) &&
    cvv.length >= 3 &&
    aceite;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formValid || !mpRef.current) return;
    setLoading(true);
    try {
      const [mm, yy] = exp.split("/");
      const yearFull = "20" + yy;

      // Detect payment method from BIN
      const bin = cardDigits.slice(0, 6);
      const methods = await mpRef.current.getPaymentMethods({ bin });
      const credit = methods.results.find((m) => m.payment_type_id === "credit_card") ?? methods.results[0];
      if (!credit) throw new Error("Bandeira do cartão não aceita.");

      // Tokenize
      const tokenResp = await mpRef.current.createCardToken({
        cardNumber: cardDigits,
        cardholderName: cardName,
        cardExpirationMonth: mm,
        cardExpirationYear: yearFull,
        securityCode: cvv,
        identificationType: "CPF",
        identificationNumber: cpfDigits,
      });

      const result = await submit({
        data: {
          token: tokenResp.id,
          payment_method_id: credit.id,
          installments: parcelas,
          nome: nome.trim(),
          cpf: cpfDigits,
          telefone: phoneDigits,
          email: email.trim().toLowerCase(),
          chave_pix: chavePix.trim(),
          valor_recebido: valor,
          valor_total_cartao: Math.round(totalCartao * 100) / 100,
          parcelas,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      });

      if (result.approved) {
        navigate({
          to: "/sucesso",
          search: { valor, parcelas, payment_id: result.payment_id ?? "" },
        });
      } else {
        setError(
          `Pagamento não aprovado (${result.status}${result.status_detail ? " - " + result.status_detail : ""}). Tente outro cartão.`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar pagamento.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <Logo />
          </Link>
          <Link
            to="/simular"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-neon/15 blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-4 py-8 md:py-12">
          {/* Resumo */}
          <div className="rounded-3xl border-2 border-neon/40 bg-gradient-to-b from-neon/10 to-transparent p-5 text-center md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Você vai receber no Pix
            </p>
            <p className="mt-1 font-display text-5xl font-black text-neon md:text-6xl">
              R$ {formatBRL(valor)}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-bold">{parcelas}x</span> de{" "}
              <span className="font-bold text-neon">R$ {formatBRL(valorParcela)}</span>{" "}
              <span className="text-muted-foreground">(total R$ {formatBRL(totalCartao)})</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Dados do cliente */}
            <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Seus dados
              </h2>
              <div className="mt-4 space-y-3">
                <Field label="Nome completo">
                  <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} placeholder="Seu nome" required />
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="CPF">
                    <input value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} className={inputCls} placeholder="000.000.000-00" inputMode="numeric" required />
                  </Field>
                  <Field label="Telefone">
                    <input value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} className={inputCls} placeholder="(11) 90000-0000" inputMode="tel" required />
                  </Field>
                </div>
                <Field label="E-mail">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="voce@email.com" required />
                </Field>
                <Field label="Chave Pix (onde receber)">
                  <input value={chavePix} onChange={(e) => setChavePix(e.target.value)} className={inputCls} placeholder="CPF, e-mail, telefone ou chave aleatória" required />
                </Field>
              </div>
            </section>

            {/* Dados do cartão */}
            <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Cartão de crédito
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Lock className="h-3 w-3 text-neon" /> Tokenizado por Mercado Pago
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <Field label="Número do cartão">
                  <input value={cardNumber} onChange={(e) => setCardNumber(maskCard(e.target.value))} className={inputCls} placeholder="0000 0000 0000 0000" inputMode="numeric" required />
                </Field>
                <Field label="Nome impresso no cartão">
                  <input value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className={inputCls} placeholder="COMO IMPRESSO" required />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Validade">
                    <input value={exp} onChange={(e) => setExp(maskExp(e.target.value))} className={inputCls} placeholder="MM/AA" inputMode="numeric" required />
                  </Field>
                  <Field label="CVV">
                    <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} className={inputCls} placeholder="000" inputMode="numeric" required />
                  </Field>
                </div>
              </div>
            </section>

            {/* Autorização */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:border-neon/40">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-neon"
              />
              <span className="text-sm font-medium">
                Declaro que autorizo esta operação e estou ciente dos valores apresentados.
              </span>
            </label>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!formValid || loading || !mpReady}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-neon py-4 font-display text-base font-black uppercase tracking-wide text-primary-foreground transition-all hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
              ) : (
                <><CreditCard className="h-4 w-4" /> Pagar R$ {formatBRL(totalCartao)}</>
              )}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-neon" /> Conexão segura
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-neon" /> Cartão protegido por Mercado Pago
              </span>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <p className="text-[10px] leading-relaxed text-muted-foreground/60">
            A APRIXPAY é uma plataforma de intermediação financeira digital. Não realiza empréstimos nem concessão de crédito.
          </p>
        </div>
      </footer>
    </div>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-neon focus:shadow-[0_0_0_3px_oklch(0.88_0.27_145_/_0.15)] focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
