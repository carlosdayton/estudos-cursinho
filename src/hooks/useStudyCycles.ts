import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { StudyCycle } from '../utils/studyLogic';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function parseCycles(raw: unknown): StudyCycle[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (c): c is StudyCycle =>
      c !== null &&
      typeof c === 'object' &&
      typeof (c as StudyCycle).id === 'string' &&
      typeof (c as StudyCycle).name === 'string' &&
      Array.isArray((c as StudyCycle).subjectIds)
  );
}

export interface UseStudyCyclesReturn {
  cycles: StudyCycle[];
  saveCycle: (cycle: Omit<StudyCycle, 'id' | 'createdAt'> & { id?: string }) => StudyCycle;
  deleteCycle: (id: string) => void;
  getCycleById: (id: string) => StudyCycle | undefined;
}

export function useStudyCycles(): UseStudyCyclesReturn {
  const [rawCycles, setRawCycles] = useLocalStorage<unknown>('study-cycles', []);
  const cycles = parseCycles(rawCycles);

  const saveCycle = useCallback(
    (input: Omit<StudyCycle, 'id' | 'createdAt'> & { id?: string }): StudyCycle => {
      const existing = parseCycles(rawCycles);
      if (input.id) {
        // Update existing
        const updated = existing.map((c) =>
          c.id === input.id
            ? { ...c, ...input, id: input.id! }
            : c
        );
        setRawCycles(updated);
        return updated.find((c) => c.id === input.id)!;
      } else {
        // Create new
        const newCycle: StudyCycle = {
          id: generateId(),
          name: input.name,
          subjectIds: input.subjectIds,
          loop: input.loop ?? false,
          pomodorosPerSubject: input.pomodorosPerSubject ?? 1,
          createdAt: new Date().toISOString(),
        };
        setRawCycles([...existing, newCycle]);
        return newCycle;
      }
    },
    [rawCycles, setRawCycles]
  );

  const deleteCycle = useCallback(
    (id: string) => {
      const existing = parseCycles(rawCycles);
      setRawCycles(existing.filter((c) => c.id !== id));
    },
    [rawCycles, setRawCycles]
  );

  const getCycleById = useCallback(
    (id: string) => cycles.find((c) => c.id === id),
    [cycles]
  );

  return { cycles, saveCycle, deleteCycle, getCycleById };
}
