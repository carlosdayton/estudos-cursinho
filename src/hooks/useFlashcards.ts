import { useMemo, useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Flashcard, FlashcardDraft, ReviewResult } from '../utils/flashcardLogic';
import {
  computeNextReview,
  getDueCards,
  validateDraft,
} from '../utils/flashcardLogic';

interface DbFlashcard {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id: string | null;
  front: string;
  back: string;
  next_review: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  created_at: string;
  updated_at: string;
}

function toFlashcard(db: DbFlashcard): Flashcard {
  return {
    id: db.id,
    front: db.front,
    back: db.back,
    subjectId: db.subject_id,
    topicId: db.topic_id ?? undefined,
    createdAt: db.created_at,
    nextReviewAt: db.next_review,
    easeFactor: db.ease_factor,
    interval: db.interval_days,
    repetitions: db.repetitions,
  };
}

export function useFlashcards(validSubjectIds: string[] = []) {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setCards((data as DbFlashcard[]).map(toFlashcard));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const dueCards = useMemo(() => getDueCards(cards), [cards]);

  const addFlashcard = useCallback(
    async (draft: FlashcardDraft): Promise<string | null> => {
      const error = validateDraft(draft, validSubjectIds);
      if (error) return error;
      if (!user) return 'Usuário não autenticado.';

      const now = new Date().toISOString();
      const { data } = await supabase.from('flashcards').insert({
        user_id: user.id,
        subject_id: draft.subjectId,
        topic_id: draft.topicId ?? null,
        front: draft.front.trim(),
        back: draft.back.trim(),
        next_review: now,
        interval_days: 1,
        ease_factor: 2.5,
        repetitions: 0,
      }).select('*').single();

      if (data) {
        setCards(prev => [...prev, toFlashcard(data as DbFlashcard)]);
      }
      return null;
    },
    [user, validSubjectIds]
  );

  const recordResult = useCallback(
    async (id: string, result: ReviewResult): Promise<void> => {
      const card = cards.find(c => c.id === id);
      if (!card || !user) return;

      const updates = computeNextReview(card, result);
      const { data } = await supabase.from('flashcards').update({
        next_review: updates.nextReviewAt,
        interval_days: updates.interval,
        ease_factor: updates.easeFactor,
        repetitions: updates.repetitions,
      }).eq('id', id).eq('user_id', user.id).select('*').single();

      if (data) {
        setCards(prev =>
          prev.map(c => (c.id === id ? { ...c, ...updates } : c))
        );
      }
    },
    [cards, user]
  );

  const deleteFlashcard = useCallback(
    async (id: string): Promise<void> => {
      if (!user) return;
      await supabase.from('flashcards').delete().eq('id', id).eq('user_id', user.id);
      setCards(prev => prev.filter(card => card.id !== id));
    },
    [user]
  );

  const updateFlashcard = useCallback(
    async (
      id: string,
      patch: Pick<FlashcardDraft, 'front' | 'back'> & { topicId?: string }
    ): Promise<string | null> => {
      const card = cards.find(c => c.id === id);
      if (!card) return 'Flashcard não encontrado.';
      if (!user) return 'Usuário não autenticado.';

      const draftForValidation: FlashcardDraft = {
        front: patch.front,
        back: patch.back,
        subjectId: card.subjectId,
        topicId: patch.topicId,
      };
      const error = validateDraft(draftForValidation, validSubjectIds);
      if (error) return error;

      const { data } = await supabase.from('flashcards').update({
        front: patch.front.trim(),
        back: patch.back.trim(),
        topic_id: patch.topicId ?? null,
      }).eq('id', id).eq('user_id', user.id).select('*').single();

      if (data) {
        setCards(prev =>
          prev.map(c =>
            c.id === id
              ? { ...c, front: patch.front.trim(), back: patch.back.trim(), topicId: patch.topicId }
              : c
          )
        );
      }
      return null;
    },
    [cards, user, validSubjectIds]
  );

  return {
    cards,
    dueCards,
    loading,
    addFlashcard,
    recordResult,
    deleteFlashcard,
    updateFlashcard,
  };
}
