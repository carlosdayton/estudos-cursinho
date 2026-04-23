# 📚 Documentação - Foco ENEM

Bem-vindo à documentação completa do projeto **Foco ENEM**!

---

## 📂 Estrutura da Documentação

### 🔐 [Autenticação](./auth/)

Documentação sobre o sistema de autenticação e gerenciamento de usuários.

- [Botão "Esqueci minha senha"](./auth/BOTAO_ESQUECI_SENHA.md) - Implementação do botão de recuperação de senha
- [Checklist Deploy Auth](./auth/CHECKLIST_DEPLOY_AUTH.md) - Checklist para deploy de autenticação
- [Configurar Auth Redirect](./auth/CONFIGURAR_AUTH_REDIRECT.md) - Configuração de redirecionamentos
- [Configurar Reset Password](./auth/CONFIGURAR_RESET_PASSWORD.md) - Guia de configuração de redefinição de senha
- [Correção Magic Link](./auth/CORRECAO_MAGIC_LINK_FINAL.md) - Correções no sistema de magic link
- [Fluxo de Autenticação](./auth/FLUXO_AUTENTICACAO.md) - Fluxo completo de autenticação
- [Fluxo de Cadastro](./auth/FLUXO_CADASTRO_COMPLETO.md) - Fluxo completo de cadastro
- [Novo Fluxo de Login](./auth/NOVO_FLUXO_LOGIN.md) - Documentação do novo sistema de login
- [Relatório de Testes](./auth/RELATORIO_TESTES.md) - Testes completos do sistema de autenticação
- [Resumo Correção Auth](./auth/RESUMO_CORRECAO_AUTH.md) - Resumo das correções de autenticação
- [Resumo Mudança Login](./auth/RESUMO_MUDANCA_LOGIN.md) - Resumo das mudanças no login
- [Sistema de Redefinição de Senha](./auth/SISTEMA_REDEFINICAO_SENHA.md) - Sistema completo de reset de senha

### 🚀 [Deploy](./deploy/)

Guias e instruções para deploy da aplicação.

- [Comandos de Deploy](./deploy/COMANDOS_DEPLOY.md) - Comandos essenciais para deploy
- [Configurar Vercel](./deploy/CONFIGURAR_VERCEL.md) - Configuração da Vercel
- [Deploy Create Preference](./deploy/DEPLOY_CREATE_PREFERENCE.md) - Deploy da função de criar preferência
- [Deployment](./deploy/DEPLOYMENT.md) - Guia geral de deployment
- [Guia Deploy Backend](./deploy/GUIA_DEPLOY_BACKEND.md) - Deploy do backend
- [Status Deploy](./deploy/STATUS_DEPLOY.md) - Status atual do deploy
- [Próximos Passos Webhook](./deploy/PROXIMOS_PASSOS_WEBHOOK.md) - Próximos passos para webhooks

### 📖 [Guias](./guias/)

Guias gerais e documentação do projeto.

- [Branches](./guias/BRANCHES.md) - Estratégia de branches
- [Documentação do Projeto](./guias/documentacao_projeto.md) - Documentação geral
- [Guia de Princípios Backend](./guias/guia_principios_backend.md) - Princípios de desenvolvimento backend
- [Instruções Rápidas](./guias/INSTRUCOES_RAPIDAS.md) - Guia rápido de início

### 🖼️ [Assets](./assets/)

Imagens e recursos visuais da documentação.

- [Desktop View Logged In](./assets/desktop-view-logged-in.png) - Screenshot da view desktop logada

---

## 🎯 Links Rápidos

### Para Desenvolvedores

- 🔧 [Configuração Inicial](./guias/INSTRUCOES_RAPIDAS.md)
- 🚀 [Deploy Rápido](./deploy/COMANDOS_DEPLOY.md)
- 🔐 [Sistema de Auth](./auth/FLUXO_AUTENTICACAO.md)

### Para Testes

- ✅ [Relatório de Testes](./auth/RELATORIO_TESTES.md)
- 🧪 [Fluxo de Cadastro](./auth/FLUXO_CADASTRO_COMPLETO.md)

### Para Deploy

- 📦 [Guia de Deploy](./deploy/DEPLOYMENT.md)
- ⚙️ [Configurar Vercel](./deploy/CONFIGURAR_VERCEL.md)
- 📊 [Status Atual](./deploy/STATUS_DEPLOY.md)

---

## 🏗️ Arquitetura do Projeto

```
Foco ENEM
├── Frontend (React + TypeScript + Vite)
│   ├── Autenticação (Supabase Auth)
│   ├── Dashboard
│   ├── Matérias e Tópicos
│   ├── Pomodoro Timer
│   ├── Simulados
│   ├── Flashcards
│   └── Ciclos de Estudo
│
├── Backend (Supabase)
│   ├── Database (PostgreSQL)
│   ├── Auth
│   ├── Storage
│   └── Edge Functions
│
└── Pagamentos (Mercado Pago)
    ├── Checkout
    ├── Webhooks
    └── Assinaturas
```

---

## 🔑 Principais Funcionalidades

### ✅ Implementadas

- ✅ Sistema de autenticação completo (email + senha)
- ✅ Recuperação de senha
- ✅ Dashboard com estatísticas
- ✅ Gestão de matérias e tópicos
- ✅ Pomodoro Timer
- ✅ Sistema de revisões
- ✅ Simulados e análise
- ✅ Flashcards com repetição espaçada
- ✅ Ciclos de estudo
- ✅ Planner semanal
- ✅ Integração com Mercado Pago
- ✅ Sistema de assinaturas

### 🚧 Em Desenvolvimento

- 🚧 Notificações push
- 🚧 Modo offline
- 🚧 Exportação de dados

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: React 18
- **Linguagem**: TypeScript
- **Build Tool**: Vite
- **Estilização**: CSS-in-JS (inline styles)
- **Animações**: Framer Motion
- **Roteamento**: React Router v6
- **Ícones**: Lucide React

### Backend
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)

### Pagamentos
- **Gateway**: Mercado Pago
- **Webhooks**: Supabase Edge Functions

### Deploy
- **Frontend**: Vercel
- **Backend**: Supabase Cloud
- **CI/CD**: GitHub Actions + Vercel

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação relevante acima
2. Verifique os [guias rápidos](./guias/INSTRUCOES_RAPIDAS.md)
3. Revise o [relatório de testes](./auth/RELATORIO_TESTES.md)

---

## 📝 Contribuindo

Ao adicionar nova documentação:

1. Coloque no diretório apropriado (`auth/`, `deploy/`, `guias/`)
2. Use formato Markdown (.md)
3. Adicione link neste README
4. Mantenha a estrutura consistente

---

**Última atualização**: 23/04/2026
