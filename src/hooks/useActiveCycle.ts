import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { advanceCycleState } from '../utils/cycleLogic';
import type { StudyCycle, ActiveCycleState } from '../utils/studyLogic';

function parseState(raw: unknown): ActiveCycleState | null {
  if (
    raw !== null &&
    typeof raw === 'object' &&
    typeof (raw as ActiveCycleState).cycleId === 'string' &&
    typeof (raw as ActiveCycleState).currentIndex === 'number' &&
    typeof (raw as ActiveCycleState).isCompleted === 'boolean'
  ) {
    const s = raw as ActiveCycleState;
    // Garantir campo novo com fallback para dados antigos
    return { ...s, pomodorosInCurrentSubject: s.pomodorosInCurrentSubject ?? 0 };
  }
  return null;
}

export interface UseActiveCycleReturn {
  activeCycleState: ActiveCycleState | null;
  startCycle: (cycle: StudyCycle) => void;
  advanceToNextSubject: (cycle: StudyCycle) => {
    nextSubjectId: string | null;
    isCompleted: boolean;
    subjectChanged: boolean;
  };
  clearCycle: () => void;
}

export function useActiveCycle(): UseActiveCycleReturn {
  const [rawState, setRawState] = useLocalStorage<unknown>('active-cycle-state', null);
  const activeCycleState = parseState(rawState);

  const startCycle = useCallback(
    (cycle: StudyCycle) => {
      const state: ActiveCycleState = {
        cycleId: cycle.id,
        currentIndex: 0,
        pomodorosInCurrentSubject: 0,
        isCompleted: false,
        startedAt: new Date().toISOString(),
      };
      setRawState(state);
    },
    [setRawState]
  );

  const advanceToNextSubject = useCallback(
    (cycle: StudyCycle): { nextSubjectId: string | null; isCompleted: boolean; subjectChanged: boolean } => {
      const current = parseState(rawState);
      if (!current) return { nextSubjectId: null, isCompleted: false, subjectChanged: false };

      const result = advanceCycleState(current, cycle);
      setRawState(result.nextState);
      return {
        nextSubjectId: result.nextSubjectId,
        isCompleted: result.isCompleted,
        subjectChanged: result.subjectChanged,
      };
    },
    [rawState, setRawState]
  );

  const clearCycle = useCallback(() => {
    setRawState(null);
  }, [setRawState]);

  return { activeCycleState, startCycle, advanceToNextSubject, clearCycle };
}
