import { createFileRoute } from "@tanstack/react-router";

// Mercado Pago webhook (IPN/Webhooks v2).
// MP sends { action, type, data: { id } } for events like "payment.updated".
// We fetch the payment from MP API to confirm status, then upsert by payment_id.

export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
          console.error("[MP webhook] MERCADOPAGO_ACCESS_TOKEN missing");
          return new Response("Server not configured", { status: 500 });
        }

        let body: {
          action?: string;
          type?: string;
          data?: { id?: string | number };
        } = {};
        try {
          body = await request.json();
        } catch {
          // Some MP topics arrive only via query string
        }

        const url = new URL(request.url);
        const topic = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
        const id = body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

        if (!id || (topic && topic !== "payment")) {
          // Ack other topics so MP doesn't retry forever
          return new Response("ignored", { status: 200 });
        }

        // Fetch payment details from MP
        const resp = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!resp.ok) {
          console.error("[MP webhook] fetch payment failed", resp.status);
          return new Response("fetch failed", { status: 200 }); // ack so MP doesn't loop on 4xx data
        }

        const payment = (await resp.json()) as {
          id: number;
          status: string;
          status_detail?: string;
        };

        const dbStatus =
          payment.status === "approved"
            ? "APROVADO"
            : payment.status === "pending" || payment.status === "in_process"
              ? "PENDENTE"
              : payment.status === "rejected"
                ? "RECUSADO"
                : "AGUARDANDO_ANALISE";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("operacoes")
          .update({
            status: dbStatus,
            status_detail: payment.status_detail ?? null,
          })
          .eq("payment_id", String(payment.id));

        if (error) {
          console.error("[MP webhook] db update error:", error);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
