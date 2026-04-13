import { createContext, useContext, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Subject } from '../utils/studyLogic';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FocusModeContextValue {
  isFocusMode: boolean;
  activeSubjectId: string | null;
  enterFocusMode: (subjectId?: string) => void;
  exitFocusMode: () => void;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Resolve the active Subject from a subjectId.
 * Returns null if subjectId is null or not found in subjects array.
 */
export function resolveActiveSubject(
  subjectId: string | null,
  subjects: Subject[]
): Subject | null {
  if (!subjectId) return null;
  return subjects.find((s) => s.id === subjectId) ?? null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useLocalStorage<boolean>('focus-mode-active', false);
  const [activeSubjectId, setActiveSubjectId] = useLocalStorage<string | null>(
    'focus-mode-last-subject',
    null
  );

  // Sync body overflow with focus mode state on mount
  useEffect(() => {
    document.body.style.overflow = isFocusMode ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFocusMode]);

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

  return (
    <FocusModeContext.Provider value={{ isFocusMode, activeSubjectId, enterFocusMode, exitFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode(): FocusModeContextValue {
  const ctx = useContext(FocusModeContext);
  if (!ctx) throw new Error('useFocusMode must be used within FocusModeProvider');
  return ctx;
}
