import type { StudyCycle, ActiveCycleState } from './studyLogic';

export interface AdvanceResult {
  nextState: ActiveCycleState;
  nextSubjectId: string | null;
  isCompleted: boolean;
  subjectChanged: boolean; // true quando a matéria mudou (para disparar notificação)
}

/**
 * Lógica pura de avanço de ciclo — sem side effects, testável isoladamente.
 * Respeita pomodorosPerSubject: só avança de matéria após completar N Pomodoros.
 */
export function advanceCycleState(
  current: ActiveCycleState,
  cycle: StudyCycle
): AdvanceResult {
  const pomodorosNeeded = Math.max(1, cycle.pomodorosPerSubject ?? 1);
  const nextPomodoroCount = current.pomodorosInCurrentSubject + 1;

  // Ainda não completou os Pomodoros necessários para esta matéria
  if (nextPomodoroCount < pomodorosNeeded) {
    return {
      nextState: { ...current, pomodorosInCurrentSubject: nextPomodoroCount },
      nextSubjectId: cycle.subjectIds[current.currentIndex],
      isCompleted: false,
      subjectChanged: false,
    };
  }

  // Completou os Pomodoros desta matéria — avança para a próxima
  const nextIndex = current.currentIndex + 1;

  if (nextIndex < cycle.subjectIds.length) {
    return {
      nextState: { ...current, currentIndex: nextIndex, pomodorosInCurrentSubject: 0 },
      nextSubjectId: cycle.subjectIds[nextIndex],
      isCompleted: false,
      subjectChanged: true,
    };
  }

  if (cycle.loop) {
    return {
      nextState: { ...current, currentIndex: 0, pomodorosInCurrentSubject: 0 },
      nextSubjectId: cycle.subjectIds[0],
      isCompleted: false,
      subjectChanged: true,
    };
  }

  return {
    nextState: { ...current, isCompleted: true, pomodorosInCurrentSubject: nextPomodoroCount },
    nextSubjectId: null,
    isCompleted: true,
    subjectChanged: false,
  };
}

/**
 * Valida um ciclo antes de salvar.
 * Retorna null se válido, ou string de erro se inválido.
 */
export function validateCycle(name: string, subjectIds: string[]): string | null {
  if (!name.trim()) return 'O nome do ciclo não pode estar vazio.';
  if (name.trim().length > 50) return 'O nome deve ter no máximo 50 caracteres.';
  if (subjectIds.length < 2) return 'Selecione pelo menos 2 matérias.';
  const unique = new Set(subjectIds);
  if (unique.size !== subjectIds.length) return 'Matérias duplicadas não são permitidas.';
  return null;
}
