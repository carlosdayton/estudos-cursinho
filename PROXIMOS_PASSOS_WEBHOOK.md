# ✅ Deploy do Backend Concluído!

## 🎉 O que foi feito:

1. ✅ Supabase CLI instalado
2. ✅ Projeto linkado ao Supabase (bzahiysaveiyfwdegzmk)
3. ✅ Secrets configurados:
   - `MERCADO_PAGO_ACCESS_TOKEN` ✅
   - `MERCADO_PAGO_WEBHOOK_SECRET` ⚠️ (temporário)
4. ✅ Edge Function deployed com sucesso!

---

## 🔗 URL do seu Webhook:

```
https://bzahiysaveiyfwdegzmk.supabase.co/functions/v1/webhook-handler
```

**⚠️ COPIE ESSA URL! Você vai precisar dela no próximo passo.**

---

## 📋 Próximos Passos:

### Passo 1: Configurar Webhook no Mercado Pago

1. **Acesse**: https://www.mercadopago.com.br/developers/panel/webhooks

2. **Clique em**: "Adicionar novo webhook" ou "Configurar notificações"

3. **Preencha**:
   - **URL de produção**: 
     ```
     https://bzahiysaveiyfwdegzmk.supabase.co/functions/v1/webhook-handler
     ```
   - **Eventos a receber**: Selecione **Pagamentos** (Payments)
   - **Versão**: v1

4. **Salve** e **COPIE O WEBHOOK SECRET** que aparece na tela

### Passo 2: Atualizar o Webhook Secret

Depois de copiar o Webhook Secret do Mercado Pago, execute:

```bash
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET="SEU_WEBHOOK_SECRET_AQUI"
```

**Substitua** `SEU_WEBHOOK_SECRET_AQUI` pelo secret que você copiou.

### Passo 3: Testar o Webhook

No painel do Mercado Pago, clique em **"Enviar teste"** ao lado do webhook configurado.

Você deve ver:
- ✅ Status 200 OK
- ✅ Webhook recebido com sucesso

### Passo 4: Ver Logs do Edge Function

Para monitorar o que está acontecendo:

```bash
supabase functions logs webhook-handler --follow
```

Isso vai mostrar em tempo real todas as requisições recebidas.

---

## 🧪 Testar o Fluxo Completo

### 1. Acesse seu site na Vercel

```
https://seu-site.vercel.app
```

### 2. Faça um pagamento de teste

- Clique em **"Assinar Agora"**
- Digite um email de teste
- Use o cartão de teste:
  - **Número**: `5031 4332 1540 6351`
  - **Validade**: Qualquer data futura (ex: 12/25)
  - **CVV**: Qualquer 3 dígitos (ex: 123)
  - **Nome**: Qualquer nome

### 3. Verificar o que deve acontecer:

1. ✅ Pagamento aprovado
2. ✅ Webhook recebido pelo Edge Function
3. ✅ Usuário criado no Supabase
4. ✅ Subscription criada no banco
5. ✅ Email com magic link enviado
6. ✅ Redirecionamento para `/success`

### 4. Verificar no Banco de Dados

1. Acesse: https://supabase.com/dashboard/project/bzahiysaveiyfwdegzmk/editor
2. Vá em **Table Editor** → `subscriptions`
3. Você deve ver um registro com:
   - `user_id`: UUID do usuário
   - `payment_id`: ID do pagamento do Mercado Pago
   - `status`: "approved"

---

## 🔧 Comandos Úteis

### Ver logs em tempo real:
```bash
supabase functions logs webhook-handler --follow
```

### Ver últimos 100 logs:
```bash
supabase functions logs webhook-handler --limit 100
```

### Listar secrets configurados:
```bash
supabase secrets list
```

### Atualizar um secret:
```bash
supabase secrets set NOME_DO_SECRET="novo_valor"
```

### Fazer redeploy do Edge Function:
```bash
supabase functions deploy webhook-handler
```

---

## ⚠️ Importante: Configurar Variáveis na Vercel

Não esqueça de configurar as variáveis de ambiente na Vercel:

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:

```
VITE_SUPABASE_URL=https://bzahiysaveiyfwdegzmk.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_public_key_aqui
```

**Onde encontrar:**
- `VITE_SUPABASE_ANON_KEY`: Supabase Dashboard → Settings → API → anon public
- `VITE_MERCADO_PAGO_PUBLIC_KEY`: Mercado Pago → Credenciais de teste → Public Key

Depois, faça **Redeploy** na Vercel.

---

## 🎯 Checklist

- [ ] Webhook configurado no Mercado Pago
- [ ] Webhook Secret atualizado no Supabase
- [ ] Teste do webhook enviado (status 200 OK)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Frontend redeployed na Vercel
- [ ] Pagamento de teste realizado
- [ ] Email com magic link recebido
- [ ] Dashboard acessível após clicar no magic link

---

## 🆘 Problemas?

### Webhook retorna erro 401:
- O Webhook Secret está incorreto
- Atualize com: `supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET="secret_correto"`

### Email não chega:
- Verifique a pasta de spam
- O Supabase free tier tem limite de 3 emails/hora
- Configure um SMTP customizado em: Supabase Dashboard → Settings → Auth → Email

### Não consigo acessar o dashboard:
- Verifique se o usuário foi criado: Supabase Dashboard → Authentication → Users
- Verifique se a subscription foi criada: Supabase Dashboard → Table Editor → subscriptions
- Verifique se o status é "approved"

---

## 📚 Documentação

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Mercado Pago Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Guia Completo de Deploy](./DEPLOYMENT.md)

---

**Pronto para o próximo passo?** Configure o webhook no Mercado Pago e atualize o secret! 🚀
