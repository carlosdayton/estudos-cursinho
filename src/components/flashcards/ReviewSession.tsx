import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Clock } from 'lucide-react';
import type { Flashcard, ReviewResult } from '../../utils/flashcardLogic';
import type { Subject } from '../../utils/studyLogic';
import FlashcardFlip from './FlashcardFlip';

interface ReviewSessionProps {
  cards: Flashcard[];
  subjects: Subject[];
  onResult: (id: string, result: ReviewResult) => void;
  onFinish: () => void;
}

function formatNextReview(nextReviewAt: string): string {
  const diff = new Date(nextReviewAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'agora';
  if (days === 1) return 'amanhã';
  return `em ${days} dias`;
}

export default function ReviewSession({
  cards,
  subjects,
  onResult,
  onFinish,
}: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<ReviewResult[]>([]);
  const [finished, setFinished] = useState(false);

  // Estado vazio
  if (cards.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'rgba(129,140,248,0.1)',
            border: '1px solid rgba(129,140,248,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#818cf8',
          }}
        >
          <Clock size={28} />
        </div>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
            Nenhum card pendente
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Todos os seus flashcards estão em dia. Continue criando novos cards!
          </p>
        </div>
        <button
          onClick={onFinish}
          style={{
            padding: '0.65rem 1.5rem', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '13px', fontWeight: 700,
            fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  // Tela de conclusão
  if (finished) {
    const correct = sessionResults.filter(r => r === 'correct').length;
    const total = sessionResults.length;
    const pct = Math.round((correct / total) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '72px', height: '72px', borderRadius: '22px',
            background: 'linear-gradient(135deg, #818cf8, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 40px rgba(129,140,248,0.4)',
          }}
        >
          <Trophy size={32} />
        </div>
        <div>
          <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
            Sessão concluída!
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {correct} de {total} acertos ({pct}%)
          </p>
        </div>
        {/* Mini barra de progresso */}
        <div style={{ width: '100%', maxWidth: '280px', height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'circOut' }}
            style={{
              height: '100%',
              background: pct >= 70 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#f87171',
              borderRadius: '99px',
            }}
          />
        </div>
        <button
          onClick={onFinish}
          style={{
            padding: '0.75rem 2rem', borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #818cf8, #a855f7)',
            color: '#fff',
            fontSize: '14px', fontWeight: 800,
            fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(129,140,248,0.35)',
          }}
        >
          Voltar aos Flashcards
        </button>
      </motion.div>
    );
  }

  const currentCard = cards[currentIndex];
  const subject = subjects.find(s => s.id === currentCard.subjectId);
  const subjectColor = subject?.color ?? '#818cf8';
  const progress = currentIndex + 1;
  const total = cards.length;

  function handleResult(result: ReviewResult) {
    onResult(currentCard.id, result);
    setSessionResults(prev => [...prev, result]);
    setIsFlipped(false);

    if (currentIndex + 1 >= total) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Progresso */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {progress} / {total}
        </span>
        <div style={{ flex: 1, margin: '0 1rem', height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(progress / total) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: subjectColor, borderRadius: '99px', boxShadow: `0 0 8px ${subjectColor}88` }}
          />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: subjectColor }}>
          {subject?.name ?? ''}
        </span>
      </div>

      {/* Card com flip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <FlashcardFlip
            front={currentCard.front}
            back={currentCard.back}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(f => !f)}
            subjectColor={subjectColor}
          />
        </motion.div>
      </AnimatePresence>

      {/* Próxima revisão info */}
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0 }}>
        Próxima revisão atual: {formatNextReview(currentCard.nextReviewAt)}
      </p>

      {/* Botões de resultado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <button
          onClick={() => handleResult('incorrect')}
          style={{
            padding: '0.85rem 1rem', borderRadius: '14px',
            border: '1px solid rgba(248,113,113,0.3)',
            background: 'rgba(248,113,113,0.08)',
            color: '#f87171',
            fontSize: '14px', fontWeight: 800,
            fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.08)'; }}
        >
          <XCircle size={18} />
          Errei
        </button>
        <button
          onClick={() => handleResult('correct')}
          style={{
            padding: '0.85rem 1rem', borderRadius: '14px',
            border: '1px solid rgba(74,222,128,0.3)',
            background: 'rgba(74,222,128,0.08)',
            color: '#4ade80',
            fontSize: '14px', fontWeight: 800,
            fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,222,128,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,222,128,0.08)'; }}
        >
          <CheckCircle2 size={18} />
          Acertei
        </button>
      </div>
    </div>
  );
}
