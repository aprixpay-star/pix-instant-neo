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
  if (message === "internal_error" || message.includes("internal_error")) {
    return "O Mercado Pago retornou uma falha interna. Confira se a Public Key e o Access Token são da mesma conta e do mesmo ambiente de teste/live.";
  }

  if (message.includes("security_code_length")) {
    return "CVV inválido para a bandeira do cartão informado.";
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

    const mpResp = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(paymentBody),
    });

    const mpData = (await mpResp.json()) as {
      id?: number;
      status?: string;
      status_detail?: string;
      message?: string;
      error?: string;
      cause?: Array<{ description?: string }>;
    };

    if (!mpResp.ok) {
      const reason =
        mpData?.cause?.[0]?.description ||
        mpData?.message ||
        mpData?.error ||
        "Falha ao processar pagamento.";
      console.error("[MP] payment error:", mpResp.status, {
        message: mpData?.message,
        error: mpData?.error,
        cause: mpData?.cause,
        request_context: {
          installments: data.installments,
          payment_method_id: data.payment_method_id,
          issuer_id: data.issuer_id ?? null,
          access_token_mode: accessTokenMode,
          public_key_mode: data.public_key_mode ?? "unknown",
        },
      });
      throw new Error(readableMercadoPagoError(reason));
    }

    const status = mpData.status ?? "unknown";
    const statusDetail = mpData.status_detail ?? null;
    const paymentId = mpData.id ? String(mpData.id) : null;

    // Persist with admin client (bypass RLS for full insert including non-anon fields)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const dbStatus = status === "approved" ? "APROVADO" : status.toUpperCase();

    const { error: dbError } = await supabaseAdmin.from("operacoes_vendas").insert({
      nome: data.nome,
      cpf: data.cpf,
      telefone: data.telefone,
      email: data.email,
      chave_pix: data.chave_pix,
      valor_venda: data.valor_recebido,
      valor_total_cartao: data.valor_total_cartao,
      parcelas: data.parcelas,
      aceite_termos: true,
      payment_id: paymentId,
      status: dbStatus,
      status_detail: statusDetail,
      user_agent: data.user_agent,
      ip_address: ip,
    });

    if (dbError) {
      console.error("[MP] db insert error:", dbError);
    }

    return {
      approved: status === "approved",
      status,
      status_detail: statusDetail,
      payment_id: paymentId,
    };
  });
