# Design Document — Study Planning (Organização e Planejamento de Estudos)

## Overview

O módulo **Study Planning** adiciona ao Foco ENEM um motor de planejamento que transforma as configurações do aluno (data-alvo, horas diárias, prioridade por matéria) em um cronograma semanal gerado automaticamente e em um indicador de ritmo (PaceIndicator).

O módulo é inteiramente client-side, persiste via `localStorage` usando o hook `useLocalStorage` já existente, e se integra às estruturas `Subject`, `Topic` e `AppSettings` sem modificá-las.

---

## Architecture

```
Dashboard.tsx
  └── StudyPlannerPanel.tsx          ← novo componente de entrada (lazy-loaded)
        ├── GoalConfigSection.tsx    ← configuração de data-alvo e horas diárias
        ├── PriorityConfigSection.tsx← configuração de prioridade/dificuldade por matéria
        ├── WeeklyScheduleGrid.tsx   ← grade semanal gerada
        └── PaceIndicatorCard.tsx    ← indicador de ritmo

Hooks:
  useStudyPlanning.ts                ← estado + lógica de orquestração
  
Utils:
  plannerEngine.ts                   ← funções puras de cálculo (schedule + pace)
```

### Fluxo de dados

```
useSubjects (subjects) ──┐
useStudyPlanning         ├──► plannerEngine.generateSchedule() ──► WeeklySchedule
  (goal, priorities)   ──┘
                          └──► plannerEngine.calculatePace()   ──► PaceIndicator
```

Toda mutação de estado passa pelo hook `useStudyPlanning`, que persiste via `useLocalStorage` e recomputa o schedule/pace via `useMemo`.

---

## Components and Interfaces

### `StudyPlannerPanel`
Componente raiz do módulo. Recebe `subjects: Subject[]` como prop (vindo do `useSubjects` no Dashboard). Internamente usa `useStudyPlanning`.

Props:
```ts
interface StudyPlannerPanelProps {
  subjects: Subject[];
}
```

### `GoalConfigSection`
Formulário para data-alvo e horas por dia da semana.

Props:
```ts
interface GoalConfigSectionProps {
  goal: StudyGoal;
  onGoalChange: (goal: StudyGoal) => void;
}
```

### `PriorityConfigSection`
Lista de matérias com seletores de prioridade e dificuldade.

Props:
```ts
interface PriorityConfigSectionProps {
  subjects: Subject[];
  priorities: SubjectPriorityMap;
  onPriorityChange: (subjectId: string, patch: Partial<SubjectPriority>) => void;
}
```

### `WeeklyScheduleGrid`
Grade de 7 colunas (dom–sáb) com blocos de matérias alocadas.

Props:
```ts
interface WeeklyScheduleGridProps {
  schedule: WeeklySchedule;
}
```

### `PaceIndicatorCard`
Card com o indicador de ritmo calculado.

Props:
```ts
interface PaceIndicatorCardProps {
  pace: PaceIndicator;
}
```

---

## Data Models

```ts
// Nível de prioridade de uma matéria
type PriorityLevel = 'baixa' | 'média' | 'alta';

// Dificuldade pessoal de uma matéria
type DifficultyLevel = 'fácil' | 'médio' | 'difícil';

// Configuração de prioridade/dificuldade de uma matéria
interface SubjectPriority {
  subjectId: string;
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
}

// Mapa de prioridades indexado por subjectId
type SubjectPriorityMap = Record<string, SubjectPriority>;

// Meta de estudo: data-alvo + horas por dia da semana
interface StudyGoal {
  targetDate: string;          // ISO date string (YYYY-MM-DD)
  dailyHours: number[];        // [dom, seg, ter, qua, qui, sex, sáb] — valores em [0, 12]
}

// Alocação de uma matéria em um dia
interface SubjectAllocation {
  subjectId: string;
  subjectName: string;
  color: string;
  hours: number;
}

// Plano de um único dia
interface DayPlan {
  dayIndex: number;            // 0=dom … 6=sáb
  dayName: string;             // "Domingo", "Segunda", …
  availableHours: number;
  allocations: SubjectAllocation[];
}

// Cronograma semanal completo
type WeeklySchedule = DayPlan[];

// Status do PaceIndicator
type PaceStatus = 'ok' | 'warning' | 'danger' | 'completed' | 'expired';

// Indicador de ritmo
interface PaceIndicator {
  topicsPerStudyDay: number;   // tópicos/dia necessários
  remainingTopics: number;
  studyDaysLeft: number;
  status: PaceStatus;
}

// Chaves de localStorage
const STORAGE_KEY_GOAL       = 'study-planning-goal';
const STORAGE_KEY_PRIORITIES = 'study-planning-priorities';

// Valores padrão
const DEFAULT_GOAL: StudyGoal = {
  targetDate: '2026-11-01',
  dailyHours: [0, 2, 2, 2, 2, 2, 3],
};

const DEFAULT_PRIORITY: SubjectPriority = {
  subjectId: '',
  priority: 'média',
  difficulty: 'médio',
};
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Countdown is non-negative for future dates

*For any* target date strictly after today, `daysUntil(targetDate)` SHALL return a positive integer equal to `Math.ceil((targetDate - today) / MS_PER_DAY)`.

**Validates: Requirements 1.2**

---

### Property 2: Past or present dates yield non-positive countdown

*For any* target date that is today or in the past, `daysUntil(targetDate)` SHALL return a value ≤ 0, triggering the expired display state.

**Validates: Requirements 1.3, 5.6**

---

### Property 3: Daily hours are clamped to [0, 12]

*For any* input value `v` provided for a single day's hours, the stored value SHALL equal `Math.max(0, Math.min(12, v))`.

**Validates: Requirements 2.1, 2.5**

---

### Property 4: Weekly total equals sum of daily hours

*For any* `dailyHours` array of 7 values, the computed weekly total SHALL equal `dailyHours.reduce((a, b) => a + b, 0)`.

**Validates: Requirements 2.4**

---

### Property 5: Days with 0 hours have no allocations

*For any* generated `WeeklySchedule`, every `DayPlan` where `availableHours === 0` SHALL have an empty `allocations` array.

**Validates: Requirements 2.2**

---

### Property 6: Schedule excludes fully-completed subjects

*For any* `Subject` where every `Topic` has `isStudied === true` AND `isExercisesDone === true`, that subject SHALL NOT appear in any `DayPlan.allocations` of the generated `WeeklySchedule`.

**Validates: Requirements 4.3**

---

### Property 7: Priority allocation ratio is 3:2:1

*For any* set of subjects containing at least one subject of each priority level (`alta`, `média`, `baixa`), the total hours allocated to `alta` subjects SHALL be approximately 3× those of `baixa` subjects, and `média` subjects approximately 2× those of `baixa` subjects (within rounding tolerance of ±1 hour per subject).

**Validates: Requirements 3.4, 4.2**

---

### Property 8: PaceIndicator formula is correct

*For any* positive `remainingTopics` and positive `studyDaysLeft`, `paceIndicator.topicsPerStudyDay` SHALL equal `remainingTopics / studyDaysLeft` (rounded to 2 decimal places).

**Validates: Requirements 5.1**

---

### Property 9: StudyGoal round-trip persistence

*For any* valid `StudyGoal` object, serializing it to JSON and deserializing it SHALL produce a structurally equivalent object (same `targetDate` and same `dailyHours` array).

**Validates: Requirements 1.6, 2.6, 6.1, 6.2**

---

### Property 10: SubjectPriority round-trip persistence

*For any* valid `SubjectPriorityMap`, serializing it to JSON and deserializing it SHALL produce a structurally equivalent map with the same keys and values.

**Validates: Requirements 3.6, 6.1, 6.2**

---

### Property 11: Deleted subject is removed from priorities

*For any* `subjectId` that is deleted from the system, the resulting `SubjectPriorityMap` SHALL NOT contain an entry with that `subjectId`.

**Validates: Requirements 6.4**

---

### Property 12: New subject gets default priority

*For any* newly added `Subject`, the `SubjectPriorityMap` SHALL contain an entry for that subject with `priority === 'média'` and `difficulty === 'médio'`.

**Validates: Requirements 6.5**

---

## Error Handling

| Cenário | Comportamento |
|---|---|
| `localStorage` corrompido | `useLocalStorage` retorna valor padrão e loga no console (padrão já existente) |
| `targetDate` inválida (NaN) | `plannerEngine` trata como data expirada, exibe estado `expired` |
| `subjects` vazio | `generateSchedule` retorna array de 7 `DayPlan` com `allocations: []` |
| Todas as horas = 0 | `generateSchedule` retorna schedule vazio; UI exibe mensagem de orientação |
| Todos os tópicos concluídos | `calculatePace` retorna `status: 'completed'`; UI exibe parabéns |
| `dailyHours` com valor > 12 | Clamped para 12 antes de persistir |
| `dailyHours` com valor < 0 | Clamped para 0 antes de persistir |

---

## Testing Strategy

### Abordagem dual

- **Testes unitários (example-based):** cobrem comportamentos específicos, estados de UI, edge cases e integração entre componentes.
- **Testes de propriedade (property-based):** cobrem as propriedades universais listadas acima usando `fast-check` (já instalado no projeto).

### Biblioteca de PBT

`fast-check` v4 — já presente em `devDependencies`.

Cada teste de propriedade deve rodar com mínimo de **100 iterações** (padrão do fast-check) e incluir um comentário de rastreabilidade:

```ts
// Feature: study-planning, Property N: <texto da propriedade>
```

### Arquivos de teste

```
src/
  utils/
    plannerEngine.test.ts     ← testes unitários + propriedades das funções puras
  hooks/
    useStudyPlanning.test.ts  ← testes unitários do hook
```

### Cobertura por propriedade

| Propriedade | Arquivo | Tipo |
|---|---|---|
| P1 — Countdown futuro | plannerEngine.test.ts | property |
| P2 — Countdown passado/hoje | plannerEngine.test.ts | property |
| P3 — Clamping horas [0,12] | plannerEngine.test.ts | property |
| P4 — Total semanal = soma | plannerEngine.test.ts | property |
| P5 — Dia 0h sem alocações | plannerEngine.test.ts | property |
| P6 — Matéria concluída excluída | plannerEngine.test.ts | property |
| P7 — Proporção 3:2:1 | plannerEngine.test.ts | property |
| P8 — Fórmula PaceIndicator | plannerEngine.test.ts | property |
| P9 — Round-trip StudyGoal | plannerEngine.test.ts | property |
| P10 — Round-trip SubjectPriority | plannerEngine.test.ts | property |
| P11 — Remoção limpa prioridades | useStudyPlanning.test.ts | property |
| P12 — Nova matéria default priority | useStudyPlanning.test.ts | property |

### Testes unitários adicionais

- Renderização do `StudyPlannerPanel` com subjects vazios
- Renderização do `WeeklyScheduleGrid` com schedule completo
- Renderização do `PaceIndicatorCard` em cada status (`ok`, `warning`, `danger`, `completed`, `expired`)
- Mensagem de parabéns quando todos os tópicos estão concluídos
- Mensagem de orientação quando todas as horas são 0
