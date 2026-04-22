# 📂 Estrutura de Branches

## Branches Disponíveis

### 🌿 `main` (Produção - Aplicativo Aberto)

**Status:** ✅ Ativo em produção  
**URL:** https://estudos-cursinho.vercel.app

**Características:**
- ✅ Aplicativo totalmente funcional
- ✅ Acesso gratuito (sem paywall)
- ✅ Requer apenas login com email (magic link)
- ✅ Todas as funcionalidades disponíveis:
  - Dashboard com progresso
  - Matérias e tópicos
  - Pomodoro timer
  - Revisões automáticas
  - Simulados e análise
  - Anotações e redações
  - Metas e cronograma
  - Questões
  - Flashcards
  - Ciclos de estudo
  - Planner semanal
  - Modo foco
  - Estatísticas completas

**Último commit:** `413f690 - fix: improve mobile responsiveness across all screens`

---

### 💳 `payment-system` (Sistema de Pagamento)

**Status:** 🚧 Em desenvolvimento  
**Não deployado em produção**

**Características:**
- ✅ Sistema completo de pagamento com Mercado Pago
- ✅ Landing page com CTA de assinatura
- ✅ Checkout page com validação de email
- ✅ Success page com status de pagamento
- ✅ Webhook handler para processar pagamentos
- ✅ Criação automática de contas após pagamento
- ✅ Magic link enviado por email
- ✅ Controle de acesso baseado em subscription
- ✅ Edge Functions (webhook-handler, create-preference)
- ✅ Testes unitários e de integração
- ⚠️ Requer configuração adicional (webhook, variáveis)

**Funcionalidades adicionais:**
- Landing page profissional
- Checkout integrado com Mercado Pago
- Webhook para processar pagamentos automaticamente
- Sistema de subscriptions no banco de dados
- Controle de acesso por subscription ativa
- Suporte a pagamentos aprovados/pendentes/rejeitados

**Commits principais:**
- `405f250` - docs: add deployment guide for create-preference Edge Function
- `2441f9a` - fix: implement secure payment preference creation via Edge Function
- `8b2dfa2` - feat: complete payment system implementation with Mercado Pago integration

**Documentação:**
- `STATUS_DEPLOY.md` - Status completo do deploy
- `DEPLOY_CREATE_PREFERENCE.md` - Guia de deploy da Edge Function
- `PROXIMOS_PASSOS_WEBHOOK.md` - Configuração do webhook
- `CONFIGURAR_VERCEL.md` - Configuração de variáveis na Vercel
- `GUIA_DEPLOY_BACKEND.md` - Guia completo de deploy do backend
- `DEPLOYMENT.md` - Documentação geral

---

## 🔄 Como Trabalhar com as Branches

### Para usar o aplicativo aberto (atual):

```bash
git checkout main
```

Está é a branch que está em produção. Sua namorada pode usar normalmente.

### Para trabalhar no sistema de pagamento:

```bash
git checkout payment-system
```

Todos os commits relacionados ao sistema de pagamento estão aqui.

### Para fazer deploy do sistema de pagamento no futuro:

Quando quiser ativar o paywall:

```bash
# 1. Certifique-se de estar na branch payment-system
git checkout payment-system

# 2. Faça merge na main
git checkout main
git merge payment-system

# 3. Push para produção
git push origin main
```

**⚠️ IMPORTANTE:** Antes de fazer o merge, você precisa:
1. Deploy da Edge Function `create-preference`
2. Configurar webhook no Mercado Pago
3. Configurar variáveis de ambiente na Vercel
4. Testar o fluxo completo

---

## 📊 Comparação

| Funcionalidade | main | payment-system |
|----------------|------|----------------|
| Dashboard | ✅ | ✅ |
| Matérias | ✅ | ✅ |
| Pomodoro | ✅ | ✅ |
| Revisões | ✅ | ✅ |
| Simulados | ✅ | ✅ |
| Anotações | ✅ | ✅ |
| Estatísticas | ✅ | ✅ |
| Ciclos | ✅ | ✅ |
| Planner | ✅ | ✅ |
| Flashcards | ✅ | ✅ |
| Modo Foco | ✅ | ✅ |
| **Landing Page** | ❌ | ✅ |
| **Checkout** | ❌ | ✅ |
| **Paywall** | ❌ | ✅ |
| **Subscriptions** | ❌ | ✅ |
| **Webhook Handler** | ❌ | ✅ |

---

## 🎯 Recomendações

### Para uso pessoal (sua namorada):
- **Use a branch `main`**
- Aplicativo totalmente funcional e gratuito
- Apenas requer login com email

### Para monetização futura:
- **Desenvolva na branch `payment-system`**
- Faça merge na `main` quando estiver pronto para cobrar
- Teste tudo antes de fazer o merge

---

## 🔐 Segurança

**Branch `main`:**
- Sem dados sensíveis de pagamento
- Apenas autenticação básica (Supabase Auth)

**Branch `payment-system`:**
- Access Token do Mercado Pago armazenado como secret no Supabase
- Webhook Secret configurado no Supabase
- Nenhum dado sensível exposto no frontend

---

## 📝 Notas

- A branch `main` está deployada automaticamente na Vercel
- A branch `payment-system` NÃO está deployada
- Você pode trabalhar nas duas branches independentemente
- Commits na `main` não afetam a `payment-system` e vice-versa
- Para testar o sistema de pagamento, você precisaria fazer deploy manual ou criar um ambiente de staging

---

**Última atualização:** 22 de Abril de 2026
