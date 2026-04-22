# 🚀 Deploy da Edge Function: create-preference

## 📌 O que foi corrigido?

**Problema identificado:** O checkout estava usando um mock (simulação) em vez de criar uma preferência de pagamento real no Mercado Pago, resultando em erro ao redirecionar para o pagamento.

**Solução implementada:** Criada uma nova Edge Function (`create-preference`) que cria preferências de pagamento de forma segura no servidor, sem expor o Access Token no frontend.

---

## 🔧 Como fazer o deploy

### Opção 1: Via Supabase CLI (Recomendado)

Se você tem o Supabase CLI instalado:

```bash
# Fazer login (se ainda não estiver logado)
supabase login

# Fazer deploy da nova Edge Function
supabase functions deploy create-preference
```

### Opção 2: Via Supabase Dashboard (Manual)

Se o CLI não estiver disponível, você pode fazer o deploy manualmente:

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/bzahiysaveiyfwdegzmk/functions

2. **Criar nova Edge Function**
   - Clique em "Create a new function"
   - Nome: `create-preference`
   - Clique em "Create function"

3. **Copiar o código**
   - Abra o arquivo: `supabase/functions/create-preference/index.ts`
   - Copie todo o conteúdo do arquivo

4. **Colar no editor**
   - Cole o código no editor do Supabase Dashboard
   - Clique em "Deploy" ou "Save"

5. **Verificar o deploy**
   - A função deve aparecer na lista com status "Active"
   - URL da função: `https://bzahiysaveiyfwdegzmk.supabase.co/functions/v1/create-preference`

---

## ✅ Verificar se funcionou

### 1. Testar a Edge Function diretamente

Você pode testar a função usando curl ou Postman:

```bash
curl -X POST https://bzahiysaveiyfwdegzmk.supabase.co/functions/v1/create-preference \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Resposta esperada:**
```json
{
  "id": "1234567890-abc123",
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "sandbox_init_point": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

### 2. Testar no site

1. Acesse: https://estudos-cursinho.vercel.app/checkout
2. Digite um email de teste
3. Clique em "Ir para Pagamento"
4. Você deve ser redirecionado para o checkout do Mercado Pago (sandbox)
5. **Não deve mais aparecer erro!**

---

## 🔍 Logs e Debugging

### Ver logs da Edge Function

```bash
# Ver logs em tempo real
supabase functions logs create-preference --follow

# Ver últimos 100 logs
supabase functions logs create-preference --limit 100
```

### Logs esperados (sucesso):

```
Creating payment preference for email: test@example.com
Payment preference created successfully: 1234567890-abc123
```

### Logs de erro comuns:

**1. "MERCADO_PAGO_ACCESS_TOKEN not configured"**
- O Access Token não está configurado nos secrets do Supabase
- Solução: `supabase secrets set MERCADO_PAGO_ACCESS_TOKEN="seu_token_aqui"`

**2. "Mercado Pago API error: 401 Unauthorized"**
- O Access Token está incorreto ou expirado
- Solução: Verifique o token no painel do Mercado Pago e atualize

**3. "Mercado Pago API error: 400 Bad Request"**
- Dados da preferência estão incorretos
- Verifique os logs para ver detalhes do erro

---

## 📋 Checklist de Deploy

- [ ] Edge Function `create-preference` deployada
- [ ] Função aparece como "Active" no dashboard
- [ ] Teste com curl retorna sucesso (200 OK)
- [ ] Teste no site redireciona para Mercado Pago
- [ ] Não aparece mais erro de "mock-preference-id"

---

## 🔐 Segurança

**Antes (INSEGURO):**
- Access Token exposto no frontend
- Qualquer pessoa podia ver o token no código JavaScript
- Risco de uso indevido do token

**Depois (SEGURO):**
- Access Token armazenado como secret no Supabase
- Apenas a Edge Function tem acesso ao token
- Frontend chama a Edge Function, que cria a preferência de forma segura

---

## 🆘 Problemas?

### Erro: "Configuração não encontrada"
- As variáveis de ambiente não estão configuradas na Vercel
- Solução: Adicione `VITE_SUPABASE_URL` na Vercel (ver `CONFIGURAR_VERCEL.md`)

### Erro: "Failed to create payment preference"
- A Edge Function não está deployada ou está com erro
- Solução: Verifique os logs da função e faça redeploy se necessário

### Erro: "Payment configuration error"
- O Access Token não está configurado no Supabase
- Solução: Configure o secret `MERCADO_PAGO_ACCESS_TOKEN`

---

## 📚 Arquivos Modificados

- ✅ `supabase/functions/create-preference/index.ts` (NOVO)
- ✅ `src/components/CheckoutPage.tsx` (ATUALIZADO)

---

## 🎯 Próximos Passos

1. **Deploy da Edge Function** (este guia)
2. **Testar o fluxo de pagamento** (usar cartão de teste)
3. **Configurar webhook no Mercado Pago** (ver `PROXIMOS_PASSOS_WEBHOOK.md`)
4. **Testar fluxo completo** (pagamento → webhook → email → dashboard)

---

**Status:** ⚠️ **PENDENTE - DEPLOY DA EDGE FUNCTION NECESSÁRIO**

Depois de fazer o deploy, o erro no checkout deve ser resolvido! 🚀
