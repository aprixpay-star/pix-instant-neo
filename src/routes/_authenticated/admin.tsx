import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, RefreshCw, ShieldAlert } from "lucide-react";

type OperacaoStatus =
  | "AGUARDANDO_ANALISE"
  | "PIX_ENVIADO"
  | "FINALIZADO"
  | "CANCELADO"
  | "APROVADO"
  | "PENDENTE"
  | "RECUSADO";

const STATUS_LABEL: Record<OperacaoStatus, string> = {
  AGUARDANDO_ANALISE: "Aguardando análise",
  PIX_ENVIADO: "PIX enviado",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
  APROVADO: "Aprovado (MP)",
  PENDENTE: "Pendente (MP)",
  RECUSADO: "Recusado (MP)",
};

const STATUS_MANUAL: OperacaoStatus[] = [
  "AGUARDANDO_ANALISE",
  "PIX_ENVIADO",
  "FINALIZADO",
  "CANCELADO",
];

const STATUS_COLOR: Record<OperacaoStatus, string> = {
  AGUARDANDO_ANALISE: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  PIX_ENVIADO: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  FINALIZADO: "bg-neon/20 text-neon border-neon/40",
  CANCELADO: "bg-red-500/15 text-red-300 border-red-500/30",
  APROVADO: "bg-neon/20 text-neon border-neon/40",
  PENDENTE: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  RECUSADO: "bg-red-500/15 text-red-300 border-red-500/30",
};

type Row = {
  id: string;
  created_at: string;
  valor_solicitado: number;
  valor_cobrado: number;
  parcelas: number;
  payment_id: string | null;
  status: OperacaoStatus;
  status_detail: string | null;
  chave_pix: string;
  ip_address: string | null;
  user_agent: string | null;
  clientes: {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
  } | null;
};

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Painel administrativo — APRIXPAY" }] }),
});

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(s: string) {
  return new Date(s).toLocaleString("pt-BR");
}

function AdminPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    setUserEmail(userData.user?.email ?? null);

    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user?.id ?? "");
    const admin = (roleRows ?? []).some((r) => r.role === "admin");
    setIsAdmin(admin);
    if (!admin) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("operacoes")
      .select(
        "id, created_at, valor_solicitado, valor_cobrado, parcelas, payment_id, status, status_detail, chave_pix, ip_address, user_agent, clientes(nome, cpf, telefone, email)",
      )
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: OperacaoStatus) {
    setSavingId(id);
    const { error } = await supabase
      .from("operacoes")
      .update({ status })
      .eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? prev);
    }
    setSavingId(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-neon" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-yellow-400" />
          <h1 className="mt-4 font-display text-xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta ({userEmail}) não tem permissão de administrador. Peça a um administrador para liberar seu acesso.
          </p>
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-display text-lg font-bold">
              APRIX<span className="text-neon">PAY</span> · Painel
            </h1>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!rows?.length ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhuma operação registrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valores</th>
                  <th className="px-4 py-3">Parc.</th>
                  <th className="px-4 py-3">Chave Pix</th>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 align-top">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(r.created_at)}
                      {r.ip_address && (
                        <div className="mt-1 text-[10px] text-muted-foreground/70">IP {r.ip_address}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.clientes?.nome ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.clientes?.cpf}</div>
                      <div className="text-xs text-muted-foreground">{r.clientes?.email}</div>
                      <div className="text-xs text-muted-foreground">{r.clientes?.telefone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-neon font-bold">R$ {formatBRL(Number(r.valor_solicitado))}</div>
                      <div className="text-xs text-muted-foreground">
                        cartão R$ {formatBRL(Number(r.valor_cobrado))}
                      </div>
                    </td>
                    <td className="px-4 py-3">{r.parcelas}x</td>
                    <td className="px-4 py-3 text-xs">{r.chave_pix}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                      {r.payment_id ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`mb-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLOR[r.status]}`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                      <select
                        disabled={savingId === r.id}
                        value={STATUS_MANUAL.includes(r.status) ? r.status : ""}
                        onChange={(e) => updateStatus(r.id, e.target.value as OperacaoStatus)}
                        className="block w-full rounded-lg border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="" disabled>
                          Alterar status…
                        </option>
                        {STATUS_MANUAL.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
