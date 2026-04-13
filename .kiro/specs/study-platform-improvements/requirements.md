# Documento de Requisitos

## Introdução

Este documento descreve os requisitos funcionais e não-funcionais para as melhorias da plataforma de estudos "Foco ENEM" — uma aplicação React + TypeScript + Vite com persistência via `localStorage`. Os requisitos são derivados do design técnico aprovado e cobrem três eixos: otimizações de performance, melhorias de UX/UI e refatoração de arquitetura.

---

## Glossário

- **System**: A aplicação "Foco ENEM" como um todo
- **Dashboard**: Componente raiz de apresentação que orquestra todos os painéis
- **SubjectCard**: Componente que representa uma matéria e seus tópicos
- **TopicItem**: Componente que representa um tópico individual dentro de uma matéria
- **PomodoroTimer**: Componente de temporizador Pomodoro
- **RevisionPanel**: Componente que exibe tópicos com revisão pendente
- **SimuladosTracker**: Componente de rastreamento de simulados do ENEM
- **StatsPanel**: Novo componente de painel de estatísticas consolidadas
- **ErrorBoundary**: Componente de captura e tratamento de erros de renderização
- **useSubjects**: Hook centralizado de gerenciamento de matérias
- **useSimulados**: Hook centralizado de gerenciamento de simulados
- **usePomodoroTimer**: Hook extraído da lógica do temporizador Pomodoro
- **useRevisions**: Hook de gerenciamento de revisões pendentes e futuras
- **useLocalStorage**: Hook de persistência de estado no `localStorage`
- **Topic**: Estrutura de dados representando um tópico de estudo
- **Subject**: Estrutura de dados representando uma matéria
- **Simulado**: Estrutura de dados representando um simulado realizado
- **AppSettings**: Estrutura de dados de configurações globais da aplicação
- **SpacedRepetition**: Algoritmo de repetição espaçada adaptativa para cálculo de datas de revisão
- **StudyStreak**: Sequência de dias consecutivos com atividade de estudo registrada
- **Toast**: Notificação visual temporária exibida ao usuário após uma ação

---

## Requisitos

### Requisito 1: Extração da Lógica de Matérias para Hook Centralizado

**User Story:** Como desenvolvedor, quero que toda a lógica de gerenciamento de matérias esteja encapsulada no hook `useSubjects`, para que o `Dashboard` seja um componente de apresentação sem lógica de negócio.

#### Critérios de Aceitação

1. THE `useSubjects` SHALL encapsular o `useLocalStorage` para persistência das matérias sob a chave `enem-study-data`
2. THE `useSubjects` SHALL expor as funções `addSubject`, `updateSubject`, `deleteSubject`, `updateTopic` e `removeTopic`
3. THE `useSubjects` SHALL calcular e expor `overallProgress`, `totalTopics` e `completedTopics` via `useMemo`
4. WHEN `updateTopic` é chamado com um patch parcial, THE `useSubjects` SHALL aplicar a atualização de forma imutável sem mutar o array original
5. THE `Dashboard` SHALL consumir `useSubjects` em vez de gerenciar o estado de matérias diretamente

---

### Requisito 2: Extração da Lógica de Simulados para Hook Centralizado

**User Story:** Como desenvolvedor, quero que toda a lógica de gerenciamento de simulados esteja encapsulada no hook `useSimulados`, para que o `SimuladosTracker` seja um componente de apresentação.

#### Critérios de Aceitação

1. THE `useSimulados` SHALL encapsular o `useLocalStorage` para persistência dos simulados sob a chave `enem-simulados-data`
2. THE `useSimulados` SHALL expor as funções `addSimulado` e `deleteSimulado`
3. THE `useSimulados` SHALL calcular e expor `averageScore`, `bestScore` e `trend` via `useMemo`
4. WHEN `trend` é calculado, THE `useSimulados` SHALL retornar `'up'` se a média dos últimos 3 simulados for maior que a média anterior, `'down'` se for menor, e `'stable'` caso contrário
5. WHEN `addSimulado` é chamado com scores válidos, THE `useSimulados` SHALL calcular o `total` como a soma de todas as áreas e persistir o simulado

---

### Requisito 3: Extração da Lógica do Pomodoro para Hook Dedicado

**User Story:** Como desenvolvedor, quero que toda a lógica do temporizador Pomodoro esteja encapsulada no hook `usePomodoroTimer`, para que o `PomodoroTimer` seja um componente de apresentação.

#### Critérios de Aceitação

1. THE `usePomodoroTimer` SHALL gerenciar o `setInterval` usando `useRef` para evitar closure stale
2. THE `usePomodoroTimer` SHALL expor `minutes`, `seconds`, `isActive`, `mode`, `sessionsCompleted`, `formattedTime` e `progress`
3. THE `usePomodoroTimer` SHALL expor as funções `start`, `pause`, `reset` e `switchMode`
4. WHEN o timer chega a zero no modo `'work'`, THE `usePomodoroTimer` SHALL incrementar `sessionsCompleted`, alternar para o modo `'break'` e definir `isActive` como `false`
5. WHEN o timer chega a zero no modo `'break'`, THE `usePomodoroTimer` SHALL alternar para o modo `'work'` e definir `isActive` como `false`
6. THE `usePomodoroTimer` SHALL persistir `sessionsCompleted` no `localStorage`
7. WHEN o timer chega a zero, THE `usePomodoroTimer` SHALL disparar uma notificação via `Notification API` caso a permissão tenha sido concedida
8. THE `usePomodoroTimer` SHALL expor `progress` como um valor entre 0 e 100 representando o percentual do tempo decorrido na sessão atual

---

### Requisito 4: Hook de Revisões com Suporte a Revisões Futuras

**User Story:** Como estudante, quero visualizar tanto as revisões vencidas quanto as revisões dos próximos 7 dias, para que eu possa planejar minha semana de estudos.

#### Critérios de Aceitação

1. THE `useRevisions` SHALL calcular `reviewsDue` como todos os tópicos cuja `reviewDate` seja menor ou igual à data atual
2. THE `useRevisions` SHALL calcular `upcomingReviews` como todos os tópicos cuja `reviewDate` esteja entre amanhã e os próximos 7 dias
3. THE `useRevisions` SHALL expor a função `markReviewed` que atualiza `lastReviewedAt` do tópico e recalcula a próxima `reviewDate` usando o algoritmo de repetição espaçada
4. WHEN `markReviewed` é chamado, THE `useRevisions` SHALL incrementar `reviewCount` do tópico
5. THE `useRevisions` SHALL calcular `daysOverdue` para cada item em `reviewsDue` como a diferença em dias entre a data atual e a `reviewDate`

---

### Requisito 5: Algoritmo de Repetição Espaçada Adaptativa

**User Story:** Como estudante, quero que o intervalo de revisão de cada tópico seja calculado com base na minha dificuldade percebida e no número de revisões realizadas, para que eu revise mais frequentemente o que é difícil.

#### Critérios de Aceitação

1. THE `calculateSpacedRepetitionDate` SHALL aceitar um `Topic` e uma `completionDate` como entrada e retornar uma data ISO futura
2. WHEN `topic.difficulty` é `'easy'`, THE `calculateSpacedRepetitionDate` SHALL aplicar um multiplicador de `1.5` sobre o intervalo base de 15 dias
3. WHEN `topic.difficulty` é `'hard'`, THE `calculateSpacedRepetitionDate` SHALL aplicar um multiplicador de `0.7` sobre o intervalo base de 15 dias
4. WHEN `topic.difficulty` é `'medium'` ou indefinido, THE `calculateSpacedRepetitionDate` SHALL aplicar um multiplicador de `1.0`
5. THE `calculateSpacedRepetitionDate` SHALL aplicar um fator de repetição de `1.0 + (reviewCount * 0.3)` sobre o intervalo calculado
6. THE `calculateSpacedRepetitionDate` SHALL garantir que o intervalo final esteja sempre entre 3 e 60 dias (inclusive)
7. IF `completionDate` não for uma string ISO válida, THEN THE `calculateSpacedRepetitionDate` SHALL lançar um erro descritivo

---

### Requisito 6: Algoritmo de Streak de Estudos

**User Story:** Como estudante, quero ver minha sequência de dias consecutivos de estudo, para que eu me mantenha motivado a estudar todos os dias.

#### Critérios de Aceitação

1. THE `calculateStudyStreak` SHALL aceitar um array de `Subject[]` e retornar um número inteiro não-negativo
2. THE `calculateStudyStreak` SHALL coletar todas as datas únicas (no formato `YYYY-MM-DD`) em que pelo menos um tópico foi concluído
3. WHEN a data mais recente de atividade não é hoje nem ontem, THE `calculateStudyStreak` SHALL retornar `0`
4. WHEN não há nenhum tópico concluído, THE `calculateStudyStreak` SHALL retornar `0`
5. THE `calculateStudyStreak` SHALL contar dias consecutivos retroativamente a partir da data mais recente de atividade

---

### Requisito 7: Painel de Estatísticas Consolidadas (StatsPanel)

**User Story:** Como estudante, quero visualizar minhas métricas de desempenho consolidadas em um único painel, para que eu tenha uma visão clara do meu progresso geral.

#### Critérios de Aceitação

1. THE `StatsPanel` SHALL exibir o streak de dias consecutivos de estudo calculado a partir de `completedAt` dos tópicos
2. THE `StatsPanel` SHALL exibir as horas de foco acumuladas calculadas como `sessionsCompleted × 25` minutos
3. THE `StatsPanel` SHALL exibir o número de tópicos concluídos na semana atual
4. THE `StatsPanel` SHALL exibir a evolução da nota média nos simulados em formato de sparkline
5. WHEN não há dados suficientes para calcular uma métrica, THE `StatsPanel` SHALL exibir `0` ou um estado vazio descritivo

---

### Requisito 8: Tratamento de Erros com ErrorBoundary

**User Story:** Como usuário, quero que erros em componentes individuais não derrubem toda a aplicação, para que eu não perca meu progresso de estudo.

#### Critérios de Aceitação

1. THE `ErrorBoundary` SHALL capturar exceções não tratadas em componentes filhos durante a renderização
2. WHEN um erro é capturado, THE `ErrorBoundary` SHALL exibir um fallback amigável em vez da tela em branco
3. WHERE um `fallback` customizado é fornecido via props, THE `ErrorBoundary` SHALL renderizar o fallback customizado
4. WHEN nenhum `fallback` é fornecido, THE `ErrorBoundary` SHALL renderizar um fallback padrão com botão "Recarregar"
5. THE `ErrorBoundary` SHALL envolver os componentes `SubjectCard` e `TopicItem` no `Dashboard`

---

### Requisito 9: Persistência com Debounce no useLocalStorage

**User Story:** Como desenvolvedor, quero que as escritas no `localStorage` sejam debounced em 300ms, para que digitação rápida não cause escritas excessivas e prejudique a performance.

#### Critérios de Aceitação

1. THE `useLocalStorage` SHALL atrasar a persistência em `localStorage` por 300ms após a última mudança de estado
2. WHEN uma nova mudança de estado ocorre antes dos 300ms expirarem, THE `useLocalStorage` SHALL cancelar o timer anterior e reiniciar a contagem
3. WHEN o componente é desmontado antes dos 300ms expirarem, THE `useLocalStorage` SHALL cancelar o timer pendente para evitar memory leaks
4. IF `localStorage.setItem` lançar `QuotaExceededError`, THEN THE `useLocalStorage` SHALL capturar o erro, exibir um toast de aviso e manter o estado em memória

---

### Requisito 10: Memoização de Componentes e Callbacks

**User Story:** Como desenvolvedor, quero que componentes e callbacks sejam memoizados adequadamente, para que re-renders desnecessários sejam eliminados e a performance seja melhorada.

#### Critérios de Aceitação

1. THE `SubjectCard` SHALL ser envolvido com `React.memo` para evitar re-renders quando props não mudam
2. THE `TopicItem` SHALL ser envolvido com `React.memo` para re-renderizar apenas quando o próprio `topic` muda
3. THE `Dashboard` SHALL usar `useCallback` para os callbacks `updateSubject` e `deleteSubject` passados como props
4. WHEN `SimuladosTracker` e `StatsPanel` são importados no `Dashboard`, THE `Dashboard` SHALL usar `React.lazy` para carregamento lazy desses componentes

---

### Requisito 11: Modelos de Dados Expandidos

**User Story:** Como desenvolvedor, quero que as interfaces `Topic`, `Subject` e `Simulado` sejam expandidas com novos campos opcionais, para que funcionalidades futuras possam ser suportadas sem breaking changes.

#### Critérios de Aceitação

1. THE `Topic` interface SHALL incluir os campos opcionais `difficulty: 'easy' | 'medium' | 'hard'`, `reviewCount: number` e `lastReviewedAt: string`
2. THE `Subject` interface SHALL incluir os campos opcionais `icon: string`, `order: number` e `targetTopics: number`
3. THE `Simulado` interface SHALL incluir os campos opcionais `label: string` e `notes: string`
4. THE System SHALL definir a interface `AppSettings` com os campos `pomodoroWorkMinutes`, `pomodoroBreakMinutes`, `reviewIntervalDays`, `notificationsEnabled`, `theme` e `enemDate`
5. WHEN campos opcionais estão ausentes, THE System SHALL tratar sua ausência com valores padrão sem lançar erros

---

### Requisito 12: Feedback Visual com Toast Notifications

**User Story:** Como usuário, quero receber notificações visuais temporárias após realizar ações importantes, para que eu tenha confirmação imediata de que a ação foi executada com sucesso.

#### Critérios de Aceitação

1. WHEN um tópico é marcado como concluído (teoria + exercícios), THE System SHALL exibir um toast de sucesso
2. WHEN um simulado é salvo, THE System SHALL exibir um toast de confirmação
3. WHEN uma matéria é excluída, THE System SHALL exibir um toast informativo
4. THE System SHALL implementar toasts usando `framer-motion` sem adicionar dependências externas de runtime
5. WHEN um toast é exibido, THE System SHALL removê-lo automaticamente após um intervalo de tempo definido

---

### Requisito 13: Modal de Confirmação para Exclusão

**User Story:** Como usuário, quero que exclusões sejam confirmadas por um modal customizado, para que eu não exclua matérias ou simulados acidentalmente.

#### Critérios de Aceitação

1. WHEN o usuário solicita a exclusão de uma matéria, THE System SHALL exibir um modal de confirmação customizado em vez de `window.confirm`
2. WHEN o usuário confirma a exclusão no modal, THE System SHALL executar a exclusão e exibir um toast informativo
3. WHEN o usuário cancela no modal, THE System SHALL fechar o modal sem realizar nenhuma alteração
4. THE System SHALL implementar o modal usando `framer-motion` sem adicionar dependências externas de runtime

---

### Requisito 14: Acessibilidade (a11y)

**User Story:** Como usuário com necessidades de acessibilidade, quero que a aplicação seja utilizável com tecnologias assistivas, para que eu possa estudar independentemente de limitações físicas.

#### Critérios de Aceitação

1. THE System SHALL adicionar `aria-label` descritivo a todos os botões que não possuem texto visível
2. THE System SHALL associar todos os `<input>` a um `<label>` via `htmlFor`
3. WHEN o timer do Pomodoro muda de estado, THE `PomodoroTimer` SHALL anunciar a mudança via região `aria-live`
4. THE System SHALL garantir contraste mínimo de 4.5:1 (WCAG AA) para texto sobre fundos coloridos
5. WHILE `prefers-reduced-motion` estiver ativo no sistema operacional, THE System SHALL desabilitar ou reduzir animações de `framer-motion`

---

### Requisito 15: Responsividade Mobile

**User Story:** Como estudante mobile, quero que a aplicação seja utilizável em dispositivos com tela pequena, para que eu possa estudar de qualquer lugar.

#### Critérios de Aceitação

1. WHILE a largura da viewport for menor que 768px, THE System SHALL exibir todos os componentes em layout de coluna única
2. WHILE a largura da viewport for menor que 768px, THE `SubjectCard` SHALL iniciar no estado colapsado por padrão
3. WHILE a largura da viewport for menor que 768px, THE `PomodoroTimer` SHALL exibir uma versão compacta
4. WHILE a largura da viewport estiver entre 768px e 1024px, THE System SHALL exibir `SubjectCards` em grid de 2 colunas
5. WHILE a largura da viewport for maior que 1024px, THE System SHALL exibir `SubjectCards` em grid de 3 colunas

---

### Requisito 16: Tratamento de Erros de localStorage

**User Story:** Como usuário, quero que a aplicação continue funcionando mesmo quando o `localStorage` estiver indisponível ou cheio, para que eu não perca meu progresso de estudo.

#### Critérios de Aceitação

1. IF `localStorage.setItem` lançar `QuotaExceededError`, THEN THE `useLocalStorage` SHALL manter o estado em memória e exibir um toast de aviso ao usuário
2. IF `JSON.parse` falhar durante a inicialização do `useLocalStorage`, THEN THE `useLocalStorage` SHALL usar `initialValue` como fallback e registrar o erro no console
3. WHEN dados corrompidos são detectados e o `initialValue` é usado como fallback, THE `useLocalStorage` SHALL sobrescrever os dados corrompidos na próxima persistência bem-sucedida
