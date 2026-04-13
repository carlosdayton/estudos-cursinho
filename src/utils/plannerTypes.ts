/**
 * Tipos e interfaces do módulo de Planejamento de Estudos (Study Planning).
 */

// ─── Enums / Union Types ────────────────────────────────────────────────────

export type PriorityLevel = 'baixa' | 'média' | 'alta';
export type DifficultyLevel = 'fácil' | 'médio' | 'difícil';
export type PaceStatus = 'ok' | 'warning' | 'danger' | 'completed' | 'expired';

// ─── Core Data Models ───────────────────────────────────────────────────────

/** Configuração de prioridade e dificuldade de uma matéria. */
export interface SubjectPriority {
  subjectId: string;
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
}

/** Mapa de prioridades indexado por subjectId. */
export type SubjectPriorityMap = Record<string, SubjectPriority>;

/**
 * Meta de estudo: data-alvo + horas por dia da semana.
 * dailyHours[0] = domingo, ..., dailyHours[6] = sábado.
 * Cada valor está no intervalo [0, 12].
 */
export interface StudyGoal {
  targetDate: string;    // ISO date string (YYYY-MM-DD)
  dailyHours: number[];  // 7 elementos: [dom, seg, ter, qua, qui, sex, sáb]
}

/** Alocação de uma matéria em um dia específico. */
export interface SubjectAllocation {
  subjectId: string;
  subjectName: string;
  color: string;
  hours: number;
}

/** Plano de um único dia da semana. */
export interface DayPlan {
  dayIndex: number;          // 0 = domingo … 6 = sábado
  dayName: string;           // "Domingo", "Segunda", …
  availableHours: number;
  allocations: SubjectAllocation[];
}

/** Cronograma semanal completo (7 DayPlans). */
export type WeeklySchedule = DayPlan[];

/** Indicador de ritmo de estudo. */
export interface PaceIndicator {
  topicsPerStudyDay: number;  // tópicos/dia necessários (arredondado a 2 casas)
  remainingTopics: number;
  studyDaysLeft: number;
  status: PaceStatus;
}

// ─── Storage Keys ───────────────────────────────────────────────────────────

export const STORAGE_KEY_GOAL       = 'study-planning-goal' as const;
export const STORAGE_KEY_PRIORITIES = 'study-planning-priorities' as const;

// ─── Day Names ──────────────────────────────────────────────────────────────

export const DAY_NAMES = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado',
] as const;

// ─── Priority Weights (alta:média:baixa = 3:2:1) ────────────────────────────

export const PRIORITY_WEIGHT: Record<PriorityLevel, number> = {
  alta:  3,
  média: 2,
  baixa: 1,
};

// ─── Default Values ─────────────────────────────────────────────────────────

export const DEFAULT_GOAL: StudyGoal = {
  targetDate: '2026-11-01',
  dailyHours: [0, 2, 2, 2, 2, 2, 3],
};

export const DEFAULT_PRIORITY_LEVEL: PriorityLevel   = 'média';
export const DEFAULT_DIFFICULTY_LEVEL: DifficultyLevel = 'médio';

export function makeDefaultSubjectPriority(subjectId: string): SubjectPriority {
  return {
    subjectId,
    priority:   DEFAULT_PRIORITY_LEVEL,
    difficulty: DEFAULT_DIFFICULTY_LEVEL,
  };
}
