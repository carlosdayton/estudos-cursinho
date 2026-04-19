import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Subject } from '../utils/studyLogic';
import { getProgress } from '../utils/studyLogic';

export interface ScheduleConfig {
  availableDays: number[]; // 0=Sun … 6=Sat
  prioritySubjectIds: string[];
  startHour: number;  // first visible hour (0-23), default 6
  endHour: number;    // last visible hour inclusive (0-23), default 23
}

/** A single cell in the manual grid: day × real clock hour */
export interface ManualCell {
  day: number;   // 0-6 (day of week)
  hour: number;  // real clock hour (e.g. 6, 7, 8 … 23)
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
/** Returns the array of real clock hours between startHour and endHour inclusive */
export function getVisibleHours(startHour: number, endHour: number): number[] {
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);
  return hours;
}

export interface UseScheduleReturn {
  config: ScheduleConfig;
  setConfig: (c: ScheduleConfig) => void;
  cells: ManualCell[];
  setCell: (day: number, hour: number, subjectId: string | null) => void;
  clearCell: (day: number, hour: number) => void;
  clearAll: () => void;
  generateAuto: (subjects: Subject[]) => void;
  exportAsText: (subjects: Subject[]) => string;
}

export function useSchedule(): UseScheduleReturn {
  const [config, setConfig] = useLocalStorage<ScheduleConfig>('enem-schedule-config', DEFAULT_CONFIG);
  const [cells, setCells] = useLocalStorage<ManualCell[]>('enem-schedule-cells', []);

  const setCell = useCallback((day: number, hour: number, subjectId: string | null) => {
    setCells(prev => {
      const filtered = prev.filter(c => !(c.day === day && c.hour === hour));
      if (subjectId === null) return filtered;
      return [...filtered, { day, hour, subjectId }];
    });
  }, [setCells]);

  const clearCell = useCallback((day: number, hour: number) => {
    setCells(prev => prev.filter(c => !(c.day === day && c.hour === hour)));
  }, [setCells]);

  const clearAll = useCallback(() => setCells([]), [setCells]);

  const generateAuto = useCallback((subjects: Subject[]) => {
    if (!subjects.length || !config.availableDays.length) return;

    const visibleHours = getVisibleHours(config.startHour, config.endHour);
    const hoursPerDay = visibleHours.length;

    // Inverse-progress weighting
    const weights = subjects.map(s => {
      const progress = getProgress(s);
      const isPriority = config.prioritySubjectIds.includes(s.id);
      const base = Math.max(5, 100 - progress);
      return { subject: s, weight: isPriority ? base * 1.5 : base };
    });
    const totalWeight = weights.reduce((a, w) => a + w.weight, 0);
    const totalSlots = config.availableDays.length * hoursPerDay;

    // Allocate slots per subject
    const allocations = weights.map(w => ({
      subject: w.subject,
      slots: Math.max(1, Math.round((w.weight / totalWeight) * totalSlots)),
    }));

    // Fill cells day by day, hour by hour (using real clock hours)
    const newCells: ManualCell[] = [];
    const queue: string[] = [];
    for (const alloc of allocations) {
      for (let i = 0; i < alloc.slots; i++) queue.push(alloc.subject.id);
    }

    let qi = 0;
    outer: for (const day of config.availableDays) {
      for (const h of visibleHours) {
        if (qi >= queue.length) break outer;
        newCells.push({ day, hour: h, subjectId: queue[qi++] });
      }
    }

    setCells(newCells);
  }, [config, setCells]);

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

  return { config, setConfig, cells, setCell, clearCell, clearAll, generateAuto, exportAsText };
}
