# Fluxo Completo de Cadastro e Login

## Visão Geral

O sistema agora possui **dois fluxos** para o usuário:

1. **Fluxo de Compra** - Para novos usuários que querem assinar
2. **Fluxo de Cadastro Gratuito** - Para criar conta antes de comprar

## Fluxo 1: Compra Direta (Recomendado)

```
Landing Page
    ↓
Clica "Assinar Agora"
    ↓
Checkout Page
    ↓
Insere email
    ↓
Completa pagamento no Mercado Pago
    ↓
Webhook cria conta no Supabase
    ↓
Usuário recebe email de confirmação
    ↓
Clica no link de confirmação
    ↓
Define senha (primeira vez)
    ↓
Faz login
    ↓
Dashboard ✅
```

### Como funciona o Webhook

Quando o pagamento é aprovado:

1. **Webhook recebe notificação** do Mercado Pago
2. **Cria usuário no Supabase** com o email do pagamento
3. **Cria registro na tabela `subscriptions`** com status `approved`
4. **Envia email de confirmação** para o usuário
5. Usuário clica no link e define senha

## Fluxo 2: Cadastro Gratuito (Novo)

```
Landing Page
    ↓
Clica "Criar conta grátis"
    ↓
Auth Screen (/auth)
    ↓
Preenche:
  - Email
  - Senha (mínimo 8 caracteres)
  - Confirmar senha
    ↓
Clica "Criar conta"
    ↓
Supabase cria conta
    ↓
Envia email de confirmação
    ↓
Usuário clica no link
    ↓
Conta confirmada
    ↓
Faz login
    ↓
Landing Page (sem assinatura)
    ↓
Clica "Assinar Agora"
    ↓
Checkout → Pagamento
    ↓
Dashboard ✅
```

## Fluxo 3: Login Existente

```
Landing Page
    ↓
Clica "Já tenho acesso"
    ↓
Formulário de Login (inline)
    ↓
Insere:
  - Email
  - Senha
    ↓
Clica "Entrar"
    ↓
Validação
    ↓
    ├─ Tem assinatura? → Dashboard ✅
    └─ Não tem? → Landing (botão "Assinar") ✅
```

## Componentes

### 1. LandingPage (`/`)

**Botões disponíveis:**
- **"Assinar Agora"** → `/checkout` (fluxo de compra)
- **"Já tenho acesso"** → Abre formulário inline (login rápido)
- **"Criar conta grátis"** → `/auth` (cadastro completo)

### 2. AuthScreen (`/auth`)

**Tela completa de autenticação com 3 modos:**
- **Login** - Email + Senha
- **Cadastro** - Email + Senha + Confirmar Senha
- **Recuperar Senha** - Email

**Funcionalidades:**
- ✅ Validação de email
- ✅ Validação de senha (mínimo 8 caracteres)
- ✅ Confirmação de senha
- ✅ Mostrar/ocultar senha
- ✅ Mensagens de erro em PT-BR
- ✅ Mensagens de sucesso
- ✅ Alternância entre modos

### 3. CheckoutPage (`/checkout`)

**Fluxo de pagamento:**
- Insere email
- Cria preferência no Mercado Pago
- Redireciona para pagamento
- Webhook cria conta após aprovação

## Banco de Dados (Supabase)

### Tabela `auth.users`

Gerenciada automaticamente pelo Supabase Auth:

```sql
-- Criada automaticamente quando:
-- 1. Usuário se cadastra via AuthScreen
-- 2. Webhook cria conta após pagamento

id: uuid (PK)
email: string
encrypted_password: string (hash bcrypt)
email_confirmed_at: timestamp
created_at: timestamp
updated_at: timestamp
```

### Tabela `subscriptions`

Gerenciada pelo webhook:

```sql
id: uuid (PK)
user_id: uuid (FK → auth.users.id)
payment_id: string (ID do Mercado Pago)
status: string ('approved', 'pending', 'failed')
created_at: timestamp
updated_at: timestamp
```

## Segurança

### Senhas

- ✅ **Mínimo 8 caracteres**
- ✅ **Hash bcrypt** (gerenciado pelo Supabase)
- ✅ **Nunca armazenadas em texto plano**
- ✅ **Validação no frontend e backend**

### Email de Confirmação

- ✅ **Obrigatório** para ativar conta
- ✅ **Link temporário** (expira em 24h)
- ✅ **Token único** por usuário

### Recuperação de Senha

- ✅ **Link seguro** enviado por email
- ✅ **Token temporário** (expira em 1h)
- ✅ **Requer confirmação** da nova senha

## Fluxo de Recuperação de Senha

```
Landing Page ou Auth Screen
    ↓
Clica "Esqueci minha senha"
    ↓
Insere email
    ↓
Clica "Enviar link"
    ↓
Recebe email com link
    ↓
Clica no link
    ↓
Define nova senha
    ↓
Confirma nova senha
    ↓
Senha atualizada
    ↓
Faz login com nova senha
    ↓
Dashboard ✅
```

## Diferenças entre os Fluxos

| Aspecto | Compra Direta | Cadastro Gratuito |
|---------|---------------|-------------------|
| Quando usar | Usuário quer assinar imediatamente | Usuário quer testar antes |
| Cria conta | Automático (webhook) | Manual (usuário) |
| Define senha | Após confirmação de email | Durante cadastro |
| Acesso imediato | Sim (após pagamento) | Não (precisa assinar) |
| Passos | Menos (mais rápido) | Mais (mais controle) |

## Recomendação

**Para a maioria dos usuários:**
- Use o **Fluxo de Compra Direta** (mais rápido)
- Botão "Assinar Agora" na landing page

**Para usuários que querem explorar:**
- Use o **Fluxo de Cadastro Gratuito**
- Botão "Criar conta grátis" na landing page
- Permite criar conta sem compromisso
- Pode assinar depois

## Testes

### Teste 1: Cadastro Gratuito

1. Landing page → "Criar conta grátis"
2. Preencher email, senha, confirmar senha
3. Clicar "Criar conta"
4. Verificar email de confirmação
5. Clicar no link
6. Fazer login
7. **Esperado:** Fica na landing page (sem assinatura)

### Teste 2: Login com Assinatura

1. Landing page → "Já tenho acesso"
2. Inserir email e senha
3. Clicar "Entrar"
4. **Esperado:** Vai para dashboard

### Teste 3: Login sem Assinatura

1. Landing page → "Já tenho acesso"
2. Inserir email e senha (sem assinatura)
3. Clicar "Entrar"
4. **Esperado:** Fica na landing page com botão "Assinar"

### Teste 4: Compra Direta

1. Landing page → "Assinar Agora"
2. Inserir email
3. Completar pagamento
4. Verificar email de confirmação
5. Definir senha
6. Fazer login
7. **Esperado:** Vai para dashboard

## Configuração do Webhook

O webhook precisa criar a conta no Supabase quando o pagamento for aprovado:

```typescript
// No webhook handler
if (payment.status === 'approved') {
  // 1. Criar usuário no Supabase
  const { data: user, error } = await supabase.auth.admin.createUser({
    email: payment.payer.email,
    email_confirm: false, // Requer confirmação
  });

  // 2. Criar registro de assinatura
  await supabase.from('subscriptions').insert({
    user_id: user.id,
    payment_id: payment.id,
    status: 'approved',
  });

  // 3. Enviar email de confirmação (automático pelo Supabase)
}
```

## Status Atual

- ✅ AuthScreen implementado
- ✅ Rota `/auth` adicionada
- ✅ Botão "Criar conta grátis" na landing page
- ✅ Formulário de login inline na landing page
- ✅ Validação de senha (mínimo 8 caracteres)
- ✅ Confirmação de senha
- ✅ Recuperação de senha
- ⏳ Aguardando push e deploy

## Próximos Passos

1. Fazer push das mudanças
2. Testar cadastro em produção
3. Testar login em produção
4. Confirmar que webhook cria contas corretamente
5. Testar fluxo completo de ponta a ponta
