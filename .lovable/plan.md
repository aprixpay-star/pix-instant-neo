
## Auditoria — Credenciais Mercado Pago

Nenhuma alteração de código proposta. Apenas diagnóstico solicitado.

### 1. Onde o backend lê `MERCADOPAGO_ACCESS_TOKEN`
Via `process.env.MERCADOPAGO_ACCESS_TOKEN` dentro de **server functions do TanStack Start** rodando no Worker do Lovable Cloud. O valor é injetado a partir dos **Secrets do Lovable Cloud** (armazenados no backend Supabase gerenciado). Não vem de arquivo `.env` do repositório, não é Edge Function do Supabase, e não está em Environment Variable de build.

### 2. Nome exato da variável no código
`MERCADOPAGO_ACCESS_TOKEN` (lida como `process.env.MERCADOPAGO_ACCESS_TOKEN`).

### 3. Prefixo do token atualmente carregado (TEST- ou APP_USR-)
Não consigo confirmar com certeza. O valor do secret **não é exposto** às minhas ferramentas — `fetch_secrets` mostra apenas o nome (`MERCADOPAGO_ACCESS_TOKEN` está listado como configurado), nunca o conteúdo. O código só descobre o prefixo em tempo de execução (função `credentialMode` em `src/lib/mercadopago.functions.ts`), e esse valor aparece nos logs do servidor como `access_token_mode: "test" | "live" | "unknown"` quando um pagamento é tentado.

### 4. Primeiros 15 / últimos 10 caracteres do token
Impossível exibir. Pelo mesmo motivo acima: o secret é opaco para o agente. Nem parcialmente. Qualquer valor que eu imprimisse aqui seria inventado.

### 5. Confirmar se é o mesmo token da sua aplicação MP
Não posso confirmar. Só você tem acesso ao painel do Mercado Pago; do meu lado só vejo que **existe** um secret com esse nome.

### 6. Arquivo onde o Access Token é utilizado
- `src/lib/mercadopago.functions.ts` (linha 54) — cria o pagamento.
- `src/routes/api/public/webhooks/mercadopago.ts` (linha 11) — webhook consulta status.

### 7. Arquivo onde a Public Key é utilizada
- `src/routes/pagamento.tsx` (linha 7, usada nas linhas 173, 183, 249, 273) — tokeniza o cartão no browser via SDK do MP.
- Origem do valor: `VITE_MERCADOPAGO_PUBLIC_KEY` no `.env` (linha 7 do `.env`).

### 8. Credenciais hardcoded
- `.env` linha 7: `VITE_MERCADOPAGO_PUBLIC_KEY="TEST-4b6d4336-bd2e-4a96-bcc2-1b22a2bc73ba"`. Public Key pode ficar no código (não é secreta), mas está hardcoded no `.env` do repositório.
- **Nenhum Access Token hardcoded** no código-fonte.

### 9. Fallbacks de credenciais
- **Frontend:** o fallback antigo (`TEST-4b6d4336-...` no `pagamento.tsx`) **já foi removido**. Hoje é leitura estrita: `(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ?? "").trim()` e mostra erro se estiver vazio.
- **Backend:** sem fallback — se `MERCADOPAGO_ACCESS_TOKEN` estiver ausente, lança `"MERCADOPAGO_ACCESS_TOKEN não configurado."`.

### 10. Por que o erro `2006: Card Token not found` continua
`2006` do Mercado Pago tem exatamente três causas possíveis, e todas se resumem a **o token do cartão não pertence à conta/ambiente que está cobrando**:

1. **Public Key e Access Token de aplicações/ambientes diferentes** (causa dominante). O cartão foi tokenizado com `TEST-4b6d4336-...` (Public Key de teste da aplicação X). Se o `MERCADOPAGO_ACCESS_TOKEN` no backend for:
   - um `APP_USR-...` (produção) → 2006 garantido;
   - um `TEST-...` de **outra aplicação** MP → 2006 garantido;
   - o próprio Public Key colado por engano no lugar do Access Token → 2006 garantido.
   O código já tem uma checagem que compara os prefixos (`credentialMode`) e aborta com mensagem clara **quando ambos são conhecidos e diferentes**. Se o backend estiver com um valor `"unknown"` (ex.: um Public Key `TEST-` colado como Access Token — mesmo prefixo `TEST-`), a checagem passa e o erro só aparece no MP como 2006.
2. **Token expirado ou reutilizado.** O token do cartão vive ~7 minutos e é de uso único. Ficar tempo demais na tela ou reenviar o mesmo formulário → 2006.
3. **Cartão real com credencial de teste, ou cartão de teste com credencial de produção.** → 2006.

O único jeito de eliminar (1) — que é a hipótese mais provável aqui — é você abrir o painel do Mercado Pago, ir na **mesma aplicação** em **Credenciais de teste**, copiar o **Access Token** de teste (começa com `TEST-`) e salvá-lo em `MERCADOPAGO_ACCESS_TOKEN` via o formulário seguro de secrets. Public Key e Access Token precisam ser lidos lado a lado na mesma tela do MP.

### Próximo passo sugerido
Se você quiser, no próximo turno eu abro o formulário seguro para você **reenviar o `MERCADOPAGO_ACCESS_TOKEN`** (garantindo que é o Access Token de teste da mesma aplicação do `TEST-4b6d4336-...`) e, opcionalmente, adiciono um log server-side extra que imprime os **primeiros 8 / últimos 4 caracteres** do token carregado (sem expor o valor completo) para você poder cruzar visualmente com o painel do MP.
