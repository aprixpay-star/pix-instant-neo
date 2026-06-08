import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ShieldCheck, Lock } from "lucide-react";

type Search = { valor?: number; parcelas?: number };

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    valor: s.valor ? Number(s.valor) : undefined,
    parcelas: s.parcelas ? Number(s.parcelas) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Seus dados — APRIXPAY" },
      { name: "description", content: "Informe seus dados para liberar o Pix." },
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

function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCPF(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i);
  let r = (s * 10) % 11;
  if (r === 10) r = 0;
  if (r !== parseInt(d[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i);
  r = (s * 10) % 11;
  if (r === 10) r = 0;
  return r === parseInt(d[10]);
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function CadastroPage() {
  const { valor: vQuery, parcelas: pQuery } = Route.useSearch();
  const navigate = useNavigate();

  const valor = vQuery ?? 2500;
  const parcelas = pQuery ?? 12;

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [chavePix, setChavePix] = useState("");

  const errors = useMemo(() => {
    const e: Record<string, string | null> = {};
    e.nome = nome.trim().length >= 3 ? null : "Informe seu nome completo.";
    e.cpf = cpf.length === 0 ? "Informe seu CPF." : isValidCPF(cpf) ? null : "CPF inválido.";
    e.telefone = telefone.replace(/\D/g, "").length >= 10 ? null : "Telefone inválido.";
    e.email = isValidEmail(email) ? null : "E-mail inválido.";
    e.chavePix = chavePix.trim().length >= 4 ? null : "Informe sua chave Pix.";
    return e;
  }, [nome, cpf, telefone, email, chavePix]);

  const canSubmit = Object.values(errors).every((v) => v === null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    navigate({
      to: "/confirmar",
      search: {
        valor,
        parcelas,
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ""),
        telefone: telefone.replace(/\D/g, ""),
        email: email.trim(),
        chavePix: chavePix.trim(),
      },
    });
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

        <div className="relative mx-auto max-w-xl px-4 py-10 md:py-16">
          <div className="flex items-center justify-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">1</span>
            <span className="h-px w-8 bg-border" />
            <span className="grid h-6 w-6 place-items-center rounded-full bg-neon text-[10px] font-bold text-primary-foreground">2</span>
            <span className="h-px w-8 bg-border" />
            <span className="grid h-6 w-6 place-items-center rounded-full border border-border text-[10px] font-bold text-muted-foreground">3</span>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-neon">Etapa 2 de 3</p>
            <h1 className="mt-2 font-display text-3xl font-black leading-[0.95] tracking-tight md:text-4xl">
              Seus dados
            </h1>
            <p className="mt-3 text-balance text-sm text-muted-foreground">
              Vamos precisar destas informações para liberar seu Pix de{" "}
              <span className="font-bold text-neon">
                R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>{" "}
              em até <strong className="text-foreground">{parcelas}x</strong>.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8"
          >
            <Field label="Nome completo" error={nome.length > 0 ? errors.nome : null}>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como no seu documento"
                className={inputCls}
                autoComplete="name"
                required
              />
            </Field>

            <Field label="CPF" error={cpf.length > 0 ? errors.cpf : null}>
              <input
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={(e) => setCpf(maskCPF(e.target.value))}
                placeholder="000.000.000-00"
                className={inputCls}
                required
              />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Telefone" error={telefone.length > 0 ? errors.telefone : null}>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={telefone}
                  onChange={(e) => setTelefone(maskPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className={inputCls}
                  autoComplete="tel"
                  required
                />
              </Field>

              <Field label="E-mail" error={email.length > 0 ? errors.email : null}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className={inputCls}
                  autoComplete="email"
                  required
                />
              </Field>
            </div>

            <Field
              label="Chave Pix para recebimento"
              hint="CPF, e-mail, telefone ou chave aleatória"
              error={chavePix.length > 0 ? errors.chavePix : null}
            >
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="Sua chave Pix"
                className={inputCls}
                required
              />
            </Field>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-neon py-4 font-display text-base font-black uppercase tracking-wide text-primary-foreground transition-all hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-neon" /> Conexão segura
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-neon" /> Dados criptografados
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
      </footer>
    </div>
  );
}

const inputCls =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-muted-foreground/70">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
