# 🚀 Comandos para Deploy

## Passo a Passo Completo

### 1. Verificar Status do Git

```bash
git status
```

Você deve ver os arquivos modificados em vermelho.

### 2. Adicionar Todos os Arquivos

```bash
git add .
```

### 3. Fazer Commit

```bash
git commit -m "feat: substituir magic link por login com email e senha"
```

### 4. Push para o Repositório

```bash
git push origin main
```

**Ou se sua branch principal for `master`:**

```bash
git push origin master
```

### 5. Aguardar Deploy

A Vercel vai detectar o push e fazer o deploy automaticamente.

Você pode acompanhar em: https://vercel.com/dashboard

O deploy leva cerca de **1-2 minutos**.

### 6. Testar em Produção

Após o deploy completar:

1. Acesse: https://foco-enem-curso.vercel.app
2. Clique em **"Já tenho acesso"**
3. Insira seu email e senha
4. Clique em **"Entrar"**
5. **Deve ir direto para o dashboard!** ✅

---

## Comandos Resumidos (Copiar e Colar)

```bash
# Adicionar, commitar e fazer push
git add .
git commit -m "feat: login com email e senha"
git push origin main
```

---

## Se Encontrar Problemas

### Problema: "nothing to commit"

**Solução:** Os arquivos já foram commitados. Apenas faça:

```bash
git push origin main
```

### Problema: "Your branch is up to date"

**Solução:** Verifique se salvou os arquivos. Depois:

```bash
git add .
git commit -m "feat: login com email e senha"
git push origin main
```

### Problema: "Permission denied"

**Solução:** Configure suas credenciais do Git:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### Problema: "fatal: not a git repository"

**Solução:** Você não está na pasta do projeto. Navegue até ela:

```bash
cd caminho/para/seu/projeto
```

---

## Verificar se Funcionou

Após o push, você pode verificar:

1. **No GitHub/GitLab:**
   - Acesse seu repositório
   - Veja se o commit apareceu

2. **Na Vercel:**
   - Acesse: https://vercel.com/dashboard
   - Vá em "Deployments"
   - Veja o status do deploy

3. **Em Produção:**
   - Acesse: https://foco-enem-curso.vercel.app
   - Teste o login

---

## Tudo Pronto! 🎉

Após executar os comandos acima, seu sistema estará funcionando com o novo fluxo de login!

**Não precisa mais:**
- ❌ Configurar VITE_APP_URL
- ❌ Configurar Redirect URLs no Supabase
- ❌ Esperar email de magic link

**Agora é só:**
- ✅ Email + Senha
- ✅ Login instantâneo
- ✅ Funciona sempre!
