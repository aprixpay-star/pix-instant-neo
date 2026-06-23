import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowRight, ChevronLeft, Wallet, CreditCard, Check } from "lucide-react";

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

function SimularPage() {
  const navigate = useNavigate();
  const step = 1 as const;
  const [valor, setValor] = useState(2500);
  const [parcelas, setParcelas] = useState(12);
  const [editandoValor, setEditandoValor] = useState(false);
  const [rawValor, setRawValor] = useState("");

  const taxa = TAXAS[parcelas] ?? 0.40;
  const totalCartao = useMemo(() => valor * (1 + taxa), [valor, taxa]);
  const valorParcela = useMemo(() => totalCartao / parcelas, [totalCartao, parcelas]);

  const parcelOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  function goToPayment() {
    navigate({ to: "/pagamento", search: { valor, parcelas } });
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
                    {editandoValor ? (
                      <input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        value={rawValor}
                        onChange={(e) => setRawValor(e.target.value.replace(/\D/g, ""))}
                        onBlur={() => {
                          const numero = Number(rawValor) || 0;
                          const arredondado = Math.round(Math.max(10, Math.min(15000, numero)) / 10) * 10;
                          setValor(arredondado);
                          setEditandoValor(false);
                          setRawValor("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const numero = Number(rawValor) || 0;
                            const arredondado = Math.round(Math.max(10, Math.min(15000, numero)) / 10) * 10;
                            setValor(arredondado);
                            setEditandoValor(false);
                            setRawValor("");
                          }
                        }}
                        className="w-48 rounded-xl border border-neon bg-card px-2 py-1 font-display text-6xl font-black text-neon focus:outline-none focus:ring-2 focus:ring-neon md:w-64 md:text-7xl"
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setRawValor(String(valor));
                          setEditandoValor(true);
                        }}
                        className="cursor-pointer rounded-xl font-display text-6xl font-black text-neon transition-colors hover:bg-neon/10 md:text-7xl"
                        role="button"
                        aria-label="Editar valor"
                        title="Clique para editar o valor"
                      >
                        {valor.toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={15000}
                    step={10}
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value))}
                    className="mt-4 w-full accent-neon"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ 10</span>
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
                    onClick={goToPayment}
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
                  onClick={goToPayment}
                  className="mt-8 flex w-full animate-pulse-ring items-center justify-center gap-2 rounded-full bg-neon py-4 font-display text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:scale-[1.01] hover:brightness-110"
                >
                  Ir para pagamento
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Sujeito a análise de crédito. Valores e parcelas meramente ilustrativos.
                </p>
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
