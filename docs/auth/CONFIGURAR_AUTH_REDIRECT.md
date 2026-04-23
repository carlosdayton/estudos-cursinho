# Configuração de Redirecionamento de Autenticação

## Problema Resolvido
O sistema estava redirecionando para `localhost` após o login via magic link porque o código usava `window.location.origin` diretamente, que em produção ainda apontava para localhost.

## Solução Implementada
Adicionamos a variável de ambiente `VITE_APP_URL` que define explicitamente a URL da aplicação para redirecionamentos de autenticação.

## Configuração no Vercel

### 1. Acesse as Configurações do Projeto
1. Vá para o dashboard do Vercel
2. Selecione seu projeto
3. Clique em **Settings** → **Environment Variables**

### 2. Adicione a Variável de Ambiente
Adicione a seguinte variável:

**Nome:** `VITE_APP_URL`  
**Valor:** `https://seu-dominio.vercel.app` (substitua pela URL real do seu projeto)

**Importante:** 
- Use a URL completa com `https://`
- Não adicione barra no final (sem `/` no final)
- Exemplo: `https://foco-enem.vercel.app`

### 3. Ambientes
Configure a variável para todos os ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Redeploy
Após adicionar a variável:
1. Vá para a aba **Deployments**
2. Clique nos três pontos do último deployment
3. Selecione **Redeploy**

## Configuração no Supabase

### 1. Adicione a URL aos Redirect URLs Permitidos
1. Acesse o dashboard do Supabase
2. Vá para **Authentication** → **URL Configuration**
3. Em **Redirect URLs**, adicione:
   - `https://seu-dominio.vercel.app` (produção)
   - `http://localhost:5173` (desenvolvimento)

### 2. Configure o Site URL
Em **Site URL**, defina:
- `https://seu-dominio.vercel.app`

## Verificação

Após configurar:

1. **Teste o Magic Link:**
   - Acesse a landing page em produção
   - Clique em "Já tenho login"
   - Insira seu email
   - Verifique o email recebido
   - Clique no link de login
   - ✅ Deve redirecionar para `https://seu-dominio.vercel.app/dashboard`

2. **Teste a Recuperação de Senha:**
   - Clique em "Esqueci minha senha"
   - Insira seu email
   - Verifique o email recebido
   - Clique no link de recuperação
   - ✅ Deve redirecionar para `https://seu-dominio.vercel.app`

## Desenvolvimento Local

Para desenvolvimento local, o `.env` já está configurado com:
```env
VITE_APP_URL=http://localhost:5173
```

Isso garante que os redirecionamentos funcionem corretamente tanto em desenvolvimento quanto em produção.

## Troubleshooting

### Ainda redireciona para localhost
- Verifique se a variável `VITE_APP_URL` está configurada no Vercel
- Confirme que você fez o redeploy após adicionar a variável
- Limpe o cache do navegador e tente novamente

### Erro "Invalid redirect URL"
- Verifique se a URL está adicionada nos **Redirect URLs** do Supabase
- Confirme que a URL está exatamente igual (com/sem barra final)
- Aguarde alguns minutos para as configurações do Supabase propagarem

### Magic link não funciona
- Verifique se o email está confirmado no Supabase
- Confirme que o **Site URL** está configurado corretamente
- Teste com um email diferente para descartar problemas de cache
