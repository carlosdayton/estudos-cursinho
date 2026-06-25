import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AIFeedback {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  feedbackGeral: string;
  feedbackC1: string;
  feedbackC2: string;
  feedbackC3: string;
  feedbackC4: string;
  feedbackC5: string;
  pontosFortres: string[];
  pontosAMelhorar: string[];
}

export interface UseAIEvaluationReturn {
  isLoading: boolean;
  error: string | null;
  evaluate: (theme: string, content: string) => Promise<AIFeedback | null>;
  clearError: () => void;
}

export function useAIEvaluation(): UseAIEvaluationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (theme: string, content: string): Promise<AIFeedback | null> => {
    if (!content.trim() || content.trim().split(/\s+/).length < 30) {
      setError('A redação precisa ter pelo menos 30 palavras para ser avaliada.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('evaluate-essay', {
        body: { theme: theme || '', content },
      });

      if (fnError) {
        // fnError.message contains the error body from the Edge Function
        const msg = fnError.message || 'Erro ao chamar o serviço de IA.';
        throw new Error(msg);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as AIFeedback;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido ao avaliar a redação.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, evaluate, clearError };
}
