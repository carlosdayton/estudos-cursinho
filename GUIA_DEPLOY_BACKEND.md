# 🚀 Guia Rápido: Deploy do Backend e Configuração do Webhook

## Visão Geral

Você **NÃO precisa** de um servidor separado! O backend roda nas **Supabase Edge Functions** (serverless), que já estão incluídas no seu plano do Supabase.

**Arquitetura atual:**
- ✅ Frontend: Vercel (já configurado)
- ✅ Banco de dados: Supabase (já configurado)
- 🔄 Backend: Supabase Edge Functions (precisa fazer deploy)

---

## Passo 1: Instalar Supabase CLI

```bash
# Instalar globalmente
npm install -g supabase

# Verificar instalação
supabase --version
```

---

## Passo 2: Obter Credenciais do Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **General**
4. Copie o **Reference ID** (exemplo: `bzahiysaveiyfwdegzmk`)

---

## Passo 3: Linkar seu Projeto Local ao Supabase

```bash
# No diretório do projeto
cd estudos-cursinho

# Linkar ao Supabase (substitua pelo seu Reference ID)
supabase link --project-ref SEU_REFERENCE_ID_AQUI

# Você será solicitado a inserir a senha do banco de dados
# Pegue em: Supabase Dashboard → Settings → Database → Database password
```

---

## Passo 4: Obter Credenciais do Mercado Pago

### Para Testes (Desenvolvimento):

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/credentials)
2. Clique em **Credenciais de teste**
3. Copie:
   - **Public Key** (começa com `TEST-`)
   - **Access Token** (começa com `TEST-`)

### Para Produção:

1. No mesmo painel, clique em **Credenciais de produção**
2. Copie:
   - **Public Key** (começa com `APP_USR-`)
   - **Access Token** (começa com `APP_USR-`)

**⚠️ IMPORTANTE**: Guarde essas credenciais em local seguro!

---

## Passo 5: Configurar Secrets do Edge Function

```bash
# Configurar Access Token do Mercado Pago
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN_AQUI

# Configurar Webhook Secret (você vai obter isso no Passo 7)
# Por enquanto, use um valor temporário
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=temp_secret_123

# Verificar se os secrets foram configurados
supabase secrets list
```

**Saída esperada:**
```
NAME                              DIGEST
MERCADO_PAGO_ACCESS_TOKEN         ••••••••
MERCADO_PAGO_WEBHOOK_SECRET       ••••••••
```

---

## Passo 6: Deploy do Edge Function

```bash
# Fazer deploy da função webhook-handler
supabase functions deploy webhook-handler
```

**Saída esperada:**
```
Deploying webhook-handler (project ref: seu-project-ref)
Deployed Function webhook-handler
Function URL: https://seu-project-ref.supabase.co/functions/v1/webhook-handler
```

**🎯 COPIE ESSA URL!** Você vai precisar dela no próximo passo.

---

## Passo 7: Configurar Webhook no Mercado Pago

### 7.1 Acessar Painel de Webhooks

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá em **Suas integrações** → **Webhooks**
3. Clique em **Adicionar novo webhook**

### 7.2 Configurar o Webhook

Preencha os campos:

- **URL de produção**: Cole a URL do Edge Function
  ```
  https://seu-project-ref.supabase.co/functions/v1/webhook-handler
  ```

- **Eventos a receber**: Selecione **Pagamentos** (Payments)

- **Versão**: v1

- Clique em **Salvar**

### 7.3 Copiar o Webhook Secret

Após salvar, o Mercado Pago vai mostrar um **Webhook Secret**.

**COPIE ESSE SECRET!** Você precisa atualizar no Supabase:

```bash
# Atualizar o webhook secret com o valor real
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=SEU_WEBHOOK_SECRET_AQUI
```

---

## Passo 8: Testar o Webhook

### 8.1 Testar pelo Mercado Pago

1. No painel de Webhooks do Mercado Pago
2. Clique em **Enviar teste** ao lado do seu webhook
3. Verifique se retorna status 200 OK

### 8.2 Verificar Logs do Edge Function

```bash
# Ver logs em tempo real
supabase functions logs webhook-handler --follow
```

Você deve ver algo como:
```
Webhook received: { type: 'payment', action: 'payment.created', data: { id: '...' } }
```

---

## Passo 9: Atualizar Frontend na Vercel

### 9.1 Configurar Variáveis de Ambiente na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://seu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_public_key_aqui
```

**Onde encontrar essas credenciais:**
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`: Supabase Dashboard → Settings → API
- `VITE_MERCADO_PAGO_PUBLIC_KEY`: Mercado Pago Developers → Credenciais

### 9.2 Fazer Redeploy

```bash
# Fazer commit e push (Vercel vai fazer redeploy automaticamente)
git add .
git commit -m "Configure production environment variables"
git push
```

Ou no dashboard da Vercel:
- Vá em **Deployments**
- Clique em **Redeploy** no último deployment

---

## Passo 10: Testar o Fluxo Completo

### 10.1 Teste com Cartão de Teste

1. Acesse seu site na Vercel: `https://seu-site.vercel.app`
2. Clique em **Assinar Agora**
3. Digite um email de teste
4. Use o cartão de teste do Mercado Pago:
   - **Número**: `5031 4332 1540 6351`
   - **Validade**: Qualquer data futura
   - **CVV**: Qualquer 3 dígitos
   - **Nome**: Qualquer nome

### 10.2 Verificar o Fluxo

1. **Pagamento aprovado** → Você deve ser redirecionado para `/success`
2. **Email enviado** → Verifique o email (pode estar no spam)
3. **Magic link** → Clique no link do email
4. **Dashboard** → Você deve ser redirecionado para `/dashboard`

### 10.3 Verificar no Banco de Dados

1. Acesse Supabase Dashboard → **Table Editor** → `subscriptions`
2. Você deve ver um registro com:
   - `user_id`: UUID do usuário criado
   - `payment_id`: ID do pagamento do Mercado Pago
   - `status`: "approved"

---

## 🔧 Troubleshooting

### Problema: "Function deployment failed"

**Solução:**
```bash
# Verificar se está linkado ao projeto correto
supabase projects list

# Re-linkar se necessário
supabase link --project-ref seu-project-ref
```

### Problema: "Webhook signature verification failed"

**Solução:**
```bash
# Verificar se o secret está correto
supabase secrets list

# Atualizar o secret
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=secret_correto
```

### Problema: "Email não chegou"

**Possíveis causas:**
1. Email está no spam
2. SMTP do Supabase tem limite (3 emails/hora no plano free)
3. Configuração de email no Supabase

**Solução:**
1. Verifique a pasta de spam
2. Configure um SMTP customizado no Supabase (SendGrid, AWS SES, etc.)

### Problema: "Não consigo acessar o dashboard"

**Verificar:**
1. Usuário foi criado? (Supabase Dashboard → Authentication → Users)
2. Subscription foi criada? (Supabase Dashboard → Table Editor → subscriptions)
3. Status da subscription é "approved"?

---

## 📊 Monitoramento

### Ver Logs do Edge Function

```bash
# Logs em tempo real
supabase functions logs webhook-handler --follow

# Últimos 100 logs
supabase functions logs webhook-handler --limit 100
```

### Ver Transações no Mercado Pago

1. Acesse [Mercado Pago Dashboard](https://www.mercadopago.com.br/activities)
2. Vá em **Atividades** → **Transações**
3. Verifique o status dos pagamentos

---

## 🎯 Checklist Final

- [ ] Supabase CLI instalado
- [ ] Projeto linkado ao Supabase
- [ ] Credenciais do Mercado Pago obtidas
- [ ] Secrets configurados no Supabase
- [ ] Edge Function deployed
- [ ] Webhook configurado no Mercado Pago
- [ ] Webhook secret atualizado
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Frontend redeployed
- [ ] Teste completo realizado
- [ ] Pagamento de teste aprovado
- [ ] Email recebido
- [ ] Dashboard acessível

---

## 🚀 Próximos Passos

### Para Produção:

1. **Trocar para credenciais de produção**:
   - Mercado Pago: Use credenciais de produção
   - Atualizar secrets no Supabase
   - Atualizar variáveis na Vercel

2. **Configurar SMTP customizado** (recomendado):
   - Supabase Dashboard → Settings → Auth → Email
   - Configure SendGrid, AWS SES, ou Mailgun
   - Melhora deliverability dos emails

3. **Configurar domínio customizado**:
   - Vercel: Adicionar domínio customizado
   - Supabase: Atualizar SITE_URL nas configurações de Auth

4. **Monitorar**:
   - Logs do Edge Function
   - Transações no Mercado Pago
   - Emails enviados

---

## 📚 Documentação Adicional

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Mercado Pago Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Dúvidas?** Consulte o arquivo `DEPLOYMENT.md` para mais detalhes ou os logs do Edge Function para troubleshooting.
