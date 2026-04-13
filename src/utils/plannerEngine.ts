/**
 * Motor de cálculo puro do módulo Study Planning.
 * Todas as funções são puras (sem efeitos colaterais) para facilitar testes.
 */

import type { Subject } from './studyLogic';
import type {
  StudyGoal,
  SubjectPriorityMap,
  WeeklySchedule,
  SubjectAllocation,
  PaceIndicator,
  PaceStatus,
} from './plannerTypes';
import { DAY_NAMES, PRIORITY_WEIGHT, makeDefaultSubjectPriority } from './plannerTypes';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// ─── 2.1 daysUntil ──────────────────────────────────────────────────────────

/**
 * Calcula os dias inteiros restantes até `targetDate`.
 * Retorna valor positivo para datas futuras, 0 para hoje, negativo para passado.
 * Usa comparação por data (YYYY-MM-DD) ignorando horário.
 */
export function daysUntil(targetDate: string, today?: string): number {
  const todayStr = today ?? new Date().toISOString().substring(0, 10);
  const t = new Date(targetDate + 'T00:00:00Z').getTime();
  const n = new Date(todayStr  + 'T00:00:00Z').getTime();
  if (isNaN(t)) return -Infinity;
  return Math.ceil((t - n) / MS_PER_DAY);
}

// ─── 2.2 clampHours ─────────────────────────────────────────────────────────

/**
 * Limita o valor de horas ao intervalo [0, 12].
 * Retorna 0 para NaN ou valores não-finitos.
 */
export function clampHours(value: number): number {
  if (!isFinite(value)) return 0;
  return Math.max(0, Math.min(12, value));
}

// ─── 2.3 weeklyTotal ────────────────────────────────────────────────────────

/**
 * Soma os 7 valores de horas diárias.
 */
export function weeklyTotal(dailyHours: number[]): number {
  return dailyHours.reduce((acc, h) => acc + h, 0);
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Retorna true se o subject tem pelo menos um tópico incompleto. */
function hasIncompleteTopics(subject: Subject): boolean {
  return subject.topics.some(t => !t.isStudied || !t.isExercisesDone);
}

// ─── 2.4 generateSchedule ───────────────────────────────────────────────────

/**
 * Gera o WeeklySchedule distribuindo matérias com tópicos incompletos
 * pelos dias com horas disponíveis, respeitando a proporção 3:2:1 (alta:média:baixa).
 *
 * Algoritmo:
 * 1. Filtra matérias com tópicos incompletos.
 * 2. Calcula o peso total de todas as matérias ativas.
 * 3. Para cada dia com horas > 0, distribui as horas proporcionalmente ao peso.
 * 4. Dias com 0 horas recebem allocations vazio.
 */
export function generateSchedule(
  subjects: Subject[],
  goal: StudyGoal,
  priorities: SubjectPriorityMap,
): WeeklySchedule {
  const activeSubjects = subjects.filter(hasIncompleteTopics);

  const schedule: WeeklySchedule = DAY_NAMES.map((dayName, dayIndex) => ({
    dayIndex,
    dayName,
    availableHours: clampHours(goal.dailyHours[dayIndex] ?? 0),
    allocations: [],
  }));

  if (activeSubjects.length === 0) return schedule;

  // Calcula peso de cada matéria ativa
  const weights = activeSubjects.map(s => {
    const p = priorities[s.id] ?? makeDefaultSubjectPriority(s.id);
    return PRIORITY_WEIGHT[p.priority];
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Distribui horas por dia
  for (const day of schedule) {
    if (day.availableHours === 0) continue;

    const allocations: SubjectAllocation[] = [];
    let hoursAssigned = 0;

    activeSubjects.forEach((subject, i) => {
      const proportion = weights[i] / totalWeight;
      // Arredonda para 1 casa decimal, mínimo 0.5h se a matéria tem peso
      const raw = day.availableHours * proportion;
      const hours = Math.max(0, Math.round(raw * 10) / 10);
      if (hours > 0) {
        allocations.push({
          subjectId:   subject.id,
          subjectName: subject.name,
          color:       subject.color,
          hours,
        });
        hoursAssigned += hours;
      }
    });

    // Ajuste de arredondamento: distribui diferença residual na matéria de maior peso
    const diff = Math.round((day.availableHours - hoursAssigned) * 10) / 10;
    if (diff !== 0 && allocations.length > 0) {
      // Encontra a alocação de maior peso para absorver o resíduo
      const maxWeightIdx = weights.indexOf(Math.max(...weights));
      const alloc = allocations.find(a => a.subjectId === activeSubjects[maxWeightIdx]?.id);
      if (alloc) alloc.hours = Math.max(0, Math.round((alloc.hours + diff) * 10) / 10);
    }

    day.allocations = allocations.filter(a => a.hours > 0);
  }

  return schedule;
}

// ─── 2.5 calculatePace ──────────────────────────────────────────────────────

/**
 * Calcula o PaceIndicator com base nos tópicos restantes e dias de estudo disponíveis.
 *
 * Status:
 * - 'expired'   → data-alvo já passou
 * - 'completed' → nenhum tópico restante
 * - 'ok'        → topicsPerStudyDay ≤ 3
 * - 'warning'   → topicsPerStudyDay ≤ 6
 * - 'danger'    → topicsPerStudyDay > 6
 */
export function calculatePace(
  subjects: Subject[],
  goal: StudyGoal,
  today?: string,
): PaceIndicator {
  const daysLeft = daysUntil(goal.targetDate, today);

  if (daysLeft <= 0) {
    return { topicsPerStudyDay: 0, remainingTopics: 0, studyDaysLeft: 0, status: 'expired' };
  }

  const remainingTopics = subjects.reduce(
    (acc, s) => acc + s.topics.filter(t => !t.isStudied || !t.isExercisesDone).length,
    0,
  );

  if (remainingTopics === 0) {
    return { topicsPerStudyDay: 0, remainingTopics: 0, studyDaysLeft: daysLeft, status: 'completed' };
  }

  // Conta dias de estudo disponíveis (horas > 0) dentro dos próximos `daysLeft` dias
  const studyDaysLeft = countStudyDays(goal.dailyHours, daysLeft, today);

  if (studyDaysLeft === 0) {
    return { topicsPerStudyDay: Infinity, remainingTopics, studyDaysLeft: 0, status: 'danger' };
  }

  const topicsPerStudyDay = Math.round((remainingTopics / studyDaysLeft) * 100) / 100;

  let status: PaceStatus;
  if (topicsPerStudyDay <= 3)      status = 'ok';
  else if (topicsPerStudyDay <= 6) status = 'warning';
  else                             status = 'danger';

  return { topicsPerStudyDay, remainingTopics, studyDaysLeft, status };
}

/**
 * Conta quantos dias de estudo (horas > 0) existem nos próximos `totalDays` dias.
 * Usa o padrão semanal de `dailyHours` (índice = dia da semana).
 */
function countStudyDays(dailyHours: number[], totalDays: number, today?: string): number {
  const startStr = today ?? new Date().toISOString().substring(0, 10);
  const start = new Date(startStr + 'T00:00:00Z');
  let count = 0;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start.getTime() + i * MS_PER_DAY);
    const dow = d.getUTCDay(); // 0=dom … 6=sáb
    if ((dailyHours[dow] ?? 0) > 0) count++;
  }
  return count;
}
