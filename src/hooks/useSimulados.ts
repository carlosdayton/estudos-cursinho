import { useMemo, useCallback } from 'react';
import type { Simulado, SimuladoScores } from '../utils/studyLogic';
import { useSupabaseQuery } from './useSupabaseQuery';
import { useAuth } from '../context/AuthContext';

interface DbSimulado {
  id: string;
  user_id: string;
  date: string;
  scores: SimuladoScores;
  total: number;
  label: string | null;
  notes: string | null;
  created_at: string;
}

export interface UseSimuladosReturn {
  simulados: Simulado[];
  loading: boolean;
  addSimulado: (scores: SimuladoScores, label?: string, notes?: string) => Promise<void>;
  deleteSimulado: (id: string) => Promise<void>;
  averageScore: number;
  bestScore: number;
  trend: 'up' | 'down' | 'stable';
}

function toSimulado(db: DbSimulado): Simulado {
  return {
    id: db.id,
    date: db.date,
    scores: db.scores,
    total: db.total,
    label: db.label ?? undefined,
    notes: db.notes ?? undefined,
  };
}

export function useSimulados(): UseSimuladosReturn {
  const { user } = useAuth();
  const { data, loading, insert, remove } = useSupabaseQuery<DbSimulado>(
    'simulados',
    [],
    { orderBy: { column: 'date', ascending: false } }
  );

  const simulados = useMemo(() => data.map(toSimulado), [data]);

  const addSimulado = useCallback(async (scores: SimuladoScores, label?: string, notes?: string) => {
    if (!user) return;
    const total = scores.linguagens + scores.humanas + scores.natureza + scores.matematica + scores.redacao;
    await insert({
      date: new Date().toISOString(),
      scores: { ...scores },
      total,
      label: label ?? null,
      notes: notes ?? null,
    } as Omit<DbSimulado, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
  }, [user, insert]);

  const deleteSimulado = useCallback(async (id: string) => {
    await remove(id);
  }, [remove]);

  const averageScore = useMemo(() => {
    if (simulados.length === 0) return 0;
    const sum = simulados.reduce((acc, s) => acc + s.total, 0);
    return Math.round(sum / simulados.length);
  }, [simulados]);

  const bestScore = useMemo(() => {
    if (simulados.length === 0) return 0;
    return Math.max(...simulados.map(s => s.total));
  }, [simulados]);

  const trend = useMemo((): 'up' | 'down' | 'stable' => {
    if (simulados.length < 2) return 'stable';
    const recent = simulados.slice(0, 3);
    const older = simulados.slice(3);
    if (older.length === 0) return 'stable';
    const recentAvg = recent.reduce((acc, s) => acc + s.total, 0) / recent.length;
    const olderAvg = older.reduce((acc, s) => acc + s.total, 0) / older.length;
    if (recentAvg > olderAvg) return 'up';
    if (recentAvg < olderAvg) return 'down';
    return 'stable';
  }, [simulados]);

  return {
    simulados,
    loading,
    addSimulado,
    deleteSimulado,
    averageScore,
    bestScore,
    trend,
  };
}
