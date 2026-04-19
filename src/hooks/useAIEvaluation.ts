import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

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
  apiKey: string;
  setApiKey: (key: string) => void;
  isLoading: boolean;
  error: string | null;
  evaluate: (theme: string, content: string) => Promise<AIFeedback | null>;
  clearError: () => void;
}

const SYSTEM_PROMPT = `Você é um corretor especialista em redações do ENEM, com profundo conhecimento das 5 competências avaliadas pelo INEP. Sua tarefa é avaliar redações dissertativo-argumentativas com rigor e precisão.

As 5 competências e suas pontuações (0, 40, 80, 120, 160 ou 200 pontos cada):

C1 - Domínio da Norma Culta: Avalie ortografia, acentuação, pontuação, concordância, regência e outros aspectos gramaticais.
C2 - Compreensão da Proposta: Avalie se o texto aborda o tema proposto, desenvolve uma tese clara e usa o tipo textual correto (dissertativo-argumentativo).
C3 - Seleção de Argumentos: Avalie a qualidade dos argumentos, uso de repertório sociocultural pertinente e a capacidade de defender o ponto de vista.
C4 - Coesão Textual: Avalie o uso de conectivos, a progressão das ideias, a coerência e a articulação entre os parágrafos.
C5 - Proposta de Intervenção: Avalie se há uma proposta de intervenção detalhada, viável, relacionada ao tema e que respeite os direitos humanos. Deve ter: agente, ação, modo/meio, efeito/finalidade e detalhamento.

Critérios de pontuação:
- 0: Não atende ao critério
- 40: Atende precariamente
- 80: Atende parcialmente
- 120: Atende medianamente
- 160: Atende bem
- 200: Atende plenamente

Responda APENAS com um JSON válido no seguinte formato, sem markdown, sem texto adicional:
{
  "c1": <número>,
  "c2": <número>,
  "c3": <número>,
  "c4": <número>,
  "c5": <número>,
  "feedbackGeral": "<parágrafo geral de 2-3 frases sobre a redação>",
  "feedbackC1": "<feedback específico de 1-2 frases sobre C1>",
  "feedbackC2": "<feedback específico de 1-2 frases sobre C2>",
  "feedbackC3": "<feedback específico de 1-2 frases sobre C3>",
  "feedbackC4": "<feedback específico de 1-2 frases sobre C4>",
  "feedbackC5": "<feedback específico de 1-2 frases sobre C5>",
  "pontosFortres": ["<ponto forte 1>", "<ponto forte 2>"],
  "pontosAMelhorar": ["<ponto a melhorar 1>", "<ponto a melhorar 2>", "<ponto a melhorar 3>"]
}`;

export function useAIEvaluation(): UseAIEvaluationReturn {
  const [apiKey, setApiKey] = useLocalStorage<string>('openai-api-key', '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (theme: string, content: string): Promise<AIFeedback | null> => {
    if (!apiKey.trim()) {
      setError('Configure sua chave da API OpenAI nas configurações.');
      return null;
    }
    if (!content.trim() || content.trim().split(/\s+/).length < 30) {
      setError('A redação precisa ter pelo menos 30 palavras para ser avaliada.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    const userMessage = `Tema: ${theme || 'Não informado'}

Redação:
${content}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 1200,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Chave de API inválida. Verifique sua chave OpenAI.');
        if (response.status === 429) throw new Error('Limite de requisições atingido. Aguarde um momento e tente novamente.');
        if (response.status === 402) throw new Error('Créditos insuficientes na conta OpenAI.');
        throw new Error(err?.error?.message ?? `Erro ${response.status} na API OpenAI.`);
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content ?? '';

      // Parse JSON — strip any accidental markdown fences
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed: AIFeedback = JSON.parse(cleaned);

      // Clamp all scores to valid ENEM values
      const validSteps = [0, 40, 80, 120, 160, 200];
      const clamp = (v: number) => validSteps.reduce((prev, curr) =>
        Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
      );

      return {
        ...parsed,
        c1: clamp(parsed.c1),
        c2: clamp(parsed.c2),
        c3: clamp(parsed.c3),
        c4: clamp(parsed.c4),
        c5: clamp(parsed.c5),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido ao chamar a IA.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const clearError = useCallback(() => setError(null), []);

  return { apiKey, setApiKey, isLoading, error, evaluate, clearError };
}
