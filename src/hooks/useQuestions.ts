import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Question {
  id: string;
  statement: string;
  alternatives: { a: string; b: string; c: string; d: string; e: string };
  answer: 'a' | 'b' | 'c' | 'd' | 'e';
  subjectId: string;
  subjectName: string;
  year?: number;
  createdAt: string;
}

export interface QuestionAttempt {
  questionId: string;
  correct: boolean;
  answeredAt: string;
}

interface DbQuestion {
  id: string;
  user_id: string;
  statement: string;
  alternatives: Record<string, string>;
  answer: string;
  subject_id: string | null;
  subject_name: string | null;
  year: number | null;
  created_at: string;
}

interface DbAttempt {
  id: string;
  user_id: string;
  question_id: string;
  correct: boolean;
  answered_at: string;
}

function toQuestion(db: DbQuestion): Question {
  return {
    id: db.id,
    statement: db.statement,
    alternatives: db.alternatives as Question['alternatives'],
    answer: db.answer as Question['answer'],
    subjectId: db.subject_id ?? '',
    subjectName: db.subject_name ?? '',
    year: db.year ?? undefined,
    createdAt: db.created_at,
  };
}

function toAttempt(db: DbAttempt): QuestionAttempt {
  return {
    questionId: db.question_id,
    correct: db.correct,
    answeredAt: db.answered_at,
  };
}

export interface UseQuestionsReturn {
  questions: Question[];
  attempts: QuestionAttempt[];
  loading: boolean;
  addQuestion: (data: Omit<Question, 'id' | 'createdAt'>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  recordAttempt: (questionId: string, correct: boolean) => Promise<void>;
  getStatsBySubject: () => Record<string, { total: number; correct: number; pct: number }>;
  getRandomQuestion: (subjectId?: string) => Question | null;
}

export function useQuestions(): UseQuestionsReturn {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const [qRes, aRes] = await Promise.all([
      supabase.from('questions').select('*').eq('user_id', user.id),
      supabase.from('question_attempts').select('*').eq('user_id', user.id),
    ]);
    if (!qRes.error && qRes.data) setQuestions((qRes.data as DbQuestion[]).map(toQuestion));
    if (!aRes.error && aRes.data) setAttempts((aRes.data as DbAttempt[]).map(toAttempt));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addQuestion = useCallback(async (data: Omit<Question, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data: created } = await supabase.from('questions').insert({
      user_id: user.id,
      statement: data.statement,
      alternatives: data.alternatives,
      answer: data.answer,
      subject_id: data.subjectId,
      subject_name: data.subjectName,
      year: data.year ?? null,
    }).select().single();
    if (created) setQuestions(prev => [toQuestion(created as DbQuestion), ...prev]);
  }, [user]);

  const deleteQuestion = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('questions').delete().eq('id', id).eq('user_id', user.id);
    await supabase.from('question_attempts').delete().eq('question_id', id).eq('user_id', user.id);
    setQuestions(prev => prev.filter(q => q.id !== id));
    setAttempts(prev => prev.filter(a => a.questionId !== id));
  }, [user]);

  const recordAttempt = useCallback(async (questionId: string, correct: boolean) => {
    if (!user) return;
    const { data: created } = await supabase.from('question_attempts').insert({
      user_id: user.id,
      question_id: questionId,
      correct,
    }).select().single();
    if (created) setAttempts(prev => [...prev, toAttempt(created as DbAttempt)]);
  }, [user]);

  const getStatsBySubject = useCallback(() => {
    const stats: Record<string, { total: number; correct: number; pct: number }> = {};
    for (const attempt of attempts) {
      const q = questions.find(q => q.id === attempt.questionId);
      if (!q) continue;
      if (!stats[q.subjectId]) stats[q.subjectId] = { total: 0, correct: 0, pct: 0 };
      stats[q.subjectId].total++;
      if (attempt.correct) stats[q.subjectId].correct++;
    }
    for (const key of Object.keys(stats)) {
      stats[key].pct = stats[key].total > 0 ? Math.round((stats[key].correct / stats[key].total) * 100) : 0;
    }
    return stats;
  }, [questions, attempts]);

  const getRandomQuestion = useCallback((subjectId?: string) => {
    const pool = subjectId ? questions.filter(q => q.subjectId === subjectId) : questions;
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [questions]);

  return { questions, attempts, loading, addQuestion, deleteQuestion, recordAttempt, getStatsBySubject, getRandomQuestion };
}
