## Objetivo
Separar o fluxo em duas telas: **cadastro de dados pessoais** e **confirmação/autorização**. Persistir tudo no Supabase com IP, User Agent e timestamp.

## Etapas

### 1. Migração no banco (`operacoes_vendas`)
Adicionar colunas que faltam:
- `telefone TEXT NOT NULL`
- `email TEXT NOT NULL`
- `chave_pix TEXT NOT NULL`

`created_at` já existe (serve como data/hora). `ip_address` e `user_agent` já existem. A policy de INSERT (`aceite_termos = true`) é mantida.

### 2. Nova rota `/cadastro` (`src/routes/cadastro.tsx`)
Recebe `?valor=&parcelas=` vindos do simulador. Formulário com:
- Nome completo (mín. 3 caracteres)
- CPF (com máscara + validação de dígitos)
- Telefone (máscara `(99) 99999-9999`)
- E-mail (validação de formato)
- Chave Pix (CPF/e-mail/telefone/aleatória — texto livre validado por tamanho)

Validação client-side com mensagens inline. Botão **CONTINUAR** habilita só com todos válidos e navega para `/confirmar` passando os dados via `search params` (mantém padrão atual e simples, sem state global).

Visual idêntico ao restante: card escuro, borda sutil, foco neon `#17FF49`, header/footer reutilizados, mesma tipografia.

### 3. Refatorar `/confirmar` (`src/routes/confirmar.tsx`)
Remover todos os inputs. A tela passa a ser **apenas revisão + autorização**:
- Card hero com **valor solicitado** (verde neon, fonte gigante)
- Linha com **{parcelas}x de R$ {valorParcela}**
- Linha secundária com total no cartão (cinza, fonte menor)
- Bloco "Dados do recebedor" em modo leitura: Nome, CPF (mascarado), Telefone, E-mail, Chave Pix
- Checkbox obrigatório: **"Declaro que autorizo esta operação."**
- Botão `AUTORIZAR E RECEBER NO PIX →` desabilitado até marcar
- Selos de segurança (`ShieldCheck`, `Lock`)

`validateSearch` aceita: `valor`, `parcelas`, `nome`, `cpf`, `telefone`, `email`, `chavePix`. Se faltar algum dado obrigatório, redireciona automaticamente para `/cadastro`.

No submit:
- Busca IP via `https://api.ipify.org?format=json` (já existe)
- Captura `navigator.userAgent`
- `INSERT` em `operacoes_vendas` com todos os campos + `aceite_termos: true`
- Tela de sucesso atual é mantida

### 4. Ajustar simulador (`src/routes/simular.tsx`)
O botão `CONFIRMAR PAGAMENTO` / `CONTINUAR` da etapa final passa a navegar para `/cadastro` (em vez de `/confirmar`), levando `valor` e `parcelas`.

## Arquivos
- `supabase/migrations/<novo>.sql` — adicionar 3 colunas
- `src/routes/cadastro.tsx` — **novo**
- `src/routes/confirmar.tsx` — reescrita (somente revisão)
- `src/routes/simular.tsx` — trocar destino do CTA final

## Fluxo final
`/` → `/simular` (valor + parcelas) → `/cadastro` (dados pessoais + Pix) → `/confirmar` (revisão + autorização) → sucesso.
