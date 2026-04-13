import { useMemo, useCallback } from 'react';
import type { Subject, Topic } from '../utils/studyLogic';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Matemática', color: '#fb7185', topics: [] },
  { id: '2', name: 'Biologia', color: '#4ade80', topics: [] },
  { id: '3', name: 'Física', color: '#60a5fa', topics: [] },
  { id: '4', name: 'Química', color: '#fbbf24', topics: [] },
];

const SUBJECT_COLORS = ['#818cf8', '#f472b6', '#2dd4bf', '#fbbf24', '#f87171'];

export interface UseSubjectsReturn {
  subjects: Subject[];
  addSubject: (name: string) => void;
  updateSubject: (updated: Subject) => void;
  deleteSubject: (id: string) => void;
  updateTopic: (subjectId: string, topicId: string, patch: Partial<Topic>) => void;
  removeTopic: (subjectId: string, topicId: string) => void;
  overallProgress: number;
  totalTopics: number;
  completedTopics: number;
}

export function useSubjects(): UseSubjectsReturn {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('enem-study-data', DEFAULT_SUBJECTS);

  const addSubject = useCallback((name: string) => {
    if (!name.trim()) return;
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      color: SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
      topics: [],
    };
    setSubjects(prev => [...prev, newSubject]);
  }, [setSubjects]);

  const updateSubject = useCallback((updated: Subject) => {
    setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s));
  }, [setSubjects]);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, [setSubjects]);

  const updateTopic = useCallback((subjectId: string, topicId: string, patch: Partial<Topic>) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? {
              ...s,
              topics: s.topics.map(t =>
                t.id === topicId ? { ...t, ...patch } : t
              ),
            }
          : s
      )
    );
  }, [setSubjects]);

  const removeTopic = useCallback((subjectId: string, topicId: string) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? { ...s, topics: s.topics.filter(t => t.id !== topicId) }
          : s
      )
    );
  }, [setSubjects]);

  const totalTopics = useMemo(
    () => subjects.reduce((acc, s) => acc + s.topics.length, 0),
    [subjects]
  );

  const completedTopics = useMemo(
    () => subjects.reduce(
      (acc, s) => acc + s.topics.filter(t => t.isStudied && t.isExercisesDone).length,
      0
    ),
    [subjects]
  );

  const overallProgress = useMemo(
    () => (totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0),
    [completedTopics, totalTopics]
  );

  return {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    updateTopic,
    removeTopic,
    overallProgress,
    totalTopics,
    completedTopics,
  };
}
