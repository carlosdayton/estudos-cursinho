import { createContext, useContext, type ReactNode } from 'react';
import { useSubjects, type UseSubjectsReturn } from '../hooks/useSubjects';

const SubjectsContext = createContext<UseSubjectsReturn | null>(null);

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const value = useSubjects();
  return (
    <SubjectsContext.Provider value={value}>
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjectsContext(): UseSubjectsReturn {
  const ctx = useContext(SubjectsContext);
  if (!ctx) throw new Error('useSubjectsContext must be used inside SubjectsProvider');
  return ctx;
}
