import { memo, useState } from 'react';
import { CheckCircle2, Timer, X, NotebookPen, BookOpen, Dumbbell } from 'lucide-react';
import type { Topic } from '../utils/studyLogic';
import { isReviewDue } from '../utils/studyLogic';
import { motion } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';

interface Props {
  topic: Topic;
  subjectId: string;
  onToggleStudied: () => void;
  onToggleExercises: () => void;
  onRemove: () => void;
  onUpdateNotes: (notes: string) => void;
}

function TopicItem({ topic, subjectId, onToggleStudied, onToggleExercises, onRemove, onUpdateNotes }: Props) {
  const { navigateTo } = useNavigation();
  const reviewDue = isReviewDue(topic.reviewDate);
  const completed = topic.isStudied && topic.isExercisesDone;
  const partial = topic.isStudied || topic.isExercisesDone;

  const progressWidth = completed ? '100%' : partial ? '50%' : '0%';
  const progressColor = completed ? '#34d399' : '#818cf8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: completed
          ? 'rgba(52,211,153,0.06)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${completed ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      {/* Main content */}
      <div style={{ padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>

        {/* Top row: name + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          {/* Name + review badge */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.95rem', fontWeight: 700,
              color: completed ? 'rgba(255,255,255,0.45)' : '#fff',
              textDecoration: completed ? 'line-through' : 'none',
              textDecorationColor: 'rgba(255,255,255,0.3)',
              lineHeight: 1.3, wordBreak: 'break-word',
              transition: 'color 0.3s',
              margin: 0,
            }}>
              {topic.name}
            </p>
            {topic.reviewDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                <Timer size={10} color={reviewDue ? '#fbbf24' : 'rgba(255,255,255,0.25)'} />
                <span style={{
                  fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: reviewDue ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                }}>
                  {reviewDue ? 'Revisão pendente' : `Revisão: ${new Date(topic.reviewDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                </span>
              </div>
            )}
          </div>

          {/* Notes + Remove */}
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={() => navigateTo('anotacoes', { title: topic.name, subjectId })}
              aria-label={`Criar anotação para ${topic.name}`}
              title="Anotar na aba Anotações"
              style={{
                width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(167,139,250,0.12)',
                color: '#a78bfa',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(167,139,250,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(167,139,250,0.12)'; }}
            >
              <NotebookPen size={13} />
            </button>
            <button
              onClick={onRemove}
              aria-label={`Remover tópico ${topic.name}`}
              style={{
                width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', color: 'rgba(255,255,255,0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)'; }}
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Bottom row: toggle buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onToggleStudied}
            aria-pressed={topic.isStudied}
            aria-label={topic.isStudied ? `Desmarcar teoria de ${topic.name}` : `Marcar teoria de ${topic.name} como completa`}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
              background: topic.isStudied ? 'rgba(129,140,248,0.18)' : 'rgba(255,255,255,0.04)',
              color: topic.isStudied ? '#818cf8' : 'rgba(255,255,255,0.35)',
              fontSize: '10px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              border: `1px solid ${topic.isStudied ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.2s ease',
            }}
          >
            {topic.isStudied ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <BookOpen size={12} strokeWidth={2} />}
            Teoria
          </button>

          <button
            onClick={onToggleExercises}
            aria-pressed={topic.isExercisesDone}
            aria-label={topic.isExercisesDone ? `Desmarcar prática de ${topic.name}` : `Marcar prática de ${topic.name} como feita`}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
              background: topic.isExercisesDone ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
              color: topic.isExercisesDone ? '#34d399' : 'rgba(255,255,255,0.35)',
              fontSize: '10px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              border: `1px solid ${topic.isExercisesDone ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.2s ease',
            }}
          >
            {topic.isExercisesDone ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <Dumbbell size={12} strokeWidth={2} />}
            Prática
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          animate={{ width: progressWidth }}
          transition={{ duration: 0.6, ease: 'circOut' }}
          style={{ height: '100%', background: progressColor, boxShadow: `0 0 8px ${progressColor}88` }}
        />
      </div>
    </motion.div>
  );
}

export default memo(TopicItem);
