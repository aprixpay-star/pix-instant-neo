import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

type ProcessarPagamentoInput = {
  token: string;
  payment_method_id: string;
  issuer_id?: string;
  public_key_mode?: "test" | "live" | "unknown";
  installments: number;
  // Cliente
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  chave_pix: string;
  // Valores
  valor_recebido: number;
  valor_total_cartao: number;
  parcelas: number;
  user_agent: string | null;
};

function validate(d: ProcessarPagamentoInput) {
  if (!d.token || typeof d.token !== "string") throw new Error("Token do cartão inválido.");
  if (!d.payment_method_id) throw new Error("Método de pagamento inválido.");
  if (!Number.isFinite(d.valor_total_cartao) || d.valor_total_cartao <= 0) throw new Error("Valor inválido.");
  if (!Number.isFinite(d.valor_recebido) || d.valor_recebido <= 0) throw new Error("Valor inválido.");
  if (!Number.isInteger(d.installments) || d.installments < 1 || d.installments > 12) throw new Error("Parcelas inválidas.");
  if (!/^\d{11}$/.test(d.cpf)) throw new Error("CPF inválido.");
  if (!d.nome || d.nome.trim().length < 3) throw new Error("Nome inválido.");
  if (!/.+@.+\..+/.test(d.email)) throw new Error("E-mail inválido.");
  if (!d.telefone || d.telefone.replace(/\D/g, "").length < 10) throw new Error("Telefone inválido.");
  if (!d.chave_pix || d.chave_pix.trim().length < 3) throw new Error("Chave Pix inválida.");
  return d;
}

function credentialMode(value: string): "test" | "live" | "unknown" {
  if (value.startsWith("TEST-")) return "test";
  if (value.startsWith("APP_USR-")) return "live";
  return "unknown";
}

function readableMercadoPagoError(message: string) {
  // Preserve the exact API message; only remap fully opaque cases.
  if (message === "internal_error") {
    return "internal_error — verifique se a Public Key e o Access Token são da mesma conta e do mesmo ambiente (teste/live).";
  }
  return message;
}

export const processarPagamento = createServerFn({ method: "POST" })
  .inputValidator((data: ProcessarPagamentoInput) => validate(data))
  .handler(async ({ data }) => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");

    const accessTokenMode = credentialMode(accessToken);
    if (
      data.public_key_mode &&
      data.public_key_mode !== "unknown" &&
      accessTokenMode !== "unknown" &&
      data.public_key_mode !== accessTokenMode
    ) {
      console.error("[MP] credential environment mismatch", {
        public_key_mode: data.public_key_mode,
        access_token_mode: accessTokenMode,
      });
      throw new Error(
        "Credenciais do Mercado Pago em ambientes diferentes: use Public Key e Access Token da mesma conta e do mesmo ambiente de teste/live.",
      );
    }

    const ip = getRequestIP({ xForwardedFor: true }) ?? null;

    // Round to 2 decimals for MP
    const amount = Math.round(data.valor_total_cartao * 100) / 100;

    const idempotencyKey = `aprixpay-${data.cpf}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const paymentBody: Record<string, unknown> = {
      transaction_amount: amount,
      token: data.token,
      description: `APRIXPAY - Pix R$ ${data.valor_recebido.toFixed(2)}`,
      installments: data.installments,
      payment_method_id: data.payment_method_id,
      statement_descriptor: "APRIXPAY",
      payer: {
        email: data.email,
        first_name: data.nome.split(" ")[0],
        last_name: data.nome.split(" ").slice(1).join(" ") || data.nome.split(" ")[0],
        identification: { type: "CPF", number: data.cpf },
      },
    };

    if (data.issuer_id) {
      const numericIssuerId = Number(data.issuer_id);
      paymentBody.issuer_id = Number.isFinite(numericIssuerId) ? numericIssuerId : data.issuer_id;
    }

    // ===== Audit log: payment creation payload (no sensitive data) =====
    console.info("[MP] creating payment", {
      token_present: Boolean(data.token),
      token_len: data.token?.length ?? 0,
      token_preview: data.token ? `${data.token.slice(0, 4)}…${data.token.slice(-4)}` : null,
      payment_method_id: data.payment_method_id,
      issuer_id: paymentBody.issuer_id ?? null,
      installments: data.installments,
      transaction_amount: amount,
      description: paymentBody.description,
      payer_email: data.email,
      payer_identification_type: "CPF",
      payer_identification_number_masked: `${data.cpf.slice(0, 3)}.***.***-${data.cpf.slice(-2)}`,
      access_token_mode: accessTokenMode,
      public_key_mode: data.public_key_mode ?? "unknown",
      idempotency_key: idempotencyKey,
    });

    const mpResp = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(paymentBody),
    });

    const rawText = await mpResp.text();
    let mpData: {
      id?: number;
      status?: string;
      status_detail?: string;
      message?: string;
      error?: string;
      cause?: Array<{ code?: string | number; description?: string }>;
    } = {};
    try {
      mpData = rawText ? JSON.parse(rawText) : {};
    } catch {
      console.error("[MP] non-JSON response body", { http_status: mpResp.status, raw: rawText.slice(0, 500) });
    }

    // ===== Audit log: full MP response (safe fields only) =====
    console.info("[MP] payment response", {
      http_status: mpResp.status,
      http_ok: mpResp.ok,
      body: {
        id: mpData.id ?? null,
        status: mpData.status ?? null,
        status_detail: mpData.status_detail ?? null,
        message: mpData.message ?? null,
        error: mpData.error ?? null,
        cause: mpData.cause ?? null,
      },
    });

    if (!mpResp.ok) {
      const causeDescriptions = (mpData?.cause ?? [])
        .map((c) => [c.code, c.description].filter(Boolean).join(": "))
        .filter(Boolean)
        .join(" | ");
      const reason =
        causeDescriptions ||
        mpData?.message ||
        mpData?.error ||
        `HTTP ${mpResp.status}`;
      console.error("[MP] payment error", {
        http_status: mpResp.status,
        message: mpData?.message,
        error: mpData?.error,
        cause: mpData?.cause,
        request_context: {
          installments: data.installments,
          payment_method_id: data.payment_method_id,
          issuer_id: data.issuer_id ?? null,
          transaction_amount: amount,
          access_token_mode: accessTokenMode,
          public_key_mode: data.public_key_mode ?? "unknown",
        },
      });
      throw new Error(readableMercadoPagoError(reason));
    }

    const status = mpData.status ?? "unknown";
    const statusDetail = mpData.status_detail ?? null;
    const paymentId = mpData.id ? String(mpData.id) : null;

    // Persist to clientes + operacoes (admin client bypasses RLS)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const dbStatus: "APROVADO" | "PENDENTE" | "RECUSADO" | "AGUARDANDO_ANALISE" =
      status === "approved"
        ? "APROVADO"
        : status === "pending" || status === "in_process"
          ? "PENDENTE"
          : status === "rejected"
            ? "RECUSADO"
            : "AGUARDANDO_ANALISE";

    try {
      // upsert cliente by cpf
      const { data: clienteRow, error: clienteErr } = await supabaseAdmin
        .from("clientes")
        .upsert(
          {
            nome: data.nome,
            cpf: data.cpf,
            telefone: data.telefone,
            email: data.email,
            chave_pix: data.chave_pix,
          },
          { onConflict: "cpf" },
        )
        .select("id")
        .single();

      if (clienteErr || !clienteRow) {
        console.error("[MP] cliente upsert error:", clienteErr);
      } else {
        const { error: opErr } = await supabaseAdmin.from("operacoes").insert({
          cliente_id: clienteRow.id,
          valor_solicitado: data.valor_recebido,
          valor_cobrado: data.valor_total_cartao,
          parcelas: data.parcelas,
          payment_id: paymentId,
          status: dbStatus,
          status_detail: statusDetail,
          chave_pix: data.chave_pix,
          user_agent: data.user_agent,
          ip_address: ip,
        });
        if (opErr) console.error("[MP] operacao insert error:", opErr);
      }
    } catch (persistErr) {
      console.error("[MP] persist error:", persistErr);
    }

    return {
      approved: status === "approved",
      status,
      status_detail: statusDetail,
      payment_id: paymentId,
    };
  });
