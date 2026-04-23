<div align="center">

# 🎓 Foco ENEM

**Seu sistema de estudos inteligente para o ENEM**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ O que é

O **Foco ENEM** é uma aplicação web para organizar e acompanhar seus estudos com foco total no ENEM. Tudo roda no navegador — sem cadastro, sem servidor, sem complicação. Seus dados ficam salvos localmente e você acessa de qualquer lugar.

---

## 🚀 Funcionalidades

### 📚 Matérias e Tópicos
- Crie matérias com cores personalizadas
- Adicione tópicos dentro de cada matéria
- Marque **Teoria Concluída** e **Exercícios Feitos** separadamente
- Barra de progresso individual por matéria e progresso global no topo

### 🔁 Revisão Espaçada
- Ao concluir um tópico, o sistema agenda automaticamente a próxima revisão
- Algoritmo adaptativo: tópicos difíceis revisam mais cedo, fáceis mais tarde
- Painel de revisões com alertas de tópicos vencidos

### 📅 Organização e Planejamento
- **Meta de data** — defina a data do ENEM ou outra prova com contagem regressiva em dias
- **Horas diárias** — configure quantas horas estudar em cada dia da semana
- **Prioridade por matéria** — marque nível de prioridade (baixa/média/alta) e dificuldade pessoal
- **Cronograma semanal automático** — grade gerada com distribuição proporcional 3:2:1 por prioridade
- **PaceIndicator** — indicador de ritmo mostrando se você vai cobrir tudo antes da prova

### ⏱️ Pomodoro Timer
- Timer integrado com sessões de foco e pausas configuráveis
- Contador de sessões completadas

### 📊 Estatísticas
- Streak de dias consecutivos de estudo
- Total de tópicos concluídos e horas estimadas
- Histórico de simulados com notas por área (Linguagens, Humanas, Natureza, Matemática, Redação)
- Gráfico de evolução dos simulados ao longo do tempo

### ⏳ Contagem Regressiva ENEM
- Contador em tempo real (dias, horas, minutos, segundos) até o ENEM 2026
- Barra de progresso do ano letivo

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 + TypeScript | Interface e lógica de componentes |
| Vite 8 | Build e dev server |
| Tailwind CSS | Estilização e layout responsivo |
| Framer Motion | Animações e transições |
| Lucide React | Ícones |
| fast-check | Testes de propriedade (property-based testing) |
| Vitest + Testing Library | Testes unitários |

---

## 💾 Persistência

Todos os dados são salvos no **localStorage** do navegador — nenhuma informação sai do seu dispositivo. Ao recarregar a página, tudo é restaurado automaticamente.

Chaves utilizadas:
- `subjects` — matérias e tópicos
- `simulados` — histórico de simulados
- `study-planning-goal` — meta de data e horas diárias
- `study-planning-priorities` — prioridades por matéria

---

## 🏃 Rodando localmente

### Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Conta Supabase** - [Criar conta gratuita](https://supabase.com)
3. **Conta Mercado Pago** - [Criar conta de desenvolvedor](https://www.mercadopago.com.br/developers)

### Configuração

```bash
# Clone o repositório
git clone https://github.com/carlosdayton/estudos-cursinho.git
cd estudos-cursinho

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### Variáveis de Ambiente

Edite o arquivo `.env` com as seguintes credenciais:

#### Supabase
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto → **Settings** → **API**
3. Copie:
   - `VITE_SUPABASE_URL`: Project URL
   - `VITE_SUPABASE_ANON_KEY`: Project API keys → anon public

#### Mercado Pago
1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/credentials)
2. Copie sua **Public Key** (use Test credentials para desenvolvimento)
3. Configure `VITE_MERCADO_PAGO_PUBLIC_KEY` no arquivo `.env`

### Executar o Projeto

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`

```bash
# Rodar os testes
npm test

# Gerar build de produção
npm run build
```

### Configuração do Backend (Webhook Handler)

Para processar pagamentos, você precisa configurar o Supabase Edge Function. Veja as instruções completas em:

📄 **[supabase/functions/webhook-handler/README.md](supabase/functions/webhook-handler/README.md)**

Resumo dos passos:
1. Instalar Supabase CLI: `npm install -g supabase`
2. Linkar seu projeto: `supabase link --project-ref your-project-ref`
3. Configurar secrets do Mercado Pago
4. Deploy da função: `supabase functions deploy webhook-handler`
5. Configurar webhook no painel do Mercado Pago

### Deploy para Produção

Para instruções completas de deployment (incluindo database setup, Edge Functions, frontend, e configuração do Mercado Pago), consulte:

📄 **[DEPLOYMENT.md](DEPLOYMENT.md)**

---

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── Dashboard.tsx          # Componente raiz da aplicação
│   ├── SubjectCard.tsx        # Card de cada matéria
│   ├── TopicItem.tsx          # Item de tópico com checkboxes
│   ├── StudyPlannerPanel.tsx  # Módulo de planejamento
│   ├── GoalConfigSection.tsx  # Configuração de meta e horas
│   ├── PriorityConfigSection.tsx # Prioridade por matéria
│   ├── WeeklyScheduleGrid.tsx # Grade semanal
│   ├── PaceIndicatorCard.tsx  # Indicador de ritmo
│   ├── RevisionPanel.tsx      # Painel de revisões
│   ├── PomodoroTimer.tsx      # Timer Pomodoro
│   ├── SimuladosTracker.tsx   # Registro de simulados
│   └── StatsPanel.tsx         # Painel de estatísticas
├── hooks/
│   ├── useLocalStorage.ts     # Persistência no localStorage
│   ├── useSubjects.ts         # Estado das matérias
│   ├── useStudyPlanning.ts    # Estado do planejamento
│   ├── useRevisions.ts        # Lógica de revisões
│   ├── useSimulados.ts        # Estado dos simulados
│   └── usePomodoroTimer.ts    # Lógica do Pomodoro
└── utils/
    ├── studyLogic.ts          # Interfaces e cálculos de progresso/revisão
    ├── plannerTypes.ts        # Tipos do módulo de planejamento
    └── plannerEngine.ts       # Motor de cálculo do cronograma
```

---

<div align="center">
  Feito com foco total. Bons estudos. 🚀
</div>
