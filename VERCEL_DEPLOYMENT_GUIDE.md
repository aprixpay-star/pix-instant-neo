# 🚀 Guia de Deploy da APRIXPAY no Vercel

## 📋 Pré-requisitos

- ✅ Conta no Vercel (você já tem)
- ✅ Repositório no GitHub (`aprixpay-star/pix-instant-neo`)
- ✅ Credenciais do Supabase
- ✅ Branch padrão: `main`

---

## 🔧 Etapa 1: Preparar o Código (JÁ FEITO)

As seguintes alterações já foram realizadas:

✅ Removido `@lovable.dev/vite-tanstack-config`
✅ Atualizado `vite.config.ts` para TanStack Start padrão
✅ Atualizado `package.json`
✅ Criado `.env.example` com variáveis necessárias
✅ Criado `vercel.json` com configurações de deploy

---

## 📤 Etapa 2: Fazer Commit e Push no GitHub

Execute os comandos abaixo no seu repositório local:

```bash
# Navegar para o diretório do projeto
cd /caminho/para/pix-instant-neo

# Adicionar todas as mudanças
git add .

# Fazer commit
git commit -m "chore: prepare for Vercel deployment - remove Lovable dependencies"

# Push para o GitHub (branch main)
git push origin main
```

---

## 🌐 Etapa 3: Criar Projeto no Vercel

### Opção A: Via Dashboard (Recomendado)

1. Acesse: https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Procure por `aprixpay-star/pix-instant-neo`
5. Clique em **"Import"**

### Opção B: Via CLI

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

---

## 🔐 Etapa 4: Configurar Variáveis de Ambiente

No Vercel Dashboard:

1. Acesse seu projeto APRIXPAY
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | `https://seu-project-id.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `seu_anon_key_aqui` | Production, Preview, Development |
| `SUPABASE_URL` | `https://seu-project-id.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `seu_service_role_key_aqui` | Production, Preview, Development |

**⚠️ IMPORTANTE**: 
- Obtenha estes valores do seu dashboard Supabase
- A `SUPABASE_SERVICE_ROLE_KEY` é sensível - configure apenas para os ambientes necessários
- Nunca exponha a Service Role Key no frontend

---

## 🔗 Etapa 5: Conectar Domínio Customizado (Opcional)

Se você tiver um domínio customizado:

1. No Vercel Dashboard, vá em **Settings** → **Domains**
2. Clique em **"Add Domain"**
3. Insira seu domínio
4. Siga as instruções para configurar DNS

---

## ✅ Etapa 6: Verificar Deploy

1. Após fazer push no GitHub, o Vercel automaticamente iniciará o build
2. Você pode acompanhar em: https://vercel.com/dashboard/aprixpay-star
3. Quando o status for **"Ready"**, seu site está live!

---

## 📊 Status do Deploy

- **URL de Preview**: Gerada automaticamente para cada PR
- **URL de Production**: `https://seu-projeto.vercel.app` (ou seu domínio customizado)
- **Logs**: Disponíveis em **Deployments** → **Logs**

---

## 🐛 Troubleshooting

### Build falha com erro de dependências

```bash
# Limpar cache e reinstalar
npm ci
npm run build
```

### Variáveis de ambiente não aparecem

1. Certifique-se de que estão configuradas no Vercel Dashboard
2. Aguarde 5 minutos e faça um novo deploy
3. Verifique se o nome da variável está correto (case-sensitive)

### Erro de conexão com Supabase

1. Verifique se as URLs e chaves estão corretas
2. Confirme que o projeto Supabase está ativo
3. Teste a conexão localmente com `.env.local`

---

## 🚀 Deploy Automático

Após configurar tudo, o Vercel fará deploy automático sempre que você:

- Fazer push no branch `main`
- Abrir um Pull Request (deploy de preview)

---

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **TanStack Start Docs**: https://tanstack.com/start/latest

---

## ✨ Próximos Passos

Após o deploy estar funcionando:

1. **Testar fluxos completos** (cadastro, simulador, pagamento)
2. **Configurar analytics** (opcional)
3. **Configurar CI/CD** para testes automáticos
4. **Monitorar performance** com Vercel Analytics

---

**Status**: ✅ Pronto para Deploy
**Data**: 10 de Julho de 2026
**Branch**: main
