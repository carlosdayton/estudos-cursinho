import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useStudyCycles } from '../hooks/useStudyCycles';
import { useActiveCycle } from '../hooks/useActiveCycle';
import type { Subject, StudyCycle, CycleProgress } from '../utils/studyLogic';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FocusModeContextValue {
  // Existentes
  isFocusMode: boolean;
  activeSubjectId: string | null;
  enterFocusMode: (subjectId?: string) => void;
  exitFocusMode: () => void;
  // Ciclos
  activeCycleId: string | null;
  cycleProgress: CycleProgress | null;
  startCycle: (cycle: StudyCycle) => void;
  clearCycle: () => void;
  advanceCycle: () => void;
  subjectJustChanged: boolean; // true por ~2s após troca de matéria
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function resolveActiveSubject(
  subjectId: string | null,
  subjects: Subject[]
): Subject | null {
  if (!subjectId) return null;
  return subjects.find((s) => s.id === subjectId) ?? null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

interface FocusModeProviderProps {
  children: ReactNode;
  subjects?: Subject[];
}

export function FocusModeProvider({ children }: FocusModeProviderProps) {
  const [isFocusMode, setIsFocusMode] = useLocalStorage<boolean>('focus-mode-active', false);
  const [activeSubjectId, setActiveSubjectId] = useLocalStorage<string | null>(
    'focus-mode-last-subject',
    null
  );
  const [subjectJustChanged, setSubjectJustChanged] = useState(false);

  const { getCycleById } = useStudyCycles();
  const { activeCycleState, startCycle: startCycleState, advanceToNextSubject, clearCycle: clearCycleState } = useActiveCycle();

  // Sync body overflow
  useEffect(() => {
    document.body.style.overflow = isFocusMode ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFocusMode]);

  // Resiliência: se há estado ativo mas o ciclo não existe mais, limpar
  useEffect(() => {
    if (activeCycleState && !getCycleById(activeCycleState.cycleId)) {
      clearCycleState();
    }
  }, [activeCycleState, getCycleById, clearCycleState]);

  const enterFocusMode = useCallback(
    (subjectId?: string) => {
      setActiveSubjectId(subjectId ?? null);
      setIsFocusMode(true);
      document.body.style.overflow = 'hidden';
    },
    [setActiveSubjectId, setIsFocusMode]
  );

  const exitFocusMode = useCallback(() => {
    setIsFocusMode(false);
    document.body.style.overflow = '';
  }, [setIsFocusMode]);

  const startCycle = useCallback(
    (cycle: StudyCycle) => {
      startCycleState(cycle);
      setActiveSubjectId(cycle.subjectIds[0] ?? null);
      setIsFocusMode(true);
      document.body.style.overflow = 'hidden';
    },
    [startCycleState, setActiveSubjectId, setIsFocusMode]
  );

  const clearCycle = useCallback(() => {
    clearCycleState();
    setIsFocusMode(false);
    document.body.style.overflow = '';
  }, [clearCycleState, setIsFocusMode]);

  const advanceCycle = useCallback(() => {
    if (!activeCycleState) return;
    const cycle = getCycleById(activeCycleState.cycleId);
    if (!cycle) return;

    const { nextSubjectId, isCompleted, subjectChanged } = advanceToNextSubject(cycle);

    if (!isCompleted && nextSubjectId) {
      setActiveSubjectId(nextSubjectId);
    }

    if (subjectChanged) {
      setSubjectJustChanged(true);
      setTimeout(() => setSubjectJustChanged(false), 2000);
    }
  }, [activeCycleState, getCycleById, advanceToNextSubject, setActiveSubjectId]);

  // Derivar cycleProgress
  const cycleProgress = useMemo((): CycleProgress | null => {
    if (!activeCycleState) return null;
    const cycle = getCycleById(activeCycleState.cycleId);
    if (!cycle) return null;

    return {
      currentIndex: activeCycleState.currentIndex,
      total: cycle.subjectIds.length,
      cycleName: cycle.name,
      isCompleted: activeCycleState.isCompleted,
    };
  }, [activeCycleState, getCycleById]);

  const activeCycleId = activeCycleState?.cycleId ?? null;

  return (
    <FocusModeContext.Provider
      value={{
        isFocusMode,
        activeSubjectId,
        enterFocusMode,
        exitFocusMode,
        activeCycleId,
        cycleProgress,
        startCycle,
        clearCycle,
        advanceCycle,
        subjectJustChanged,
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode(): FocusModeContextValue {
  const ctx = useContext(FocusModeContext);
  if (!ctx) throw new Error('useFocusMode must be used within FocusModeProvider');
  return ctx;
}
