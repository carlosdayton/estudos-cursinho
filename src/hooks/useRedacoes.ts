import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Redacao {
  id: string;
  title: string;
  content: string;
  competencias: {
    c1: number; // 0-200 domínio da norma culta
    c2: number; // 0-200 compreensão da proposta
    c3: number; // 0-200 seleção de argumentos
    c4: number; // 0-200 coesão textual
    c5: number; // 0-200 proposta de intervenção
  };
  totalScore: number;
  createdAt: string;
  updatedAt: string;
  theme?: string;
}

export interface UseRedacoesReturn {
  redacoes: Redacao[];
  addRedacao: (data: Omit<Redacao, 'id' | 'createdAt' | 'updatedAt' | 'totalScore'>) => void;
  updateRedacao: (id: string, data: Partial<Omit<Redacao, 'id' | 'createdAt'>>) => void;
  deleteRedacao: (id: string) => void;
}

export function useRedacoes(): UseRedacoesReturn {
  const [redacoes, setRedacoes] = useLocalStorage<Redacao[]>('enem-redacoes', []);

  const addRedacao = useCallback((data: Omit<Redacao, 'id' | 'createdAt' | 'updatedAt' | 'totalScore'>) => {
    const totalScore = data.competencias.c1 + data.competencias.c2 + data.competencias.c3 + data.competencias.c4 + data.competencias.c5;
    const now = new Date().toISOString();
    const newRedacao: Redacao = {
      ...data,
      id: Math.random().toString(36).slice(2, 11),
      totalScore,
      createdAt: now,
      updatedAt: now,
    };
    setRedacoes(prev => [newRedacao, ...prev]);
  }, [setRedacoes]);

  const updateRedacao = useCallback((id: string, data: Partial<Omit<Redacao, 'id' | 'createdAt'>>) => {
    setRedacoes(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...data, updatedAt: new Date().toISOString() };
      if (data.competencias) {
        updated.totalScore = data.competencias.c1 + data.competencias.c2 + data.competencias.c3 + data.competencias.c4 + data.competencias.c5;
      }
      return updated;
    }));
  }, [setRedacoes]);

  const deleteRedacao = useCallback((id: string) => {
    setRedacoes(prev => prev.filter(r => r.id !== id));
  }, [setRedacoes]);

  return { redacoes, addRedacao, updateRedacao, deleteRedacao };
}
