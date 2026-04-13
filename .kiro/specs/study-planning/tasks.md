# Tasks — Study Planning

## Task List

- [x] 1. Definir tipos e interfaces do módulo
  - [x] 1.1 Criar `src/utils/plannerTypes.ts` com todos os tipos: `PriorityLevel`, `DifficultyLevel`, `SubjectPriority`, `SubjectPriorityMap`, `StudyGoal`, `SubjectAllocation`, `DayPlan`, `WeeklySchedule`, `PaceStatus`, `PaceIndicator`, constantes de chaves de storage e valores padrão (`DEFAULT_GOAL`, `DEFAULT_PRIORITY`)

- [x] 2. Implementar o motor de cálculo puro
  - [x] 2.1 Criar `src/utils/plannerEngine.ts` com a função `daysUntil(targetDate: string): number` que calcula dias inteiros restantes (positivo para futuro, ≤0 para passado/hoje)
  - [x] 2.2 Implementar `clampHours(value: number): number` que limita o valor ao intervalo [0, 12]
  - [x] 2.3 Implementar `weeklyTotal(dailyHours: number[]): number` que soma os 7 valores
  - [x] 2.4 Implementar `generateSchedule(subjects: Subject[], goal: StudyGoal, priorities: SubjectPriorityMap): WeeklySchedule` que distribui matérias com tópicos incompletos pelos dias com horas disponíveis, respeitando a proporção 3:2:1 (alta:média:baixa)
  - [x] 2.5 Implementar `calculatePace(subjects: Subject[], goal: StudyGoal): PaceIndicator` que calcula `topicsPerStudyDay`, `remainingTopics`, `studyDaysLeft` e `status` (`ok` | `warning` | `danger` | `completed` | `expired`)

- [x] 3. Implementar o hook `useStudyPlanning`
  - [x] 3.1 Criar `src/hooks/useStudyPlanning.ts` que persiste `StudyGoal` em `study-planning-goal` e `SubjectPriorityMap` em `study-planning-priorities` via `useLocalStorage`
  - [x] 3.2 Expor `setTargetDate(date: string): void` e `setDailyHours(dayIndex: number, hours: number): void` com clamping automático
  - [x] 3.3 Expor `setPriority(subjectId: string, patch: Partial<SubjectPriority>): void`
  - [x] 3.4 Sincronizar `SubjectPriorityMap` com a lista de subjects: inicializar novas matérias com defaults e remover entradas de matérias deletadas (via `useEffect` que observa `subjects`)
  - [x] 3.5 Computar `schedule: WeeklySchedule` e `pace: PaceIndicator` via `useMemo` sempre que `goal`, `priorities` ou `subjects` mudarem

- [x] 4. Implementar os testes de propriedade e unitários
  - [x] 4.1 Criar `src/utils/plannerEngine.test.ts` com testes de propriedade (fast-check) para P1–P10 e testes unitários para edge cases (subjects vazio, todas horas 0, todos tópicos concluídos)
  - [x] 4.2 Criar `src/hooks/useStudyPlanning.test.ts` com testes de propriedade para P11–P12 e testes unitários do hook

- [x] 5. Implementar os componentes de UI
  - [x] 5.1 Criar `src/components/PaceIndicatorCard.tsx` — card glassmorphism com o PaceIndicator em cada status (ok=verde, warning=âmbar, danger=vermelho, completed=roxo, expired=cinza)
  - [x] 5.2 Criar `src/components/WeeklyScheduleGrid.tsx` — grade de 7 colunas com blocos coloridos de matérias alocadas; exibe mensagem de orientação quando schedule está vazio
  - [x] 5.3 Criar `src/components/GoalConfigSection.tsx` — input de data-alvo com contagem regressiva em tempo real e inputs de horas por dia (dom–sáb) com validação visual de clamping
  - [x] 5.4 Criar `src/components/PriorityConfigSection.tsx` — lista de matérias com seletores de prioridade (baixa/média/alta) e dificuldade (fácil/médio/difícil) com indicadores visuais de cor
  - [x] 5.5 Criar `src/components/StudyPlannerPanel.tsx` — componente raiz que compõe os 4 sub-componentes acima usando `useStudyPlanning`; exibe mensagem de parabéns quando todos os tópicos estão concluídos

- [x] 6. Integrar o módulo ao Dashboard
  - [x] 6.1 Adicionar lazy import de `StudyPlannerPanel` no `Dashboard.tsx`
  - [x] 6.2 Adicionar seção do `StudyPlannerPanel` no layout do Dashboard, passando `subjects` como prop, com `Suspense` e `SectionSkeleton` como fallback
