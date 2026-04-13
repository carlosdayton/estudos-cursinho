# Plano de Implementação: Study Platform Improvements

## Visão Geral

Implementação incremental das melhorias da plataforma "Foco ENEM" em TypeScript/React. As tarefas seguem a ordem de dependência: tipos → lógica pura → hooks → componentes → integração. Cada etapa é validada antes de avançar.

## Tarefas

- [x] 1. Expandir modelos de dados em `studyLogic.ts`
  - Adicionar campos opcionais `difficulty`, `reviewCount` e `lastReviewedAt` à interface `Topic`
  - Adicionar campos opcionais `icon`, `order` e `targetTopics` à interface `Subject`
  - Adicionar campos opcionais `label` e `notes` à interface `Simulado`
  - Criar interface `SimuladoScores` separada e interface `AppSettings`
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 2. Implementar `calculateSpacedRepetitionDate` e `calculateStudyStreak` em `studyLogic.ts`
  - [x] 2.1 Implementar `calculateSpacedRepetitionDate(topic, completionDate)`
    - Substituir `calculateReviewDate` pela nova função com multiplicadores de dificuldade e fator de repetição
    - Aplicar clamp entre 3 e 60 dias
    - Lançar erro descritivo se `completionDate` não for ISO válida
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 2.2 Escrever property test para `calculateSpacedRepetitionDate`
    - **Property 11: calculateSpacedRepetitionDate sempre retorna data futura com intervalo no range [3, 60]**
    - **Validates: Requirements 5.1, 5.6**
    - **Property 12: Ordenação de intervalos por dificuldade é monotônica**
    - **Validates: Requirements 5.2, 5.3**
    - **Property 13: Intervalo cresce monotonicamente com reviewCount**
    - **Validates: Requirements 5.5**

  - [x] 2.3 Implementar `calculateStudyStreak(subjects)`
    - Coletar datas únicas `YYYY-MM-DD` de `completedAt` de todos os tópicos
    - Retornar 0 se não houver atividade hoje ou ontem
    - Contar dias consecutivos retroativamente
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 2.4 Escrever property test para `calculateStudyStreak`
    - **Property 14: calculateStudyStreak sempre retorna inteiro não-negativo**
    - **Validates: Requirements 6.1, 6.4**
    - **Property 15: Streak é exatamente o número de dias consecutivos a partir da atividade mais recente**
    - **Validates: Requirements 6.3, 6.5**

  - [ ]* 2.5 Escrever property test para `getProgress`
    - **Property 1: Progresso de matéria sempre no intervalo [0, 100]**
    - **Validates: Requirements 1.3**
    - **Property 17: Campos opcionais ausentes não causam erros**
    - **Validates: Requirements 11.5**

- [x] 3. Checkpoint — Instalar dependências de teste e garantir que os testes passam
  - Instalar `vitest`, `fast-check`, `@testing-library/react` e `@testing-library/user-event` como devDependencies
  - Configurar `vitest` no `vite.config.ts`
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas

- [x] 4. Melhorar `useLocalStorage` com debounce e tratamento de erros
  - [x] 4.1 Adicionar debounce de 300ms usando `useRef` + `setTimeout`
    - Cancelar timer anterior a cada nova mudança de estado
    - Limpar timer pendente no cleanup do `useEffect`
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 4.2 Tratar `QuotaExceededError` e JSON corrompido
    - Capturar `QuotaExceededError` no `setItem`, manter estado em memória e enfileirar toast de aviso
    - Capturar falha de `JSON.parse` na inicialização, usar `initialValue` como fallback e logar no console
    - _Requirements: 9.4, 16.1, 16.2, 16.3_

  - [ ]* 4.3 Escrever property test para debounce do `useLocalStorage`
    - **Property 18: Debounce garante no máximo uma escrita no localStorage para N mudanças rápidas**
    - **Validates: Requirements 9.2**

- [x] 5. Criar hook `useSubjects`
  - [x] 5.1 Criar `src/hooks/useSubjects.ts`
    - Encapsular `useLocalStorage` com chave `enem-study-data` e `DEFAULT_SUBJECTS`
    - Implementar `addSubject`, `updateSubject`, `deleteSubject`, `updateTopic` (patch imutável) e `removeTopic`
    - Calcular `overallProgress`, `totalTopics` e `completedTopics` via `useMemo`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 5.2 Escrever property test para `updateTopic`
    - **Property 2: Atualização imutável de tópico preserva os demais dados**
    - **Validates: Requirements 1.4**

- [x] 6. Criar hook `useSimulados`
  - [x] 6.1 Criar `src/hooks/useSimulados.ts`
    - Encapsular `useLocalStorage` com chave `enem-simulados-data`
    - Implementar `addSimulado` (calcula `total` como soma das áreas) e `deleteSimulado`
    - Calcular `averageScore`, `bestScore` e `trend` via `useMemo`
    - Lógica de `trend`: média dos últimos 3 vs. média anterior
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 6.2 Escrever property tests para `useSimulados`
    - **Property 3: bestScore é sempre maior ou igual a averageScore**
    - **Validates: Requirements 2.3**
    - **Property 4: trend sempre retorna um valor do domínio válido**
    - **Validates: Requirements 2.4**
    - **Property 5: total do simulado é sempre a soma exata das áreas**
    - **Validates: Requirements 2.5**

- [x] 7. Criar hook `usePomodoroTimer`
  - [x] 7.1 Criar `src/hooks/usePomodoroTimer.ts`
    - Gerenciar `setInterval` com `useRef` para evitar closure stale
    - Expor `minutes`, `seconds`, `isActive`, `mode`, `sessionsCompleted`, `formattedTime` e `progress` (0–100)
    - Expor funções `start`, `pause`, `reset` e `switchMode`
    - Ao chegar a zero no modo `'work'`: incrementar `sessionsCompleted`, alternar para `'break'`, setar `isActive = false`
    - Ao chegar a zero no modo `'break'`: alternar para `'work'`, setar `isActive = false`
    - Persistir `sessionsCompleted` no `localStorage`
    - Disparar `Notification API` se permissão concedida
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 7.2 Escrever property test para `progress` do Pomodoro
    - **Property 6: progress do Pomodoro sempre no intervalo [0, 100]**
    - **Validates: Requirements 3.8**

- [x] 8. Criar hook `useRevisions`
  - [x] 8.1 Criar `src/hooks/useRevisions.ts`
    - Receber `subjects` e `updateTopic` como parâmetros
    - Calcular `reviewsDue` (tópicos com `reviewDate <= hoje`) via `useMemo`
    - Calcular `upcomingReviews` (tópicos com `reviewDate` entre amanhã e +7 dias) via `useMemo`
    - Calcular `daysOverdue` para cada item em `reviewsDue`
    - Implementar `markReviewed`: atualiza `lastReviewedAt`, incrementa `reviewCount`, recalcula `reviewDate` via `calculateSpacedRepetitionDate`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 8.2 Escrever property tests para `useRevisions`
    - **Property 7: reviewsDue contém exatamente os tópicos com reviewDate vencida**
    - **Validates: Requirements 4.1**
    - **Property 8: upcomingReviews contém exatamente os tópicos dos próximos 7 dias**
    - **Validates: Requirements 4.2**
    - **Property 9: markReviewed incrementa reviewCount e define lastReviewedAt**
    - **Validates: Requirements 4.3, 4.4**
    - **Property 10: daysOverdue é sempre não-negativo para itens em reviewsDue**
    - **Validates: Requirements 4.5**

- [x] 9. Checkpoint — Garantir que todos os testes passam
  - Executar suite de testes completa
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas

- [x] 10. Criar sistema de Toast Notifications
  - [x] 10.1 Criar `src/components/Toast.tsx` e `src/hooks/useToast.ts`
    - Implementar componente `Toast` com animação via `framer-motion` (entrada/saída)
    - Implementar `ToastContainer` para renderizar lista de toasts
    - Implementar hook `useToast` com funções `showToast(message, type)` e remoção automática após intervalo
    - Respeitar `prefers-reduced-motion` nas animações
    - _Requirements: 12.4, 12.5, 14.5_

  - [x] 10.2 Criar `src/context/ToastContext.tsx`
    - Criar contexto React para disponibilizar `showToast` globalmente
    - Envolver `App` com `ToastProvider`
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 11. Criar componente `ConfirmModal`
  - Criar `src/components/ConfirmModal.tsx`
  - Implementar modal com animação via `framer-motion`
  - Aceitar props `isOpen`, `message`, `onConfirm` e `onCancel`
  - Respeitar `prefers-reduced-motion`
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 12. Criar componente `ErrorBoundary`
  - Criar `src/components/ErrorBoundary.tsx` como class component
  - Capturar erros via `componentDidCatch` e `getDerivedStateFromError`
  - Renderizar `fallback` customizado se fornecido, ou fallback padrão com botão "Recarregar"
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 13. Criar componente `StatsPanel`
  - [x] 13.1 Criar `src/components/StatsPanel.tsx`
    - Aceitar props `subjects`, `simulados` e `pomodoroSessions`
    - Exibir streak calculado via `calculateStudyStreak`
    - Exibir horas de foco como `sessionsCompleted × 25` minutos
    - Exibir tópicos concluídos na semana atual
    - Exibir sparkline da evolução da nota média dos simulados (SVG inline)
    - Exibir `0` ou estado vazio descritivo quando não há dados
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 13.2 Escrever property test para horas de foco no `StatsPanel`
    - **Property 16: Horas de foco exibidas no StatsPanel são sessionsCompleted × 25 minutos**
    - **Validates: Requirements 7.2**

- [x] 14. Aplicar memoização em `SubjectCard` e `TopicItem`
  - Envolver `SubjectCard` com `React.memo`
  - Envolver `TopicItem` com `React.memo`
  - Adicionar `aria-label` descritivo a todos os botões sem texto visível em ambos os componentes
  - Adicionar `aria-live` region no `PomodoroTimer` para anunciar mudanças de estado
  - Garantir que todos os `<input>` têm `<label>` associado via `htmlFor`
  - _Requirements: 10.1, 10.2, 14.1, 14.2, 14.3_

- [x] 15. Refatorar `Dashboard` para consumir os novos hooks e integrar todos os componentes
  - [x] 15.1 Substituir estado local de matérias por `useSubjects`
    - Remover `useLocalStorage` direto do `Dashboard`
    - Usar `useCallback` para `updateSubject` e `deleteSubject` passados como props
    - Substituir `window.confirm` por `ConfirmModal` para exclusão de matéria (integrar com `showToast`)
    - Envolver `SubjectCard` e `TopicItem` com `ErrorBoundary`
    - _Requirements: 1.5, 10.3, 13.1, 13.2, 8.5_

  - [x] 15.2 Adicionar lazy loading para `SimuladosTracker` e `StatsPanel`
    - Usar `React.lazy` + `Suspense` para importar `SimuladosTracker` e `StatsPanel`
    - _Requirements: 10.4_

  - [x] 15.3 Integrar `StatsPanel` no layout do `Dashboard`
    - Passar `subjects`, `simulados` (de `useSimulados`) e `pomodoroSessions` como props
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 16. Refatorar `PomodoroTimer` para consumir `usePomodoroTimer`
  - Remover toda a lógica de estado e `setInterval` do componente
  - Consumir `usePomodoroTimer` e renderizar apenas com os valores expostos
  - Adicionar região `aria-live` para anunciar mudanças de modo
  - Implementar versão compacta para mobile (viewport < 768px)
  - _Requirements: 3.1, 3.2, 3.3, 14.3, 15.3_

- [x] 17. Refatorar `RevisionPanel` para consumir `useRevisions` e exibir revisões futuras
  - Receber `subjects` e `updateTopic` como props (ou consumir `useSubjects` diretamente)
  - Usar `useRevisions` para obter `reviewsDue`, `upcomingReviews` e `markReviewed`
  - Exibir seção de revisões futuras (próximos 7 dias) além das vencidas
  - Exibir `daysOverdue` para cada item vencido
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 18. Refatorar `SimuladosTracker` para consumir `useSimulados`
  - Remover `useLocalStorage` direto do componente
  - Consumir `useSimulados` e renderizar apenas com os valores expostos
  - Exibir `bestScore` e `trend` no painel de estatísticas do componente
  - Substituir exclusão direta por `ConfirmModal` (integrar com `showToast`)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 12.2, 13.1_

- [x] 19. Implementar responsividade mobile
  - Adicionar breakpoints Tailwind para layout de coluna única em viewport < 768px
  - Fazer `SubjectCard` iniciar colapsado em mobile (`isExpanded = false` quando `window.innerWidth < 768`)
  - Adicionar grid de 2 colunas para `SubjectCards` entre 768px e 1024px
  - Adicionar grid de 3 colunas para `SubjectCards` acima de 1024px
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 20. Integrar toast notifications nas ações do usuário
  - Chamar `showToast` de sucesso quando tópico é marcado como concluído (teoria + exercícios)
  - Chamar `showToast` de confirmação quando simulado é salvo
  - Chamar `showToast` informativo quando matéria é excluída
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 21. Checkpoint final — Garantir que todos os testes passam e a aplicação está funcional
  - Executar suite de testes completa
  - Verificar que não há erros de TypeScript (`tsc --noEmit`)
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Os property tests requerem `fast-check` instalado (Tarefa 3)
- Nenhuma dependência de runtime nova é necessária — toasts e modais usam `framer-motion` já existente
- O `calculateSpacedRepetitionDate` substitui o `calculateReviewDate` existente; atualizar todas as referências
