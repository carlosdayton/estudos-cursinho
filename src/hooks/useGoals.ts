import { useCallback, useMemo } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';

export interface WeeklyGoal {
  id: string;
  type: 'topics' | 'pomodoros' | 'simulados' | 'revisoes';
  subjectId?: string;
  target: number;
  weekStart: string;
  createdAt: string;
}

interface DbGoal {
  id: string;
  user_id: string;
  type: 'topics' | 'pomodoros' | 'simulados' | 'revisoes';
  subject_id: string | null;
  target: number;
  week_start: string;
  created_at: string;
}

export interface UseGoalsReturn {
  goals: WeeklyGoal[];
  loading: boolean;
  currentWeekGoals: WeeklyGoal[];
  addGoal: (data: Omit<WeeklyGoal, 'id' | 'createdAt' | 'weekStart'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getWeekStart: (date?: Date) => string;
  streakWeeks: number;
}

export function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().substring(0, 10);
}

function toGoal(db: DbGoal): WeeklyGoal {
  return {
    id: db.id,
    type: db.type,
    subjectId: db.subject_id ?? undefined,
    target: db.target,
    weekStart: db.week_start,
    createdAt: db.created_at,
  };
}

export function useGoals(): UseGoalsReturn {
  const { data, loading, insert, remove } = useSupabaseQuery<DbGoal>(
    'weekly_goals',
    [],
    { orderBy: { column: 'created_at', ascending: false } }
  );

  const goals = useMemo(() => data.map(toGoal), [data]);
  const currentWeekStart = useMemo(() => getMondayOfWeek(), []);

  const currentWeekGoals = useMemo(
    () => goals.filter(g => g.weekStart === currentWeekStart),
    [goals, currentWeekStart]
  );

  const addGoal = useCallback(async (data: Omit<WeeklyGoal, 'id' | 'createdAt' | 'weekStart'>) => {
    await insert({
      type: data.type,
      subject_id: data.subjectId ?? null,
      target: data.target,
      week_start: getMondayOfWeek(),
      created_at: new Date().toISOString(),
    } as Omit<DbGoal, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
  }, [insert]);

  const deleteGoal = useCallback(async (id: string) => {
    await remove(id);
  }, [remove]);

  const getWeekStart = useCallback((date?: Date) => getMondayOfWeek(date), []);
  const streakWeeks = 0;

  return { goals, loading, currentWeekGoals, addGoal, deleteGoal, getWeekStart, streakWeeks };
}
