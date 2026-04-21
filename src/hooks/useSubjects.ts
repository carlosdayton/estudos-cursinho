import { useMemo, useCallback, useState, useEffect } from 'react';
import type { Subject, Topic } from '../utils/studyLogic';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const SUBJECT_COLORS = ['#818cf8', '#f472b6', '#2dd4bf', '#fbbf24', '#f87171'];

interface DbSubject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  order: number;
  target_topics: number | null;
  created_at: string;
  updated_at: string;
}

interface DbTopic {
  id: string;
  user_id: string;
  subject_id: string;
  name: string;
  is_studied: boolean;
  is_exercises_done: boolean;
  completed_at: string | null;
  review_date: string | null;
  notes: string | null;
  difficulty: string | null;
  review_count: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

function toTopic(db: DbTopic): Topic {
  return {
    id: db.id,
    name: db.name,
    isStudied: db.is_studied,
    isExercisesDone: db.is_exercises_done,
    completedAt: db.completed_at ?? undefined,
    reviewDate: db.review_date ?? undefined,
    notes: db.notes ?? undefined,
    difficulty: db.difficulty as Topic['difficulty'] ?? undefined,
    reviewCount: db.review_count ?? 0,
    lastReviewedAt: db.last_reviewed_at ?? undefined,
  };
}

function buildSubjects(dbSubjects: DbSubject[], dbTopics: DbTopic[]): Subject[] {
  const topicsBySubject = new Map<string, Topic[]>();
  for (const t of dbTopics) {
    const arr = topicsBySubject.get(t.subject_id) ?? [];
    arr.push(toTopic(t));
    topicsBySubject.set(t.subject_id, arr);
  }
  return dbSubjects.map(s => ({
    id: s.id,
    name: s.name,
    color: s.color,
    icon: s.icon ?? undefined,
    order: s.order ?? undefined,
    targetTopics: s.target_topics ?? undefined,
    topics: topicsBySubject.get(s.id) ?? [],
  }));
}

export interface UseSubjectsReturn {
  subjects: Subject[];
  loading: boolean;
  addSubject: (name: string) => Promise<void>;
  updateSubject: (updated: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  updateTopic: (subjectId: string, topicId: string, patch: Partial<Topic>) => Promise<void>;
  removeTopic: (subjectId: string, topicId: string) => Promise<void>;
  overallProgress: number;
  totalTopics: number;
  completedTopics: number;
}

export function useSubjects(): UseSubjectsReturn {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const [sRes, tRes] = await Promise.all([
      supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('topics').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    ]);
    const dbSubjects = (sRes.data ?? []) as DbSubject[];
    const dbTopics = (tRes.data ?? []) as DbTopic[];
    setSubjects(buildSubjects(dbSubjects, dbTopics));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addSubject = useCallback(async (name: string) => {
    if (!user || !name.trim()) return;
    const { data } = await supabase.from('subjects').insert({
      user_id: user.id,
      name: name.trim(),
      color: SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
    }).select().single();
    if (data) {
      setSubjects(prev => [...prev, {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon ?? undefined,
        order: data.order ?? undefined,
        targetTopics: data.target_topics ?? undefined,
        topics: [],
      }]);
    }
  }, [user]);

  const updateSubject = useCallback(async (updated: Subject) => {
    if (!user) return;
    await supabase.from('subjects').update({
      name: updated.name,
      color: updated.color,
      icon: updated.icon ?? null,
      order: updated.order ?? null,
      target_topics: updated.targetTopics ?? null,
    }).eq('id', updated.id).eq('user_id', user.id);
    setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s));
  }, [user]);

  const deleteSubject = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('subjects').delete().eq('id', id).eq('user_id', user.id);
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, [user]);

  const updateTopic = useCallback(async (subjectId: string, topicId: string, patch: Partial<Topic>) => {
    if (!user) return;
    await supabase.from('topics').update({
      name: patch.name,
      is_studied: patch.isStudied,
      is_exercises_done: patch.isExercisesDone,
      completed_at: patch.completedAt ?? null,
      review_date: patch.reviewDate ?? null,
      notes: patch.notes ?? null,
      difficulty: patch.difficulty ?? null,
      review_count: patch.reviewCount ?? null,
      last_reviewed_at: patch.lastReviewedAt ?? null,
    }).eq('id', topicId).eq('user_id', user.id);
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? { ...s, topics: s.topics.map(t => t.id === topicId ? { ...t, ...patch } : t) }
          : s
      )
    );
  }, [user]);

  const removeTopic = useCallback(async (subjectId: string, topicId: string) => {
    if (!user) return;
    await supabase.from('topics').delete().eq('id', topicId).eq('user_id', user.id);
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? { ...s, topics: s.topics.filter(t => t.id !== topicId) }
          : s
      )
    );
  }, [user]);

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
    loading,
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
