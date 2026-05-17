import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Zap,
  ShieldCheck,
  Smartphone,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  Wallet,
  Calculator,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "APRIXPAY — Transforme seu limite em dinheiro no Pix" },
      {
        name: "description",
        content:
          "Receba dinheiro hoje no Pix usando o limite do seu cartão. Parcele em até 12x. Rápido, online e sem burocracia.",
      },
      { property: "og:title", content: "APRIXPAY — Limite do cartão vira Pix" },
      {
        property: "og:description",
        content: "Dinheiro no Pix em minutos. Parcele em até 12x no cartão.",
      },
    ],
  }),
});

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon text-primary-foreground font-display font-black">
        A
      </div>
      <span className="font-display text-xl font-bold tracking-tight">
        APRIX<span className="text-neon">PAY</span>
      </span>
    </div>
  );
}

function CTAButton({
  children,
  size = "lg",
  className = "",
}: {
  children: React.ReactNode;
  size?: "lg" | "md";
  className?: string;
}) {
  const sizes = size === "lg" ? "h-14 px-8 text-base" : "h-11 px-5 text-sm";
  return (
    <Link
      to="/simular"
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-neon font-display font-bold uppercase tracking-wide text-primary-foreground transition-all hover:scale-[1.02] hover:brightness-110 glow-neon ${sizes} ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Marquee />
      <Benefits />
      <HowItWorks />
      <Simulator />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#beneficios" className="hover:text-foreground">Benefícios</a>
          <a href="#como-funciona" className="hover:text-foreground">Como funciona</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <CTAButton size="md" className="hidden sm:inline-flex">Simular</CTAButton>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-neon/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-xs font-medium text-neon">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
            </span>
            Liberação em até 5 minutos
          </div>

          <h1 className="text-balance font-display text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
            Transforme seu limite em{" "}
            <span className="relative inline-block">
              <span className="text-neon">dinheiro no Pix</span>
              <svg
                className="absolute -bottom-2 left-0 w-full text-neon"
                viewBox="0 0 300 12"
                fill="none"
              >
                <path d="M2 8 Q 150 0 298 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-8 text-balance text-lg text-muted-foreground md:text-xl">
            Receba hoje mesmo e parcele em até{" "}
            <span className="font-semibold text-foreground">12x no cartão</span>.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <CTAButton>Simular agora</CTAButton>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-neon" /> Sem consulta ao SPC
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-neon" /> 100% online
              </span>
            </div>
          </div>
        </div>

        <PhoneMock />
      </div>
    </section>
  );
}

function PhoneMock() {
  return (
    <div className="relative mx-auto mt-16 max-w-sm">
      <div className="absolute inset-x-8 bottom-0 h-40 rounded-full bg-neon/30 blur-3xl" />
      <div className="relative rounded-[2.5rem] border border-border bg-card p-3 shadow-2xl">
        <div className="overflow-hidden rounded-[2rem] bg-background p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>9:41</span>
            <Logo />
          </div>

          <div className="mt-8 space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Você recebe</p>
            <p className="font-display text-5xl font-black tracking-tight">
              R$ <span className="text-neon">2.500</span>
              <span className="text-xl text-muted-foreground">,00</span>
            </p>
            <p className="text-sm text-muted-foreground">em até 5 minutos no seu Pix</p>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Parcelas</span>
              <span className="font-semibold">12x de R$ 249,90</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full w-3/4 rounded-full bg-neon" />
            </div>
          </div>

          <button className="mt-6 flex w-full animate-pulse-ring items-center justify-center gap-2 rounded-full bg-neon py-4 font-display font-bold uppercase text-primary-foreground">
            <Send className="h-4 w-4" /> Receber no Pix
          </button>
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const items = ["Sem burocracia", "100% online", "Aprovação na hora", "Pix em minutos", "Parcele em 12x", "Seguro"];
  const loop = [...items, ...items, ...items];
  return (
    <div className="border-y border-border bg-card/40 py-5 overflow-hidden">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {loop.map((t, i) => (
          <span key={i} className="flex items-center gap-3 font-display text-lg font-bold uppercase text-muted-foreground">
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-neon" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Benefits() {
  const items = [
    { icon: Zap, title: "Rápido", desc: "Dinheiro no Pix em até 5 minutos após aprovação." },
    { icon: Smartphone, title: "Online", desc: "Tudo pelo celular. Sem fila, sem papel, sem agência." },
    { icon: ShieldCheck, title: "Sem burocracia", desc: "Não consultamos SPC nem Serasa. Só precisa do cartão." },
    { icon: Clock, title: "Aprovação rápida", desc: "Análise automática em segundos. Liberação imediata." },
  ];
  return (
    <section id="beneficios" className="mx-auto max-w-6xl px-4 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-neon">Por que APRIXPAY</p>
        <h2 className="mt-3 font-display text-4xl font-black md:text-5xl text-balance">
          O jeito mais rápido de virar limite em dinheiro
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-neon/50"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-neon/10 text-neon transition-colors group-hover:bg-neon group-hover:text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Calculator, title: "Simule", desc: "Informe o valor e veja na hora quanto recebe e quanto vai pagar." },
    { icon: Wallet, title: "Confirme com seu cartão", desc: "Tudo online, em poucos cliques. Sem enviar documentos." },
    { icon: Send, title: "Receba no Pix", desc: "Cai na sua conta em até 5 minutos. Parcele em até 12x no cartão." },
  ];
  return (
    <section id="como-funciona" className="border-y border-border bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-neon">Como funciona</p>
          <h2 className="mt-3 font-display text-4xl font-black md:text-5xl text-balance">
            3 passos. Menos de 5 minutos.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-background p-8">
              <div className="absolute -top-4 left-6 rounded-full bg-neon px-3 py-1 font-display text-xs font-black text-primary-foreground">
                PASSO {i + 1}
              </div>
              <s.icon className="h-10 w-10 text-neon" />
              <h3 className="mt-6 font-display text-2xl font-bold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Simulator() {
  const [valor, setValor] = useState(2500);
  const parcela = (valor * 1.2) / 12;
  return (
    <section id="simular" className="mx-auto max-w-4xl px-4 py-24">
      <div className="rounded-3xl border border-neon/40 bg-card p-6 md:p-12 glow-neon">
        <p className="text-sm font-bold uppercase tracking-widest text-neon">Simulador</p>
        <h2 className="mt-3 font-display text-3xl font-black md:text-4xl">
          Quanto você quer receber hoje?
        </h2>

        <div className="mt-8">
          <div className="flex items-baseline gap-2">
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
            className="mt-6 w-full accent-neon"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ 500</span>
            <span>R$ 15.000</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-background p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Você recebe</p>
            <p className="mt-1 font-display text-2xl font-black md:text-3xl">
              R$ {valor.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="rounded-2xl bg-background p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">12x de</p>
            <p className="mt-1 font-display text-2xl font-black text-neon md:text-3xl">
              R$ {parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <CTAButton className="mt-8 w-full">Continuar simulação</CTAButton>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sujeito a análise. Valores e parcelas meramente ilustrativos.
        </p>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Como funciona transformar limite em dinheiro?",
    a: "Você faz uma compra parcelada no seu cartão de crédito pela APRIXPAY e nós depositamos o valor equivalente direto no seu Pix em minutos.",
  },
  {
    q: "Em quanto tempo o dinheiro cai?",
    a: "Após a aprovação, o Pix é enviado em até 5 minutos para a conta de sua escolha.",
  },
  {
    q: "Preciso ter nome limpo?",
    a: "Não consultamos SPC nem Serasa. O que vale é o limite disponível no seu cartão de crédito.",
  },
  {
    q: "Em quantas vezes posso parcelar?",
    a: "Você pode parcelar em até 12x diretamente na fatura do seu cartão.",
  },
  {
    q: "É seguro?",
    a: "Sim. Operamos com criptografia de ponta e parceiros financeiros regulamentados. Seus dados nunca são compartilhados.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-y border-border bg-card/30">
      <div className="mx-auto max-w-3xl px-4 py-24">
        <p className="text-sm font-bold uppercase tracking-widest text-neon">FAQ</p>
        <h2 className="mt-3 font-display text-4xl font-black md:text-5xl">Perguntas frequentes</h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl border border-border bg-background">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-display text-lg font-bold">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-neon transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && <p className="px-5 pb-5 text-muted-foreground">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/25 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 py-28 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-neon/40 bg-background/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neon">
          Oferta por tempo limitado
        </div>
        <h2 className="font-display text-5xl font-black leading-[0.95] md:text-7xl text-balance">
          Seu Pix está a <span className="text-neon">um clique</span> de distância
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Mais de 200 mil brasileiros já desbloquearam o limite do cartão. Falta você.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton>Simular agora</CTAButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 md:flex-row md:items-center">
        <Logo />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} APRIXPAY. Todos os direitos reservados. Crédito sujeito a análise.
        </p>
      </div>
    </footer>
  );
}
