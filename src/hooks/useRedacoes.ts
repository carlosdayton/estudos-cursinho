import { useCallback, useMemo } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';

export interface Redacao {
  id: string;
  title: string;
  content: string;
  competencias: {
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    c5: number;
  };
  totalScore: number;
  createdAt: string;
  updatedAt: string;
  theme?: string;
}

interface DbRedacao {
  id: string;
  user_id: string;
  title: string;
  content: string;
  competencias: Record<string, number>;
  total_score: number;
  theme: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseRedacoesReturn {
  redacoes: Redacao[];
  loading: boolean;
  addRedacao: (data: Omit<Redacao, 'id' | 'createdAt' | 'updatedAt' | 'totalScore'>) => Promise<void>;
  updateRedacao: (id: string, data: Partial<Omit<Redacao, 'id' | 'createdAt'>>) => Promise<void>;
  deleteRedacao: (id: string) => Promise<void>;
}

function toRedacao(db: DbRedacao): Redacao {
  return {
    id: db.id,
    title: db.title,
    content: db.content,
    competencias: db.competencias as Redacao['competencias'],
    totalScore: db.total_score,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    theme: db.theme ?? undefined,
  };
}

function calcTotalScore(competencias: Redacao['competencias']): number {
  return competencias.c1 + competencias.c2 + competencias.c3 + competencias.c4 + competencias.c5;
}

export function useRedacoes(): UseRedacoesReturn {
  const { data, loading, insert, update, remove } = useSupabaseQuery<DbRedacao>(
    'redacoes',
    [],
    { orderBy: { column: 'created_at', ascending: false } }
  );

  const redacoes = useMemo(() => data.map(toRedacao), [data]);

  const addRedacao = useCallback(async (data: Omit<Redacao, 'id' | 'createdAt' | 'updatedAt' | 'totalScore'>) => {
    const totalScore = calcTotalScore(data.competencias);
    const now = new Date().toISOString();
    await insert({
      title: data.title,
      content: data.content,
      competencias: data.competencias,
      total_score: totalScore,
      theme: data.theme ?? null,
      created_at: now,
      updated_at: now,
    } as Omit<DbRedacao, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
  }, [insert]);

  const updateRedacao = useCallback(async (id: string, data: Partial<Omit<Redacao, 'id' | 'createdAt'>>) => {
    const totalScore = data.competencias ? calcTotalScore(data.competencias) : undefined;
    await update(id, {
      ...data,
      total_score: totalScore,
      updated_at: new Date().toISOString(),
    } as Partial<DbRedacao>);
  }, [update]);

  const deleteRedacao = useCallback(async (id: string) => {
    await remove(id);
  }, [remove]);

  return { redacoes, loading, addRedacao, updateRedacao, deleteRedacao };
}
