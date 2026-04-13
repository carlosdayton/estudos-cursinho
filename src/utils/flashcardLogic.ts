/**
 * Tipos e lógica de negócio do módulo de Flashcards.
 * Implementa o algoritmo SM-2 simplificado para repetição espaçada adaptativa.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ReviewResult = 'correct' | 'incorrect';

export interface Flashcard {
  id: string;           // UUID gerado no cliente
  front: string;        // Pergunta (frente do card)
  back: string;         // Resposta (verso do card)
  subjectId: string;    // Referência à Subject existente
  topicId?: string;     // Referência ao Topic (opcional)
  createdAt: string;    // ISO date string
  nextReviewAt: string; // ISO date string — próxima revisão agendada
  easeFactor: number;   // Fator de facilidade SM-2 (padrão: 2.5, range: [1.3, 2.5])
  interval: number;     // Intervalo atual em dias (mínimo: 1)
  repetitions: number;  // Número de revisões bem-sucedidas consecutivas
  lastResult?: ReviewResult;  // Último resultado registrado
  lastReviewedAt?: string;    // ISO date string da última revisão
}

export type FlashcardDraft = Pick<Flashcard, 'front' | 'back' | 'subjectId'> & {
  topicId?: string;
};

export interface FlashcardsState {
  cards: Flashcard[];
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const EASE_FACTOR_DEFAULT = 2.5;
export const EASE_FACTOR_MIN = 1.3;
export const EASE_FACTOR_MAX = 2.5;
export const INTERVAL_MIN = 1;
export const FRONT_BACK_MAX_LENGTH = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Adiciona `days` dias a uma data e retorna ISO string. */
function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

/** Clamp numérico. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Algoritmo SM-2 ───────────────────────────────────────────────────────────

/**
 * Calcula o próximo estado de um flashcard após uma revisão.
 * Baseado no algoritmo SM-2 simplificado.
 *
 * Postconditions:
 *   - Se result === 'incorrect': repetitions = 0, interval = 1, easeFactor reduz 0.2 (min 1.3)
 *   - Se result === 'correct' e repetitions === 0: interval = 1
 *   - Se result === 'correct' e repetitions === 1: interval = 6
 *   - Se result === 'correct' e repetitions > 1: interval = round(interval * easeFactor)
 *   - easeFactor aumenta 0.1 por acerto (max 2.5), reduz 0.2 por erro (min 1.3)
 *   - nextReviewAt = now + interval dias (sempre no futuro)
 */
export function computeNextReview(
  card: Flashcard,
  result: ReviewResult
): Partial<Flashcard> {
  const now = new Date().toISOString();

  if (result === 'incorrect') {
    const newEase = clamp(card.easeFactor - 0.2, EASE_FACTOR_MIN, EASE_FACTOR_MAX);
    return {
      repetitions: 0,
      interval: INTERVAL_MIN,
      easeFactor: newEase,
      lastResult: 'incorrect',
      lastReviewedAt: now,
      nextReviewAt: addDays(new Date(), INTERVAL_MIN),
    };
  }

  // result === 'correct'
  let newInterval: number;
  if (card.repetitions === 0) {
    newInterval = 1;
  } else if (card.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(card.interval * card.easeFactor);
  }
  newInterval = Math.max(INTERVAL_MIN, newInterval);

  const newEase = clamp(card.easeFactor + 0.1, EASE_FACTOR_MIN, EASE_FACTOR_MAX);

  return {
    repetitions: card.repetitions + 1,
    interval: newInterval,
    easeFactor: newEase,
    lastResult: 'correct',
    lastReviewedAt: now,
    nextReviewAt: addDays(new Date(), newInterval),
  };
}

// ─── Funções de consulta ──────────────────────────────────────────────────────

/**
 * Retorna os cards pendentes de revisão (nextReviewAt <= agora),
 * ordenados do mais urgente para o menos urgente (ASC por nextReviewAt).
 *
 * Postconditions:
 *   - Retorna subconjunto de cards onde nextReviewAt <= now
 *   - Ordenado por nextReviewAt ASC (mais atrasado primeiro)
 */
export function getDueCards(cards: Flashcard[]): Flashcard[] {
  const now = new Date();
  return cards
    .filter(c => new Date(c.nextReviewAt) <= now)
    .sort(
      (a, b) =>
        new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
    );
}

/**
 * Retorna o número de cards pendentes de revisão.
 *
 * Postconditions:
 *   - Retorna 0 se nenhum card estiver pendente
 */
export function getDueCount(cards: Flashcard[]): number {
  const now = new Date();
  return cards.filter(c => new Date(c.nextReviewAt) <= now).length;
}

/**
 * Valida um FlashcardDraft antes da criação.
 * Retorna null se válido, ou uma mensagem de erro se inválido.
 */
export function validateDraft(
  draft: FlashcardDraft,
  validSubjectIds: string[]
): string | null {
  if (!draft.front.trim()) return 'A frente do card não pode ser vazia.';
  if (!draft.back.trim()) return 'O verso do card não pode ser vazio.';
  if (draft.front.length > FRONT_BACK_MAX_LENGTH)
    return `A frente não pode exceder ${FRONT_BACK_MAX_LENGTH} caracteres.`;
  if (draft.back.length > FRONT_BACK_MAX_LENGTH)
    return `O verso não pode exceder ${FRONT_BACK_MAX_LENGTH} caracteres.`;
  if (!validSubjectIds.includes(draft.subjectId))
    return 'Matéria inválida. Selecione uma matéria existente.';
  return null;
}

/**
 * Cria um novo Flashcard a partir de um draft, com estado inicial padrão.
 */
export function createFlashcard(draft: FlashcardDraft): Flashcard {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    front: draft.front.trim(),
    back: draft.back.trim(),
    subjectId: draft.subjectId,
    topicId: draft.topicId,
    createdAt: now,
    nextReviewAt: now,
    easeFactor: EASE_FACTOR_DEFAULT,
    interval: INTERVAL_MIN,
    repetitions: 0,
  };
}
