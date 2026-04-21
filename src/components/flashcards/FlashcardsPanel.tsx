import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Pencil, Trash2, BookOpen, ChevronRight } from 'lucide-react';
import type { Subject } from '../../utils/studyLogic';
import type { Flashcard, FlashcardDraft } from '../../utils/flashcardLogic';
import { useFlashcards } from '../../hooks/useFlashcards';
import PendingBadge from './PendingBadge';
import FlashcardEditor from './FlashcardEditor';
import ReviewSession from './ReviewSession';

interface FlashcardsPanelProps {
  subjects: Subject[];
}

type View = 'list' | 'editor' | 'review';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Pendente';
  if (days === 1) return 'Amanhã';
  return `Em ${days} dias`;
}

export default function FlashcardsPanel({ subjects }: FlashcardsPanelProps) {
  const subjectIds = subjects.map(s => s.id);
  const { cards, dueCards, addFlashcard, recordResult, deleteFlashcard, updateFlashcard } =
    useFlashcards(subjectIds);

  const [view, setView] = useState<View>('list');
  const [editingCard, setEditingCard] = useState<Flashcard | undefined>(undefined);

  async function handleSave(draft: FlashcardDraft): Promise<string | null> {
    if (editingCard) {
      const err = await updateFlashcard(editingCard.id, {
        front: draft.front,
        back: draft.back,
        topicId: draft.topicId,
      });
      if (err) return err;
    } else {
      const err = await addFlashcard(draft);
      if (err) return err;
    }
    setEditingCard(undefined);
    setView('list');
    return null;
  }

  function handleEdit(card: Flashcard) {
    setEditingCard(card);
    setView('editor');
  }

  function handleNewCard() {
    setEditingCard(undefined);
    setView('editor');
  }

  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '28px',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top shimmer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.4), transparent)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #818cf8, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 0 20px rgba(129,140,248,0.4)',
          }}>
            <BookOpen size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                Flashcards
              </h2>
              <PendingBadge count={dueCards.length} />
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {cards.length} {cards.length === 1 ? 'card' : 'cards'} · {dueCards.length} pendente{dueCards.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {view === 'list' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {dueCards.length > 0 && (
              <button
                onClick={() => setView('review')}
                style={{
                  padding: '0.6rem 1.1rem', borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
                  color: '#020617',
                  fontSize: '12px', fontWeight: 800,
                  fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 16px rgba(74,222,128,0.3)',
                }}
              >
                <Play size={13} />
                Revisar ({dueCards.length})
              </button>
            )}
            <button
              onClick={handleNewCard}
              style={{
                padding: '0.6rem 1.1rem', borderRadius: '10px',
                border: '1px solid rgba(129,140,248,0.3)',
                background: 'rgba(129,140,248,0.1)',
                color: '#818cf8',
                fontSize: '12px', fontWeight: 800,
                fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Plus size={14} />
              Novo Card
            </button>
          </div>
        )}

        {view !== 'list' && (
          <button
            onClick={() => { setView('list'); setEditingCard(undefined); }}
            style={{
              padding: '0.6rem 1rem', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '12px', fontWeight: 700,
              fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
            }}
          >
            ← Voltar
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {cards.length === 0 ? (
              <div style={{
                padding: '3rem 2rem', textAlign: 'center',
                border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: '16px',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 1rem',
                  background: 'rgba(129,140,248,0.08)',
                  border: '1px solid rgba(129,140,248,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(129,140,248,0.5)',
                }}>
                  <BookOpen size={20} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', margin: '0 0 6px' }}>
                  Nenhum flashcard ainda
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', margin: '0 0 1.25rem' }}>
                  Crie seu primeiro card para começar a estudar com repetição espaçada.
                </p>
                <button
                  onClick={handleNewCard}
                  style={{
                    padding: '0.65rem 1.5rem', borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                    color: '#fff',
                    fontSize: '13px', fontWeight: 800,
                    fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Plus size={14} />
                  Criar primeiro card
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cards.map(card => {
                  const subject = subjects.find(s => s.id === card.subjectId);
                  const isDue = new Date(card.nextReviewAt) <= new Date();
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isDue ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '12px',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      {/* Color dot */}
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                        background: subject?.color ?? '#818cf8',
                        boxShadow: `0 0 6px ${subject?.color ?? '#818cf8'}88`,
                      }} />

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '13px', fontWeight: 600, color: '#fff',
                          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {card.front}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                            {subject?.name ?? 'Matéria removida'}
                          </span>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>·</span>
                          <span style={{
                            fontSize: '10px', fontWeight: 700,
                            color: isDue ? '#f87171' : 'rgba(255,255,255,0.3)',
                          }}>
                            {formatDate(card.nextReviewAt)}
                          </span>
                          {card.repetitions > 0 && (
                            <>
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>·</span>
                              <span style={{ fontSize: '10px', color: 'rgba(129,140,248,0.6)' }}>
                                {card.repetitions}× revisado
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleEdit(card)}
                          aria-label="Editar flashcard"
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#818cf8'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129,140,248,0.3)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteFlashcard(card.id)}
                          aria-label="Excluir flashcard"
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.3)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        >
                          <Trash2 size={12} />
                        </button>
                        {isDue && (
                          <button
                            onClick={() => setView('review')}
                            aria-label="Revisar agora"
                            style={{
                              width: '30px', height: '30px', borderRadius: '8px',
                              border: '1px solid rgba(74,222,128,0.3)',
                              background: 'rgba(74,222,128,0.08)',
                              color: '#4ade80',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {view === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <FlashcardEditor
              subjects={subjects}
              initialCard={editingCard}
              onSave={handleSave}
              onCancel={() => { setView('list'); setEditingCard(undefined); }}
            />
          </motion.div>
        )}

        {view === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <ReviewSession
              cards={dueCards}
              subjects={subjects}
              onResult={recordResult}
              onFinish={() => setView('list')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
