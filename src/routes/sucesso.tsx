import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";

type Search = { valor?: number; parcelas?: number; payment_id?: string };

export const Route = createFileRoute("/sucesso")({
  component: SucessoPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    valor: s.valor ? Number(s.valor) : undefined,
    parcelas: s.parcelas ? Number(s.parcelas) : undefined,
    payment_id: typeof s.payment_id === "string" ? s.payment_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Operação aprovada — APRIXPAY" }] }),
});

function SucessoPage() {
  const { valor = 0, parcelas, payment_id } = Route.useSearch();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative w-full max-w-md">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-neon text-primary-foreground shadow-[0_0_60px_oklch(0.88_0.27_145_/_0.5)]">
          <Check className="h-10 w-10" strokeWidth={3} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-black md:text-4xl">Pagamento aprovado!</h1>
        <p className="mt-3 text-muted-foreground">
          Sua operação foi confirmada com sucesso. Seu Pix de{" "}
          <span className="font-bold text-neon">R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>{" "}
          será liberado em instantes.
        </p>
        {parcelas && (
          <p className="mt-1 text-sm text-muted-foreground">
            Parcelado em <span className="font-bold text-foreground">{parcelas}x</span> no cartão.
          </p>
        )}
        {payment_id && (
          <p className="mt-4 text-[11px] text-muted-foreground">
            ID da transação: <span className="font-mono">{payment_id}</span>
          </p>
        )}
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 font-display font-bold uppercase tracking-wide text-primary-foreground hover:brightness-110"
        >
          Voltar ao início <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
