import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface WeeklyGoal {
  id: string;
  type: 'topics' | 'pomodoros' | 'simulados' | 'revisoes';
  subjectId?: string;
  target: number;
  weekStart: string; // ISO date of Monday
  createdAt: string;
}

export interface UseGoalsReturn {
  goals: WeeklyGoal[];
  currentWeekGoals: WeeklyGoal[];
  addGoal: (data: Omit<WeeklyGoal, 'id' | 'createdAt' | 'weekStart'>) => void;
  deleteGoal: (id: string) => void;
  getWeekStart: (date?: Date) => string;
  streakWeeks: number;
}

/** Returns the ISO date string for the Monday of the given date's week */
export function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().substring(0, 10);
}

export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useLocalStorage<WeeklyGoal[]>('enem-weekly-goals', []);

  const currentWeekStart = useMemo(() => getMondayOfWeek(), []);

  const currentWeekGoals = useMemo(
    () => goals.filter(g => g.weekStart === currentWeekStart),
    [goals, currentWeekStart]
  );

  const addGoal = useCallback((data: Omit<WeeklyGoal, 'id' | 'createdAt' | 'weekStart'>) => {
    const now = new Date().toISOString();
    const newGoal: WeeklyGoal = {
      ...data,
      id: Math.random().toString(36).slice(2, 11),
      weekStart: getMondayOfWeek(),
      createdAt: now,
    };
    setGoals(prev => [...prev, newGoal]);
  }, [setGoals]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, [setGoals]);

  const getWeekStart = useCallback((date?: Date) => getMondayOfWeek(date), []);

  // Calculate streak: consecutive weeks where all goals were met
  // We store completed weeks in a separate key — here we just return 0 as a placeholder
  // since actual progress calculation happens in the component
  const streakWeeks = 0;

  return { goals, currentWeekGoals, addGoal, deleteGoal, getWeekStart, streakWeeks };
}
