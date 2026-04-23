# 🚀 Configurar Variáveis de Ambiente na Vercel

## Variáveis que você precisa adicionar:

### 1. VITE_SUPABASE_URL
```
https://bzahiysaveiyfwdegzmk.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YWhpeXNhdmVpeWZ3ZGVnem1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTY1ODksImV4cCI6MjA5MjEzMjU4OX0.WU8MLrwRGXc5d7Rh5AFvp0tKtCvNKZQB2Af5uh0UgAA
```

### 3. VITE_MERCADO_PAGO_PUBLIC_KEY
```
APP_USR-fb95c179-bdd7-46a6-8b44-3bae67a7f72e
```

---

## 📋 Como adicionar na Vercel:

### Opção 1: Via Dashboard (Recomendado)

1. **Acesse**: https://vercel.com/dashboard
2. **Selecione** seu projeto (estudos-cursinho ou o nome que você deu)
3. **Vá em**: Settings → Environment Variables
4. **Para cada variável**:
   - Clique em "Add New"
   - Name: Cole o nome da variável (ex: `VITE_SUPABASE_URL`)
   - Value: Cole o valor correspondente
   - Environment: Selecione **Production**, **Preview**, e **Development**
   - Clique em "Save"

5. **Depois de adicionar todas**, vá em:
   - Deployments → Clique nos 3 pontinhos do último deployment → Redeploy

### Opção 2: Via CLI (Alternativa)

Se você tem a Vercel CLI instalada:

```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Fazer login
vercel login

# Adicionar variáveis
vercel env add VITE_SUPABASE_URL production
# Cole: https://bzahiysaveiyfwdegzmk.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YWhpeXNhdmVpeWZ3ZGVnem1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTY1ODksImV4cCI6MjA5MjEzMjU4OX0.WU8MLrwRGXc5d7Rh5AFvp0tKtCvNKZQB2Af5uh0UgAA

vercel env add VITE_MERCADO_PAGO_PUBLIC_KEY production
# Cole: APP_USR-fb95c179-bdd7-46a6-8b44-3bae67a7f72e

# Fazer redeploy
vercel --prod
```

---

## ✅ Checklist

- [ ] Variável `VITE_SUPABASE_URL` adicionada
- [ ] Variável `VITE_SUPABASE_ANON_KEY` adicionada
- [ ] Variável `VITE_MERCADO_PAGO_PUBLIC_KEY` adicionada
- [ ] Redeploy feito na Vercel
- [ ] Site acessível e funcionando

---

## 🧪 Testar depois do deploy

1. Acesse seu site na Vercel
2. Abra o Console do navegador (F12)
3. Verifique se não há erros de "undefined" nas variáveis de ambiente
4. Tente acessar a página de checkout

Se tudo estiver correto, você deve conseguir:
- ✅ Ver a landing page
- ✅ Acessar /checkout
- ✅ Ver o formulário de email

---

## 🆘 Problemas?

### "Cannot read property of undefined"
- As variáveis não foram configuradas corretamente
- Verifique se os nomes estão EXATAMENTE como mostrado (com VITE_ no início)
- Faça redeploy após adicionar as variáveis

### "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Verifique se a ANON_KEY está correta

### Checkout não funciona
- Verifique se a Public Key do Mercado Pago está correta
- Abra o Console do navegador para ver erros específicos

---

**Próximo passo**: Depois de configurar, teste o fluxo completo de pagamento! 🎉
