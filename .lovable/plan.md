## Erro: `2006: Card Token not found`

Esse erro do Mercado Pago significa **quase sempre** uma coisa: o **token do cartão foi criado com uma Public Key** e o **pagamento foi enviado com um Access Token de outra conta ou de outro ambiente** (teste vs produção). O token só existe na conta que o gerou — quando o backend tenta usá-lo com credenciais diferentes, o MP responde "token não encontrado".

Hoje o projeto usa:
- **Frontend (tokeniza o cartão):** `VITE_MERCADOPAGO_PUBLIC_KEY` no `.env` (com fallback `TEST-4b6d4336-...` fixo no código).
- **Backend (cobra):** secret `MERCADOPAGO_ACCESS_TOKEN`.

Se esses dois não forem do **mesmo par**, dá 2006.

---

## O que você precisa fazer (passo a passo)

### 1. Pegar o par correto de credenciais no Mercado Pago
1. Entre em https://www.mercadopago.com.br/developers/panel/app
2. Abra sua aplicação.
3. Vá em **Credenciais de teste** (para testar) **ou** **Credenciais de produção** (para cobrar de verdade) — **nunca misture os dois**.
4. Na **mesma tela**, copie:
   - **Public Key** (começa com `TEST-` ou `APP_USR-`)
   - **Access Token** (começa com `TEST-` ou `APP_USR-`)

Regra: ou os dois começam com `TEST-`, ou os dois começam com `APP_USR-`. Nunca um de cada.

### 2. Atualizar as duas credenciais no projeto
- **`VITE_MERCADOPAGO_PUBLIC_KEY`** → atualizar no `.env` com a Public Key copiada.
- **`MERCADOPAGO_ACCESS_TOKEN`** → atualizar via secret (abro o formulário seguro para você colar).

### 3. Remover o fallback fixo da Public Key
Em `src/routes/pagamento.tsx` existe um fallback hardcoded:
```ts
const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "TEST-4b6d4336-...";
```
Esse fallback é perigoso: se a env var faltar em qualquer build, o frontend volta a tokenizar numa conta de teste aleatória do Lovable e o 2006 volta. Vou trocar por leitura estrita e mostrar um erro claro na tela quando a chave não estiver configurada.

### 4. Validar
- Testar um pagamento com cartão de teste do MP (ex.: `5031 4332 1540 6351`, CVV `123`, validade futura, CPF `12345678909`).
- Se aparecer 2006 de novo, comparar no console o `public_key_mode` logado (`test`/`live`) com o prefixo do Access Token no backend — precisam bater.

### 5. Cuidados adicionais
- **Token expira em ~7 minutos** e é **uso único**. Se você ficar muito tempo na tela antes de enviar, ou tentar reenviar o mesmo formulário, também dá 2006. Nesse caso é só recarregar a tela e refazer.
- Cartão de teste **não pode** ser usado com credenciais de produção, e cartão real **não pode** ser usado com credenciais de teste — os dois casos retornam 2006.

---

## O que vou alterar no código (mínimo, sem mexer no layout)

- `src/routes/pagamento.tsx`: remover o fallback fixo `TEST-4b6d4336-...`, ler `VITE_MERCADOPAGO_PUBLIC_KEY` de forma estrita e desabilitar o botão + mostrar mensagem se a chave estiver ausente.

Nenhuma outra mudança de UI, business logic ou backend.

---

**Quer que eu siga por esse caminho?** Se sim, me confirme e já:
1. Aplico a mudança no `pagamento.tsx`.
2. Abro o formulário seguro pra você atualizar `MERCADOPAGO_ACCESS_TOKEN`.
3. Te digo onde colar a `VITE_MERCADOPAGO_PUBLIC_KEY` nova.
