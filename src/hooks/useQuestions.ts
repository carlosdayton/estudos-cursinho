import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

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

export interface UseQuestionsReturn {
  questions: Question[];
  attempts: QuestionAttempt[];
  addQuestion: (data: Omit<Question, 'id' | 'createdAt'>) => void;
  deleteQuestion: (id: string) => void;
  recordAttempt: (questionId: string, correct: boolean) => void;
  getStatsBySubject: () => Record<string, { total: number; correct: number; pct: number }>;
  getRandomQuestion: (subjectId?: string) => Question | null;
}

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useLocalStorage<Question[]>('enem-questions', []);
  const [attempts, setAttempts] = useLocalStorage<QuestionAttempt[]>('enem-question-attempts', []);

  const addQuestion = useCallback((data: Omit<Question, 'id' | 'createdAt'>) => {
    const newQ: Question = {
      ...data,
      id: Math.random().toString(36).slice(2, 11),
      createdAt: new Date().toISOString(),
    };
    setQuestions(prev => [newQ, ...prev]);
  }, [setQuestions]);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, [setQuestions]);

  const recordAttempt = useCallback((questionId: string, correct: boolean) => {
    setAttempts(prev => [...prev, { questionId, correct, answeredAt: new Date().toISOString() }]);
  }, [setAttempts]);

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

  return { questions, attempts, addQuestion, deleteQuestion, recordAttempt, getStatsBySubject, getRandomQuestion };
}
