import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowRight, ChevronLeft, Wallet, CreditCard, Check, Lock } from "lucide-react";

const TAXAS: Record<number, number> = {
  1: 0.12,
  2: 0.19,
  3: 0.25,
  4: 0.28,
  5: 0.30,
  6: 0.32,
  7: 0.35,
  8: 0.37,
  9: 0.38,
  10: 0.39,
  11: 0.40,
  12: 0.40,
};

export const Route = createFileRoute("/simular")({
  component: SimularPage,
  head: () => ({
    meta: [
      { title: "Simular — APRIXPAY" },
      {
        name: "description",
        content: "Simule quanto você recebe via Pix e quanto paga no cartão de crédito. APRIXPAY.",
      },
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

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function maskCardNumber(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ");
}
function maskValidade(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return d.slice(0, 2) + "/" + d.slice(2);
}
function maskCVV(v: string) {
  return v.replace(/\D/g, "").slice(0, 4);
}

function SimularPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [valor, setValor] = useState(2500);
  const [parcelas, setParcelas] = useState(12);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");

  const taxa = TAXAS[parcelas] ?? 0.40;
  const totalCartao = useMemo(() => valor * (1 + taxa), [valor, taxa]);
  const valorParcela = useMemo(() => totalCartao / parcelas, [totalCartao, parcelas]);

  const parcelOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const cardValid =
    cardNumber.replace(/\s/g, "").length >= 13 &&
    cardName.trim().length >= 3 &&
    /^\d{2}\/\d{2}$/.test(validade) &&
    cvv.length >= 3;

  function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!cardValid) return;
    navigate({ to: "/confirmar", search: { valor, parcelas } });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-neon/15 blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-4 py-10 md:py-16">
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
            <span className={step === 1 ? "text-neon" : "text-muted-foreground"}>1. Simular</span>
            <span className="text-muted-foreground">—</span>
            <span className={step === 2 ? "text-neon" : "text-muted-foreground"}>2. Cartão</span>
          </div>

          {step === 1 && (
            <div key="step-1" className="animate-in fade-in duration-300">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-neon">Simulador APRIXPAY</p>
                <h1 className="mt-3 font-display text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
                  Quanto você quer receber?
                </h1>
                <p className="mt-4 text-balance text-muted-foreground">
                  Escolha o valor e as parcelas. Veja na hora quanto vai pagar no cartão.
                </p>
              </div>

              <div className="mt-10 rounded-3xl border border-border bg-card p-6 md:p-10">
                {/* Valor */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Valor que você quer receber
                  </label>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl text-muted-foreground">R$</span>
                    <span className="font-display text-6xl font-black text-neon md:text-7xl">
                      {valor.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={15000}
                    step={100}
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value))}
                    className="mt-4 w-full accent-neon"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ 500</span>
                    <span>R$ 15.000</span>
                  </div>
                </div>

                {/* Parcelas */}
                <div className="mt-10">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Parcelas no cartão
                  </label>
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {parcelOptions.map((p) => {
                      const active = parcelas === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setParcelas(p)}
                          className={`relative rounded-xl border px-2 py-3 text-sm font-bold transition-all ${
                            active
                              ? "border-neon bg-neon/10 text-neon ring-1 ring-neon/40"
                              : "border-border bg-background text-muted-foreground hover:border-neon/30 hover:text-foreground"
                          }`}
                        >
                          {p}x
                          {active && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon text-[10px] font-black text-primary-foreground">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resultado */}
                <div className="mt-10 space-y-3">
                  <div
                    onClick={() => setStep(2)}
                    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-background p-5 transition-all hover:border-neon/30 hover:bg-neon/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon transition-colors group-hover:bg-neon group-hover:text-primary-foreground">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Você recebe no Pix</p>
                        <p className="font-display text-2xl font-black">R$ {formatCurrency(valor)}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-neon" />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-neon/30 bg-neon/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-neon text-primary-foreground">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">
                          Limite necessário no cartão
                        </p>
                        <p className="font-display text-2xl font-black text-neon">
                          {parcelas}x de R$ {formatCurrency(valorParcela)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total no cartão</p>
                      <p className="font-display text-sm font-bold text-muted-foreground">
                        R$ {formatCurrency(totalCartao)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-8 flex w-full animate-pulse-ring items-center justify-center gap-2 rounded-full bg-neon py-4 font-display text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:scale-[1.01] hover:brightness-110"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Sujeito a análise de crédito. Valores e parcelas meramente ilustrativos.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div key="step-2" className="animate-in fade-in duration-300">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-10">
                {/* Header com voltar + resumo */}
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-neon/40 hover:text-foreground"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Voltar
                  </button>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total a pagar</p>
                    <p className="font-display text-sm font-bold">
                      R$ {formatCurrency(totalCartao)} <span className="text-neon">em {parcelas}x</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-neon">Dados do cartão</p>
                  <h2 className="mt-2 font-display text-3xl font-black leading-tight tracking-tight md:text-4xl">
                    Quase lá!
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Você vai receber <span className="font-bold text-neon">R$ {formatCurrency(valor)}</span> no Pix.
                  </p>
                </div>

                <form onSubmit={handleConfirmPayment} className="mt-6 space-y-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Número do cartão
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-neon focus:shadow-[0_0_0_3px_oklch(0.88_0.27_145_/_0.15)] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Nome impresso no cartão
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="COMO IMPRESSO NO CARTÃO"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-neon focus:shadow-[0_0_0_3px_oklch(0.88_0.27_145_/_0.15)] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Validade
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={validade}
                        onChange={(e) => setValidade(maskValidade(e.target.value))}
                        placeholder="MM/AA"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-neon focus:shadow-[0_0_0_3px_oklch(0.88_0.27_145_/_0.15)] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        CVV
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cvv}
                        onChange={(e) => setCvv(maskCVV(e.target.value))}
                        placeholder="000"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-neon focus:shadow-[0_0_0_3px_oklch(0.88_0.27_145_/_0.15)] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!cardValid}
                    className="mt-2 flex w-full animate-pulse-ring items-center justify-center gap-2 rounded-full bg-neon py-4 font-display text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    <Lock className="h-4 w-4" /> Confirmar Pagamento
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    🔒 Conexão segura · Seus dados são criptografados.
                  </p>
                </form>
              </div>
            </div>
          )}
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
          <p className="text-[10px] leading-relaxed text-muted-foreground/50 text-center">
            A APRIXPAY é uma plataforma de intermediação financeira digital responsável pela facilitação de operações de liquidez via cartão de crédito. A empresa não realiza empréstimos, financiamentos ou concessão de crédito direto ao consumidor.
          </p>
        </div>
      </footer>
    </div>
  );
}
