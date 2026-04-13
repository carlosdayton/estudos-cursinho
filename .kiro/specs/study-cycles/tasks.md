# Tasks: Study Cycles (Ciclos de Estudo)

## Implementation Plan

### Task 1: Tipos e utilitários base
- [x] 1.1 Adicionar interfaces `StudyCycle`, `ActiveCycleState` e `CycleProgress` em `src/utils/studyLogic.ts`

### Task 2: Hook useStudyCycles
- [x] 2.1 Criar `src/hooks/useStudyCycles.ts` com CRUD de ciclos persistido via `useLocalStorage` (chave `study-cycles`)
  - Funções: `saveCycle`, `deleteCycle`, `getCycleById`
  - Inicializa com array vazio se localStorage inválido

### Task 3: Extensão do usePomodoroTimer
- [x] 3.1 Adicionar parâmetro opcional `options?: { onFocusSessionComplete?: () => void }` ao `usePomodoroTimer`
- [x] 3.2 Invocar `onFocusSessionComplete` quando `completedMode === 'work'` no bloco de timer zerado
- [x] 3.3 Garantir que `PomodoroTimer.tsx` e `FocusModeOverlay.tsx` continuem funcionando sem alteração de chamada

### Task 4: Hook useActiveCycle
- [x] 4.1 Criar `src/hooks/useActiveCycle.ts` para gerenciar `ActiveCycleState` persistido (chave `active-cycle-state`)
  - Funções: `startCycle`, `advanceToNextSubject`, `clearCycle`
  - Lógica de loop e conclusão
  - Resiliência: limpar estado se `cycleId` não existir mais

### Task 5: Extensão do FocusModeContext
- [x] 5.1 Adicionar campos `activeCycleId`, `cycleProgress`, `startCycle`, `clearCycle` ao `FocusModeContextValue`
- [x] 5.2 Implementar `startCycle` no provider: chama `useActiveCycle.startCycle` + `enterFocusMode`
- [x] 5.3 Implementar `clearCycle` no provider: chama `useActiveCycle.clearCycle` + `exitFocusMode`
- [x] 5.4 Derivar `cycleProgress` a partir de `activeCycleState` e lista de subjects (passada via prop ou hook)
- [x] 5.5 Garantir que `enterFocusMode` existente (sem ciclo) continue funcionando

### Task 6: Componente CycleProgressBadge
- [x] 6.1 Criar `src/components/CycleProgressBadge.tsx`
  - Props: `currentIndex`, `total`, `subjectName`, `accentColor`
  - Renderiza: `"Matéria [N] de [Total] — [Nome]"`
  - Estilo glassmorphism com cor de acento

### Task 7: Componente CycleCompletionScreen
- [x] 7.1 Criar `src/components/CycleCompletionScreen.tsx`
  - Props: `cycleName`, `totalSubjects`, `onRepeat`, `onExit`
  - Animação de entrada com `framer-motion`
  - Botões "Repetir Ciclo" e "Encerrar"

### Task 8: Extensão do FocusModeOverlay
- [x] 8.1 Adicionar leitura de `cycleProgress` do `FocusModeContext` no overlay
- [x] 8.2 Renderizar `CycleProgressBadge` condicionalmente quando `cycleProgress !== null && !cycleProgress.isCompleted`
- [x] 8.3 Renderizar `CycleCompletionScreen` condicionalmente quando `cycleProgress?.isCompleted === true`
- [x] 8.4 Conectar `onFocusSessionComplete` do `usePomodoroTimer` ao `advanceToNextSubject` do contexto
- [x] 8.5 Garantir que comportamento existente (timer, Esc, controles) seja preservado

### Task 9: Componente CycleEditorModal
- [x] 9.1 Criar `src/components/CycleEditorModal.tsx`
  - Props: `isOpen`, `cycle | null`, `subjects`, `onSave`, `onClose`
  - Input de nome com validação inline
  - Lista de matérias com checkbox de seleção
  - Botões ↑ / ↓ para reordenar matérias selecionadas
  - Toggle "Repetir ciclo ao terminar"
  - `role="dialog"`, `aria-modal="true"`, foco gerenciado

### Task 10: Componente StudyCyclesPanel
- [x] 10.1 Criar `src/components/StudyCyclesPanel.tsx`
  - Props: `subjects: Subject[]`
  - Lista ciclos salvos com nome, matérias e botões Iniciar / Editar / Excluir
  - Botão "Novo Ciclo" abre `CycleEditorModal`
  - Estado vazio com mensagem orientativa
  - Usa `ConfirmModal` existente para confirmação de exclusão

### Task 11: Integração no Dashboard
- [x] 11.1 Adicionar import lazy de `StudyCyclesPanel` no `Dashboard.tsx`
- [x] 11.2 Renderizar `StudyCyclesPanel` como seção com divisor visual, passando `subjects` como prop
- [x] 11.3 Envolver com `Suspense` usando `SectionSkeleton` como fallback

### Task 12: Testes
- [x] 12.1 Criar `src/test/studyCycles.test.ts` com testes unitários para `advanceToNextSubject` (avanço normal, último sem loop, último com loop, matéria removida)
- [x] 12.2 Criar testes para validação de `StudyCycle` (nome vazio, menos de 2 matérias)
- [x] 12.3 Criar testes de integração para fluxo completo: criar ciclo → iniciar → avançar N vezes → verificar conclusão
