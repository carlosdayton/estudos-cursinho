import { useCallback, useMemo } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';
import type { StudyCycle } from '../utils/studyLogic';

interface DbStudyCycle {
  id: string;
  user_id: string;
  name: string;
  subject_ids: string[];
  pomodoros_per_subject: number;
  loop: boolean;
  created_at: string;
}

export interface UseStudyCyclesReturn {
  cycles: StudyCycle[];
  loading: boolean;
  saveCycle: (cycle: Omit<StudyCycle, 'id' | 'createdAt'> & { id?: string }) => Promise<StudyCycle | null>;
  deleteCycle: (id: string) => Promise<void>;
  getCycleById: (id: string) => StudyCycle | undefined;
}

function toCycle(db: DbStudyCycle): StudyCycle {
  return {
    id: db.id,
    name: db.name,
    subjectIds: db.subject_ids,
    pomodorosPerSubject: db.pomodoros_per_subject,
    loop: db.loop,
    createdAt: db.created_at,
  };
}

export function useStudyCycles(): UseStudyCyclesReturn {
  const { data, loading, insert, update, remove } = useSupabaseQuery<DbStudyCycle>(
    'study_cycles',
    [],
    { orderBy: { column: 'created_at', ascending: true } }
  );

  const cycles = useMemo(() => data.map(toCycle), [data]);

  const saveCycle = useCallback(
    async (input: Omit<StudyCycle, 'id' | 'createdAt'> & { id?: string }): Promise<StudyCycle | null> => {
      if (input.id) {
        await update(input.id, {
          name: input.name,
          subject_ids: input.subjectIds,
          loop: input.loop,
          pomodoros_per_subject: input.pomodorosPerSubject,
        } as Partial<DbStudyCycle>);
        return cycles.find(c => c.id === input.id) ?? null;
      } else {
        const created = await insert({
          name: input.name,
          subject_ids: input.subjectIds,
          loop: input.loop ?? false,
          pomodoros_per_subject: input.pomodorosPerSubject ?? 1,
          created_at: new Date().toISOString(),
        } as Omit<DbStudyCycle, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
        return created ? toCycle(created) : null;
      }
    },
    [insert, update, cycles]
  );

  const deleteCycle = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove]
  );

  const getCycleById = useCallback(
    (id: string) => cycles.find((c) => c.id === id),
    [cycles]
  );

  return { cycles, loading, saveCycle, deleteCycle, getCycleById };
}
