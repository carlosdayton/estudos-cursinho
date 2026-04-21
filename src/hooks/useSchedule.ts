import { useCallback, useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Subject } from '../utils/studyLogic';
import { getProgress } from '../utils/studyLogic';

export interface ScheduleConfig {
  availableDays: number[];
  prioritySubjectIds: string[];
  startHour: number;
  endHour: number;
}

export interface ManualCell {
  day: number;
  hour: number;
  subjectId: string | null;
}

export interface GeneratedSchedule {
  cells: ManualCell[];
  generatedAt: string;
}

const DEFAULT_CONFIG: ScheduleConfig = {
  availableDays: [1, 2, 3, 4, 5],
  prioritySubjectIds: [],
  startHour: 6,
  endHour: 23,
};

export const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export function getVisibleHours(startHour: number, endHour: number): number[] {
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);
  return hours;
}

interface DbScheduleCell {
  id: string;
  user_id: string;
  day: number;
  hour: number;
  subject_id: string | null;
  created_at: string;
}

function toCell(db: DbScheduleCell): ManualCell {
  return { day: db.day, hour: db.hour, subjectId: db.subject_id };
}

export interface UseScheduleReturn {
  config: ScheduleConfig;
  setConfig: (c: ScheduleConfig) => void;
  cells: ManualCell[];
  loading: boolean;
  setCell: (day: number, hour: number, subjectId: string | null) => Promise<void>;
  clearCell: (day: number, hour: number) => Promise<void>;
  clearAll: () => Promise<void>;
  generateAuto: (subjects: Subject[]) => Promise<void>;
  exportAsText: (subjects: Subject[]) => string;
}

export function useSchedule(): UseScheduleReturn {
  const { user } = useAuth();
  const [config, setConfig] = useLocalStorage<ScheduleConfig>('enem-schedule-config', DEFAULT_CONFIG);
  const [cells, setCellsState] = useState<ManualCell[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCells = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('schedule_cells')
      .select('*')
      .eq('user_id', user.id);
    if (!error && data) {
      setCellsState((data as DbScheduleCell[]).map(toCell));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCells();
  }, [fetchCells]);

  const setCell = useCallback(async (day: number, hour: number, subjectId: string | null) => {
    if (!user) return;
    if (subjectId === null) {
      await supabase.from('schedule_cells').delete().eq('user_id', user.id).eq('day', day).eq('hour', hour);
      setCellsState(prev => prev.filter(c => !(c.day === day && c.hour === hour)));
      return;
    }
    const { data, error } = await supabase
      .from('schedule_cells')
      .upsert({ user_id: user.id, day, hour, subject_id: subjectId }, { onConflict: 'user_id,day,hour' })
      .select()
      .single();
    if (!error && data) {
      setCellsState(prev => {
        const filtered = prev.filter(c => !(c.day === day && c.hour === hour));
        return [...filtered, toCell(data as DbScheduleCell)];
      });
    }
  }, [user]);

  const clearCell = useCallback(async (day: number, hour: number) => {
    if (!user) return;
    await supabase.from('schedule_cells').delete().eq('user_id', user.id).eq('day', day).eq('hour', hour);
    setCellsState(prev => prev.filter(c => !(c.day === day && c.hour === hour)));
  }, [user]);

  const clearAll = useCallback(async () => {
    if (!user) return;
    await supabase.from('schedule_cells').delete().eq('user_id', user.id);
    setCellsState([]);
  }, [user]);

  const generateAuto = useCallback(async (subjects: Subject[]) => {
    if (!subjects.length || !config.availableDays.length || !user) return;

    const visibleHours = getVisibleHours(config.startHour, config.endHour);
    const hoursPerDay = visibleHours.length;

    const weights = subjects.map(s => {
      const progress = getProgress(s);
      const isPriority = config.prioritySubjectIds.includes(s.id);
      const base = Math.max(5, 100 - progress);
      return { subject: s, weight: isPriority ? base * 1.5 : base };
    });
    const totalWeight = weights.reduce((a, w) => a + w.weight, 0);
    const totalSlots = config.availableDays.length * hoursPerDay;

    const allocations = weights.map(w => ({
      subject: w.subject,
      slots: Math.max(1, Math.round((w.weight / totalWeight) * totalSlots)),
    }));

    const queue: string[] = [];
    for (const alloc of allocations) {
      for (let i = 0; i < alloc.slots; i++) queue.push(alloc.subject.id);
    }

    const newCells: ManualCell[] = [];
    let qi = 0;
    outer: for (const day of config.availableDays) {
      for (const h of visibleHours) {
        if (qi >= queue.length) break outer;
        newCells.push({ day, hour: h, subjectId: queue[qi++] });
      }
    }

    // Delete existing and insert new
    await supabase.from('schedule_cells').delete().eq('user_id', user.id);
    const rows = newCells.map(c => ({
      user_id: user.id,
      day: c.day,
      hour: c.hour,
      subject_id: c.subjectId,
    }));
    if (rows.length) {
      await supabase.from('schedule_cells').insert(rows);
    }
    setCellsState(newCells);
  }, [config, user]);

  const exportAsText = useCallback((subjects: Subject[]) => {
    const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));
    const lines = ['=== CRONOGRAMA DE ESTUDOS ===', ''];
    for (const day of config.availableDays) {
      const dayCells = cells.filter(c => c.day === day && c.subjectId).sort((a, b) => a.hour - b.hour);
      if (!dayCells.length) continue;
      lines.push(`${DAY_NAMES[day]}:`);
      for (const c of dayCells) {
        lines.push(`  ${c.hour}h — ${subjectMap[c.subjectId!] ?? c.subjectId}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }, [cells, config]);

  return { config, setConfig, cells, loading, setCell, clearCell, clearAll, generateAuto, exportAsText };
}
