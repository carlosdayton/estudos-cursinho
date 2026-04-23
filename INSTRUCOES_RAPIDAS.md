# 🚀 Instruções Rápidas - Correção Magic Link

## ✅ O que foi corrigido

1. **Magic link redirecionava para localhost** → Agora usa URL de produção
2. **Usuário ficava na landing page após login** → Agora vai direto para dashboard (se tiver assinatura) ou checkout (se não tiver)

## 🔧 O que você precisa fazer AGORA

### 1. Configurar no Vercel (2 minutos)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Configure:
   ```
   Nome: VITE_APP_URL
   Valor: https://foco-enem-curso.vercel.app
   ```
6. Marque: ✅ Production ✅ Preview ✅ Development
7. Clique em **Save**
8. Vá em **Deployments** → Clique nos 3 pontos do último deploy → **Redeploy**

### 2. Configurar no Supabase (1 minuto)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**
4. Em **Redirect URLs**, adicione:
   ```
   https://foco-enem-curso.vercel.app
   http://localhost:5173
   ```
5. Em **Site URL**, defina:
   ```
   https://foco-enem-curso.vercel.app
   ```
6. Clique em **Save**

## 🧪 Testar (1 minuto)

1. Acesse: https://foco-enem-curso.vercel.app
2. Clique em **"Já tenho acesso"**
3. Insira seu email
4. Abra o email e clique no link
5. **Deve ir direto para o dashboard** (se tiver assinatura) ou **checkout** (se não tiver)

## ❌ Se não funcionar

### Problema: Ainda redireciona para localhost
**Solução:**
- Verifique se fez o redeploy no Vercel
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Tente em janela anônima

### Problema: "Invalid redirect URL"
**Solução:**
- Verifique se a URL está nos Redirect URLs do Supabase
- Aguarde 2-3 minutos para propagar
- Tente novamente

### Problema: Fica na landing page
**Solução:**
- Verifique se tem assinatura ativa no banco:
  ```sql
  SELECT * FROM subscriptions WHERE user_id = 'seu-user-id';
  ```
- Status deve ser `approved`
- Se não tiver, complete o pagamento

## 📚 Documentação Completa

- `FLUXO_AUTENTICACAO.md` - Entenda todo o fluxo
- `CONFIGURAR_AUTH_REDIRECT.md` - Guia detalhado de configuração
- `CORRECAO_MAGIC_LINK_FINAL.md` - Resumo técnico completo

## 🎯 Fluxo Esperado

```
Magic Link → Clica no link → Verifica assinatura
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            Tem assinatura?                 Não tem assinatura?
                    │                               │
                    ▼                               ▼
              📊 Dashboard                    💳 Checkout
```

## ✨ Pronto!

Após configurar o Vercel e Supabase, o magic link vai funcionar perfeitamente! 🎉
