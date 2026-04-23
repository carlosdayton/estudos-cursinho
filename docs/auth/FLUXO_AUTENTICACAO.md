# Fluxo de Autenticação e Redirecionamento

## Visão Geral

O sistema possui três estados principais para o usuário:
1. **Não autenticado** - Sem login
2. **Autenticado sem assinatura** - Logado mas sem pagamento
3. **Autenticado com assinatura** - Logado e com acesso completo

## Fluxo Detalhado

### 1. Landing Page (`/`)

**Usuário não autenticado:**
- ✅ Vê a landing page
- Pode clicar em "Assinar Agora" → vai para `/checkout`
- Pode clicar em "Já tenho acesso" → mostra formulário de magic link

**Usuário autenticado sem assinatura:**
- 🔄 Redirecionado automaticamente para `/checkout`
- Vê mensagem: "Complete sua assinatura"

**Usuário autenticado com assinatura:**
- 🔄 Redirecionado automaticamente para `/dashboard`

### 2. Checkout Page (`/checkout`)

**Usuário não autenticado:**
- ✅ Vê a página de checkout
- Insere email e vai para pagamento

**Usuário autenticado sem assinatura:**
- ✅ Vê a página de checkout
- Pode completar o pagamento

**Usuário autenticado com assinatura:**
- 🔄 Redirecionado automaticamente para `/dashboard`

### 3. Success Page (`/success`)

**Qualquer usuário:**
- ✅ Vê a página de sucesso
- Não há redirecionamento automático
- Permite ver confirmação de pagamento mesmo já autenticado

### 4. Dashboard (`/dashboard`)

**Usuário não autenticado:**
- 🔄 Redirecionado para `/` (landing page)

**Usuário autenticado sem assinatura:**
- 🔄 Redirecionado para `/` (landing page)
- Landing page então redireciona para `/checkout`

**Usuário autenticado com assinatura:**
- ✅ Vê o dashboard completo

## Fluxo de Magic Link

### Cenário 1: Usuário com assinatura ativa

```
1. Landing page → Clica "Já tenho acesso"
2. Insere email → Recebe magic link
3. Clica no link → Redireciona para "/"
4. AuthGate detecta: user=true, subscription=true
5. Redireciona para "/dashboard" ✅
```

### Cenário 2: Usuário sem assinatura

```
1. Landing page → Clica "Já tenho acesso"
2. Insere email → Recebe magic link
3. Clica no link → Redireciona para "/"
4. AuthGate detecta: user=true, subscription=false
5. Redireciona para "/checkout" ✅
6. Usuário completa pagamento
7. Webhook atualiza subscription
8. Usuário é redirecionado para "/dashboard" ✅
```

### Cenário 3: Novo usuário (primeiro acesso)

```
1. Landing page → Clica "Assinar Agora"
2. Checkout page → Insere email
3. Cria conta no Supabase (via webhook)
4. Completa pagamento
5. Success page → Mostra confirmação
6. Clica "Acessar Plataforma"
7. Redireciona para "/dashboard" ✅
```

## Componentes de Proteção

### AuthGate
Protege rotas públicas e redireciona usuários autenticados:

```typescript
// Lógica do AuthGate
if (loading) return <LoadingScreen />;

if (user && hasActiveSubscription) {
  return <Navigate to="/dashboard" />;
}

if (user && !hasActiveSubscription && pathname === '/') {
  return <Navigate to="/checkout" />;
}

return <>{children}</>;
```

### ProtectedRoute
Protege rotas privadas (dashboard):

```typescript
// Lógica do ProtectedRoute
if (loading) return <LoadingScreen />;

if (!user) {
  return <Navigate to="/" />;
}

if (!hasActiveSubscription) {
  return <Navigate to="/" />;
}

return <>{children}</>;
```

## Verificação de Assinatura

O hook `useSubscription` verifica o status da assinatura:

```typescript
// Consulta a tabela subscriptions
const { data } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

// Considera ativa apenas se status === 'approved'
const hasActiveSubscription = subscription?.status === 'approved';
```

## Estados da Assinatura

| Status | Descrição | Acesso ao Dashboard |
|--------|-----------|---------------------|
| `null` | Sem registro de assinatura | ❌ Não |
| `pending` | Pagamento pendente | ❌ Não |
| `approved` | Pagamento aprovado | ✅ Sim |
| `failed` | Pagamento falhou | ❌ Não |

## Troubleshooting

### Problema: Usuário fica na landing page após magic link

**Causa:** Não tem assinatura ativa na tabela `subscriptions`

**Solução:**
1. Verificar se o registro existe: `SELECT * FROM subscriptions WHERE user_id = 'xxx'`
2. Verificar se o status é `approved`
3. Se não existir, usuário precisa completar pagamento

### Problema: Usuário não consegue acessar dashboard após pagamento

**Causa:** Webhook não atualizou a tabela `subscriptions`

**Solução:**
1. Verificar logs do webhook no Supabase
2. Verificar se o payment_id está correto
3. Verificar se o status foi atualizado para `approved`
4. Forçar refresh: `subscription.refresh()`

### Problema: Loop de redirecionamento

**Causa:** Lógica de redirecionamento conflitante

**Solução:**
1. Verificar se `AuthGate` e `ProtectedRoute` não estão conflitando
2. Verificar se `window.location.pathname` está correto
3. Limpar cache do navegador

## Diagrama de Fluxo

```
┌─────────────┐
│   Landing   │
│   Page (/)  │
└──────┬──────┘
       │
       ├─ Não autenticado ──────────────────────┐
       │                                        │
       ├─ Autenticado sem assinatura ──────────┼──> Checkout (/checkout)
       │                                        │
       └─ Autenticado com assinatura ──────────┼──> Dashboard (/dashboard)
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │   Pagamento  │
                                         │  Mercado Pago│
                                         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │   Webhook    │
                                         │   Handler    │
                                         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │  Atualiza    │
                                         │ Subscription │
                                         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │   Success    │
                                         │   Page       │
                                         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │  Dashboard   │
                                         │  (/dashboard)│
                                         └──────────────┘
```

## Testes Recomendados

### Teste 1: Magic Link com Assinatura
1. Criar usuário com assinatura `approved`
2. Fazer logout
3. Clicar em "Já tenho acesso"
4. Inserir email
5. Clicar no magic link
6. **Esperado:** Redireciona para `/dashboard`

### Teste 2: Magic Link sem Assinatura
1. Criar usuário sem assinatura
2. Fazer logout
3. Clicar em "Já tenho acesso"
4. Inserir email
5. Clicar no magic link
6. **Esperado:** Redireciona para `/checkout`

### Teste 3: Novo Usuário
1. Acessar landing page
2. Clicar em "Assinar Agora"
3. Completar pagamento
4. **Esperado:** Cria conta, ativa assinatura, redireciona para `/dashboard`

### Teste 4: Acesso Direto ao Dashboard
1. Fazer logout
2. Acessar `/dashboard` diretamente
3. **Esperado:** Redireciona para `/` (landing page)
