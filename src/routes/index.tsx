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
  Star,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import heroPerson from "@/assets/hero-person.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "APRIXPAY — Transforme seu crédito em saldo no Pix" },
      {
        name: "description",
        content:
          "Receba dinheiro hoje no Pix usando o limite do seu cartão. Parcele em até 12x. Rápido, online e sem burocracia.",
      },
      { property: "og:title", content: "APRIXPAY — Crédito do cartão vira Pix" },
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
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-primary-foreground font-display font-black shadow-soft">
        A
      </div>
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        APRIX<span className="text-brand">PAY</span>
      </span>
    </div>
  );
}

function CTAButton({
  children,
  size = "lg",
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  size?: "lg" | "md";
  className?: string;
  variant?: "primary" | "ghost";
}) {
  const sizes = size === "lg" ? "h-14 px-8 text-base" : "h-11 px-5 text-sm";
  const styles =
    variant === "primary"
      ? "bg-brand-gradient text-primary-foreground glow-brand hover:brightness-110"
      : "bg-white text-foreground border border-border hover:border-brand/40 hover:text-brand";
  return (
    <Link
      to="/simular"
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-display font-bold tracking-tight transition-all hover:scale-[1.02] ${styles} ${sizes} ${className}`}
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
      <SocialProof />
      <Marquee />
      <Benefits />
      <HowItWorks />
      <Simulator />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-lg">
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
      <div className="absolute inset-0 bg-grid-soft opacity-70" />
      <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full bg-brand-soft blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-12 md:pt-20 lg:grid-cols-2 lg:gap-16">
        {/* Left column */}
        <div className="text-center lg:text-left">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-xs font-medium text-brand shadow-soft lg:mx-0">
            <Sparkles className="h-3.5 w-3.5" />
            Transações instantâneas via Pix
          </div>

          <h1 className="mt-6 text-balance font-display text-4xl font-black leading-[1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[64px]">
            Transforme seu crédito em{" "}
            <span className="relative inline-block">
              <span className="bg-brand-gradient bg-clip-text text-transparent">saldo no Pix</span>
              <svg
                className="absolute -bottom-2 left-0 w-full text-brand/60"
                viewBox="0 0 300 12"
                fill="none"
              >
                <path d="M2 8 Q 150 0 298 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-balance text-lg text-muted-foreground md:text-xl">
            Receba hoje mesmo no seu Pix e parcele em até{" "}
            <span className="font-semibold text-foreground">12x no cartão</span>. Simples, rápido e sem burocracia.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <CTAButton>Simular agora</CTAButton>
            <CTAButton variant="ghost">Como funciona</CTAButton>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> Sem consulta ao SPC
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> 100% online
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> Pix em minutos
            </span>
          </div>
        </div>

        {/* Right column - image + floating cards */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-soft shadow-float">
            <img
              src={heroPerson}
              alt="Cliente satisfeita usando o aplicativo APRIXPAY no celular"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent" />
          </div>

          {/* Floating card - Pix received */}
          <div className="absolute -left-4 top-8 flex items-center gap-3 rounded-2xl border border-border bg-white p-3 pr-5 shadow-float animate-float sm:-left-8">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-success/15 text-success">
              <Check className="h-5 w-5" strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Recebido via Pix
              </p>
              <p className="font-display text-lg font-black text-foreground">+ R$ 1.250,00</p>
            </div>
          </div>

          {/* Floating card - approval */}
          <div className="absolute -right-3 bottom-16 flex items-center gap-3 rounded-2xl border border-border bg-white p-3 pr-5 shadow-float animate-float-slower sm:-right-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Aprovado em
              </p>
              <p className="font-display text-lg font-black text-foreground">12 segundos</p>
            </div>
          </div>

          {/* Floating card - rating */}
          <div className="absolute -bottom-4 left-6 flex items-center gap-3 rounded-2xl border border-border bg-white p-3 pr-5 shadow-float animate-float">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-brand to-brand/60" />
              <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-success/80 to-brand/60" />
              <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-brand/70 to-brand" />
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-[11px] font-semibold text-foreground">4.9 de 200 mil clientes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const stats = [
    { value: "+200mil", label: "Clientes atendidos" },
    { value: "R$ 1,2 bi", label: "Processados via Pix" },
    { value: "12s", label: "Aprovação média" },
    { value: "4.9★", label: "Avaliação dos clientes" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-3xl border border-border bg-white p-6 shadow-soft md:p-10">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-black text-foreground md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Sem burocracia", "100% online", "Aprovação na hora", "Pix em minutos", "Parcele em 12x", "Seguro"];
  const loop = [...items, ...items, ...items];
  return (
    <div className="border-y border-border bg-brand-soft/40 py-5 overflow-hidden">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {loop.map((t, i) => (
          <span key={i} className="flex items-center gap-3 font-display text-base font-bold text-brand/80">
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
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
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Por que APRIXPAY</p>
        <h2 className="mt-3 font-display text-4xl font-black md:text-5xl text-balance text-foreground">
          O jeito mais humano de virar limite em dinheiro
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-float"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand-gradient group-hover:text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
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
    <section id="como-funciona" className="border-y border-border bg-brand-soft/30">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">Como funciona</p>
          <h2 className="mt-3 font-display text-4xl font-black md:text-5xl text-balance text-foreground">
            3 passos. Menos de 5 minutos.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-white p-8 shadow-soft">
              <div className="absolute -top-4 left-6 rounded-full bg-brand-gradient px-3 py-1 font-display text-xs font-black text-primary-foreground shadow-soft">
                PASSO {i + 1}
              </div>
              <s.icon className="h-10 w-10 text-brand" />
              <h3 className="mt-6 font-display text-2xl font-bold text-foreground">{s.title}</h3>
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
      <div className="rounded-3xl border border-border bg-white p-6 shadow-float md:p-12">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Simulador</p>
        <h2 className="mt-3 font-display text-3xl font-black md:text-4xl text-foreground">
          Quanto você quer receber hoje?
        </h2>

        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-muted-foreground">R$</span>
            <span className="font-display text-6xl font-black text-brand md:text-7xl">
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
            className="mt-6 w-full accent-[color:var(--brand)]"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ 500</span>
            <span>R$ 15.000</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-brand-soft/60 p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Você recebe</p>
            <p className="mt-1 font-display text-2xl font-black text-foreground md:text-3xl">
              R$ {valor.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="rounded-2xl bg-brand-soft/60 p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">12x de</p>
            <p className="mt-1 font-display text-2xl font-black text-brand md:text-3xl">
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

function Testimonials() {
  const items = [
    {
      name: "Mariana S.",
      role: "Empreendedora",
      text: "Precisei repor estoque num sábado. Em 4 minutos o Pix caiu. Recomendo demais!",
    },
    {
      name: "Rafael P.",
      role: "Autônomo",
      text: "Parcelei em 12x no cartão e recebi na hora. Muito mais fácil do que qualquer banco.",
    },
    {
      name: "Camila R.",
      role: "Freelancer",
      text: "Atendimento humano de verdade. Me senti segura em cada passo do processo.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">Prova social</p>
        <h2 className="mt-3 font-display text-4xl font-black md:text-5xl text-foreground">
          Quem usa, recomenda.
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((t) => (
          <div key={t.name} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="mt-4 text-foreground">"{t.text}"</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient font-display text-sm font-black text-primary-foreground">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Como funciona transformar crédito em saldo?",
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
    <section id="faq" className="border-y border-border bg-brand-soft/30">
      <div className="mx-auto max-w-3xl px-4 py-24">
        <p className="text-sm font-bold uppercase tracking-widest text-brand">FAQ</p>
        <h2 className="mt-3 font-display text-4xl font-black md:text-5xl text-foreground">Perguntas frequentes</h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl border border-border bg-white shadow-soft">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-display text-lg font-bold text-foreground">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      <div className="mx-auto max-w-5xl px-4 py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient p-10 text-center shadow-float md:p-16">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
              <TrendingUp className="h-3.5 w-3.5" />
              Oferta por tempo limitado
            </div>
            <h2 className="font-display text-4xl font-black leading-[1] text-white md:text-6xl text-balance">
              Seu Pix está a <span className="underline decoration-white/50 underline-offset-4">um clique</span> de distância
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
              Mais de 200 mil brasileiros já desbloquearam o limite do cartão. Falta você.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/simular"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 font-display text-base font-bold text-brand shadow-float transition-all hover:scale-[1.02]"
              >
                Simular agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 md:flex-row md:items-center">
        <Logo />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} APRIXPAY. Todos os direitos reservados. Crédito sujeito a análise.
        </p>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6">
        <p className="text-[10px] leading-relaxed text-muted-foreground/70 text-center">
          A APRIXPAY é uma plataforma de intermediação financeira digital responsável pela facilitação de operações de liquidez via cartão de crédito. A empresa não realiza empréstimos, financiamentos ou concessão de crédito direto ao consumidor.
        </p>
      </div>
    </footer>
  );
}
