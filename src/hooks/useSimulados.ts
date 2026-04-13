import { useMemo, useCallback } from 'react';
import type { Simulado, SimuladoScores } from '../utils/studyLogic';
import { useLocalStorage } from './useLocalStorage';

export interface UseSimuladosReturn {
  simulados: Simulado[];
  addSimulado: (scores: SimuladoScores) => void;
  deleteSimulado: (id: string) => void;
  averageScore: number;
  bestScore: number;
  trend: 'up' | 'down' | 'stable';
}

export function useSimulados(): UseSimuladosReturn {
  const [simulados, setSimulados] = useLocalStorage<Simulado[]>('enem-simulados-data', []);

  const addSimulado = useCallback((scores: SimuladoScores) => {
    const total = scores.linguagens + scores.humanas + scores.natureza + scores.matematica + scores.redacao;
    const newSimulado: Simulado = {
      id: Math.random().toString(36).slice(2, 11),
      date: new Date().toISOString(),
      scores: { ...scores },
      total,
    };
    setSimulados(prev => [newSimulado, ...prev]);
  }, [setSimulados]);

  const deleteSimulado = useCallback((id: string) => {
    setSimulados(prev => prev.filter(s => s.id !== id));
  }, [setSimulados]);

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

    // simulados[0] é o mais recente (inserido no início)
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
    addSimulado,
    deleteSimulado,
    averageScore,
    bestScore,
    trend,
  };
}
