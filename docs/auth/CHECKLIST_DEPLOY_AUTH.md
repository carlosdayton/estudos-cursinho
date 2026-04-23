# ✅ Checklist de Deploy - Correção de Autenticação

## 📋 Pré-Deploy (Já Concluído)
- ✅ Código atualizado em `src/context/AuthContext.tsx`
- ✅ Variável `VITE_APP_URL` adicionada ao `.env` local
- ✅ Documentação criada
- ✅ Testes executados e passando

## 🚀 Deploy no Vercel

### 1. Configurar Variável de Ambiente
- [ ] Acessar [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Selecionar o projeto **foco-enem-curso**
- [ ] Ir em **Settings** → **Environment Variables**
- [ ] Clicar em **Add New**
- [ ] Configurar:
  ```
  Nome: VITE_APP_URL
  Valor: https://foco-enem-curso.vercel.app
  ```
- [ ] Marcar todos os ambientes:
  - [x] Production
  - [x] Preview
  - [x] Development

### 2. Fazer Redeploy
- [ ] Ir para a aba **Deployments**
- [ ] Clicar nos três pontos (...) do último deployment
- [ ] Selecionar **Redeploy**
- [ ] Aguardar o deploy completar (geralmente 1-2 minutos)

## 🔐 Configurar Supabase

### 1. Adicionar Redirect URLs
- [ ] Acessar [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Selecionar o projeto
- [ ] Ir em **Authentication** → **URL Configuration**
- [ ] Em **Redirect URLs**, adicionar:
  ```
  https://foco-enem-curso.vercel.app
  http://localhost:5173
  ```
- [ ] Clicar em **Save**

### 2. Configurar Site URL
- [ ] Na mesma página (**URL Configuration**)
- [ ] Em **Site URL**, definir:
  ```
  https://foco-enem-curso.vercel.app
  ```
- [ ] Clicar em **Save**

## 🧪 Testes em Produção

### Teste 1: Magic Link (Login)
- [ ] Acessar https://foco-enem-curso.vercel.app
- [ ] Clicar em **"Já tenho login"**
- [ ] Inserir um email válido cadastrado
- [ ] Verificar o email recebido
- [ ] Clicar no link de login
- [ ] **Verificar:** Deve redirecionar para `/dashboard` (não para localhost)
- [ ] **Verificar:** Deve estar logado e ver o dashboard

### Teste 2: Recuperação de Senha
- [ ] Acessar https://foco-enem-curso.vercel.app
- [ ] Clicar em **"Já tenho login"**
- [ ] Clicar em **"Esqueci minha senha"**
- [ ] Inserir um email válido
- [ ] Verificar o email recebido
- [ ] Clicar no link de recuperação
- [ ] **Verificar:** Deve redirecionar para a página de redefinição de senha (não para localhost)

### Teste 3: Novo Cadastro
- [ ] Acessar https://foco-enem-curso.vercel.app
- [ ] Clicar em **"Criar conta grátis"**
- [ ] Preencher email e senha
- [ ] Criar conta
- [ ] Verificar o email de confirmação
- [ ] Clicar no link de confirmação
- [ ] **Verificar:** Deve redirecionar para a aplicação (não para localhost)

## 🐛 Troubleshooting

### Problema: Ainda redireciona para localhost
**Solução:**
1. Verificar se a variável `VITE_APP_URL` está configurada no Vercel
2. Confirmar que você fez o redeploy após adicionar a variável
3. Limpar cache do navegador (Ctrl+Shift+Delete)
4. Tentar em uma janela anônima

### Problema: "Invalid redirect URL"
**Solução:**
1. Verificar se a URL está nos **Redirect URLs** do Supabase
2. Confirmar que a URL está exatamente igual (com/sem barra final)
3. Aguardar 2-3 minutos para as configurações propagarem
4. Tentar novamente

### Problema: Magic link não funciona
**Solução:**
1. Verificar se o email está confirmado no Supabase
2. Confirmar que o **Site URL** está configurado corretamente
3. Verificar a caixa de spam
4. Tentar com um email diferente

## 📝 Notas Importantes

### URLs Corretas
- ✅ Produção: `https://foco-enem-curso.vercel.app`
- ✅ Desenvolvimento: `http://localhost:5173`
- ❌ Não usar: `localhost` sem protocolo
- ❌ Não usar: URLs com barra final `/`

### Variáveis de Ambiente no Vercel
Certifique-se de que todas as variáveis estão configuradas:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MERCADO_PAGO_PUBLIC_KEY`
- `VITE_APP_URL` ← **NOVA**

### Tempo de Propagação
- Vercel: Imediato após redeploy
- Supabase: 1-2 minutos após salvar

## ✅ Conclusão

Após completar todos os itens deste checklist:
- [ ] Marcar todos os testes como concluídos
- [ ] Documentar qualquer problema encontrado
- [ ] Confirmar que o sistema está funcionando em produção

---

**Data de Deploy:** _____________  
**Responsável:** _____________  
**Status:** [ ] Pendente [ ] Em Progresso [ ] Concluído
