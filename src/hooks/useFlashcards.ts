import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { FlashcardDraft, FlashcardsState, ReviewResult } from '../utils/flashcardLogic';
import {
  computeNextReview,
  createFlashcard,
  getDueCards,
  validateDraft,
} from '../utils/flashcardLogic';

const STORAGE_KEY = 'flashcards-data';
const INITIAL_STATE: FlashcardsState = { cards: [] };

/**
 * Hook principal do módulo de Flashcards.
 * Gerencia o estado global dos cards e expõe operações CRUD + revisão.
 */
export function useFlashcards(validSubjectIds: string[] = []) {
  const [state, setState] = useLocalStorage<FlashcardsState>(
    STORAGE_KEY,
    INITIAL_STATE
  );

  const cards = state.cards;

  /** Cards pendentes de revisão, ordenados por urgência (memoizado). */
  const dueCards = useMemo(() => getDueCards(cards), [cards]);

  /**
   * Adiciona um novo flashcard ao estado.
   * Retorna null em caso de sucesso, ou uma mensagem de erro se inválido.
   */
  const addFlashcard = useCallback(
    (draft: FlashcardDraft): string | null => {
      const error = validateDraft(draft, validSubjectIds);
      if (error) return error;

      const newCard = createFlashcard(draft);
      setState(prev => ({ cards: [...prev.cards, newCard] }));
      return null;
    },
    [setState, validSubjectIds]
  );

  /**
   * Registra o resultado de uma revisão e recalcula o próximo agendamento.
   */
  const recordResult = useCallback(
    (id: string, result: ReviewResult): void => {
      setState(prev => ({
        cards: prev.cards.map(card =>
          card.id === id
            ? { ...card, ...computeNextReview(card, result) }
            : card
        ),
      }));
    },
    [setState]
  );

  /**
   * Remove um flashcard pelo id. Idempotente para ids inexistentes.
   */
  const deleteFlashcard = useCallback(
    (id: string): void => {
      setState(prev => ({
        cards: prev.cards.filter(card => card.id !== id),
      }));
    },
    [setState]
  );

  /**
   * Atualiza front/back de um flashcard existente, preservando o estado de revisão.
   * Retorna null em caso de sucesso, ou uma mensagem de erro se inválido.
   */
  const updateFlashcard = useCallback(
    (
      id: string,
      patch: Pick<FlashcardDraft, 'front' | 'back'> & { topicId?: string }
    ): string | null => {
      const card = cards.find(c => c.id === id);
      if (!card) return 'Flashcard não encontrado.';

      const draftForValidation: FlashcardDraft = {
        front: patch.front,
        back: patch.back,
        subjectId: card.subjectId,
        topicId: patch.topicId,
      };
      const error = validateDraft(draftForValidation, validSubjectIds);
      if (error) return error;

      setState(prev => ({
        cards: prev.cards.map(c =>
          c.id === id
            ? {
                ...c,
                front: patch.front.trim(),
                back: patch.back.trim(),
                topicId: patch.topicId,
              }
            : c
        ),
      }));
      return null;
    },
    [cards, setState, validSubjectIds]
  );

  return {
    cards,
    dueCards,
    addFlashcard,
    recordResult,
    deleteFlashcard,
    updateFlashcard,
  };
}
