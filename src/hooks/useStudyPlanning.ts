import { useCallback, useEffect, useMemo } from 'react';
import type { Subject } from '../utils/studyLogic';
import type {
  StudyGoal,
  SubjectPriority,
  SubjectPriorityMap,
  WeeklySchedule,
  PaceIndicator,
} from '../utils/plannerTypes';
import {
  STORAGE_KEY_GOAL,
  STORAGE_KEY_PRIORITIES,
  DEFAULT_GOAL,
  makeDefaultSubjectPriority,
} from '../utils/plannerTypes';
import { clampHours, generateSchedule, calculatePace } from '../utils/plannerEngine';
import { useLocalStorage } from './useLocalStorage';

export interface UseStudyPlanningReturn {
  goal: StudyGoal;
  priorities: SubjectPriorityMap;
  schedule: WeeklySchedule;
  pace: PaceIndicator;
  setTargetDate: (date: string) => void;
  setDailyHours: (dayIndex: number, hours: number) => void;
  setPriority: (subjectId: string, patch: Partial<SubjectPriority>) => void;
}

export function useStudyPlanning(subjects: Subject[]): UseStudyPlanningReturn {
  // 3.1 — Persistência via useLocalStorage
  const [goal, setGoal] = useLocalStorage<StudyGoal>(STORAGE_KEY_GOAL, DEFAULT_GOAL);
  const [priorities, setPriorities] = useLocalStorage<SubjectPriorityMap>(STORAGE_KEY_PRIORITIES, {});

  // 3.4 — Sincroniza SubjectPriorityMap com a lista de subjects
  useEffect(() => {
    setPriorities(prev => {
      const next: SubjectPriorityMap = {};
      let changed = false;

      for (const subject of subjects) {
        if (prev[subject.id]) {
          next[subject.id] = prev[subject.id];
        } else {
          // Nova matéria → inicializa com defaults (Req 6.5)
          next[subject.id] = makeDefaultSubjectPriority(subject.id);
          changed = true;
        }
      }

      // Verifica se alguma matéria foi removida (Req 6.4)
      const prevKeys = Object.keys(prev);
      const nextKeys = subjects.map(s => s.id);
      if (prevKeys.some(k => !nextKeys.includes(k))) changed = true;

      return changed || Object.keys(next).length !== prevKeys.length ? next : prev;
    });
  }, [subjects, setPriorities]);

  // 3.2 — setTargetDate
  const setTargetDate = useCallback((date: string) => {
    setGoal(prev => ({ ...prev, targetDate: date }));
  }, [setGoal]);

  // 3.2 — setDailyHours com clamping automático
  const setDailyHours = useCallback((dayIndex: number, hours: number) => {
    setGoal(prev => {
      const newHours = [...prev.dailyHours];
      newHours[dayIndex] = clampHours(hours);
      return { ...prev, dailyHours: newHours };
    });
  }, [setGoal]);

  // 3.3 — setPriority
  const setPriority = useCallback((subjectId: string, patch: Partial<SubjectPriority>) => {
    setPriorities(prev => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] ?? makeDefaultSubjectPriority(subjectId)),
        ...patch,
      },
    }));
  }, [setPriorities]);

  // 3.5 — Computa schedule e pace via useMemo
  const schedule: WeeklySchedule = useMemo(
    () => generateSchedule(subjects, goal, priorities),
    [subjects, goal, priorities],
  );

  const pace: PaceIndicator = useMemo(
    () => calculatePace(subjects, goal),
    [subjects, goal],
  );

  return { goal, priorities, schedule, pace, setTargetDate, setDailyHours, setPriority };
}
