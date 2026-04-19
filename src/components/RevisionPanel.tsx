import { useState } from 'react';
import type { Subject, Topic } from '../utils/studyLogic';
import { useRevisions } from '../hooks/useRevisions';
import { Timer, ChevronDown, ChevronUp, AlertCircle, Calendar, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  subjects: Subject[];
  updateTopic: (subjectId: string, topicId: string, patch: Partial<Topic>) => void;
}

export default function RevisionPanel({ subjects, updateTopic }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { reviewsDue, upcomingReviews, markReviewed } = useRevisions(subjects, updateTopic);

  const totalCount = reviewsDue.length + upcomingReviews.length;

  // Estado vazio — sem revisões pendentes
  if (totalCount === 0) {
    return (
      <div style={{
        background: 'rgba(30,41,59,0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)' }} />
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#34d399',
        }}>
          <BookOpen size={22} />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            Em dia com as revisões!
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Conclua tópicos para agendar revisões automáticas com repetição espaçada.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(52,211,153,0.08)',
          border: '1px solid rgba(52,211,153,0.15)',
          borderRadius: '10px',
          padding: '6px 12px',
        }}>
          <CheckCircle2 size={13} color="#34d399" />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Nenhuma revisão pendente
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Painel de revisões"
        style={{
          width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
          background: 'rgba(30,41,59,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          outline: '1px solid rgba(245,158,11,0.2)',
          transition: 'background 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
            background: '#f59e0b', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(245,158,11,0.4)',
          }}>
            <Timer size={22} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revisões</h4>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {reviewsDue.length > 0 && (
                <span style={{ color: '#fbbf24' }}>{reviewsDue.length} vencida{reviewsDue.length !== 1 ? 's' : ''}</span>
              )}
              {reviewsDue.length > 0 && upcomingReviews.length > 0 && (
                <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 4px' }}>·</span>
              )}
              {upcomingReviews.length > 0 && (
                <span style={{ color: '#818cf8' }}>{upcomingReviews.length} próxima{upcomingReviews.length !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Revisões vencidas */}
            {reviewsDue.length > 0 && (
              <div>
                <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fbbf24', marginBottom: '0.75rem', paddingLeft: '4px' }}>
                  Vencidas
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {reviewsDue.map(item => (
                    <div
                      key={item.topicId}
                      style={{
                        background: 'rgba(245,158,11,0.05)',
                        border: '1px solid rgba(245,158,11,0.15)',
                        borderRadius: '16px', padding: '1rem 1.25rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: item.subjectColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.subjectName}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.topicName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={11} color="rgba(251,191,36,0.8)" />
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(251,191,36,0.8)' }}>
                            {item.daysOverdue === 0 ? 'Vence hoje' : `${item.daysOverdue} dia${item.daysOverdue !== 1 ? 's' : ''} atrasado`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => markReviewed(item.topicId, item.subjectId)}
                        aria-label={`Marcar ${item.topicName} como revisado`}
                        style={{
                          width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,191,36,0.25)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,191,36,0.12)'; }}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revisões futuras */}
            {upcomingReviews.length > 0 && (
              <div>
                <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#818cf8', marginBottom: '0.75rem', paddingLeft: '4px' }}>
                  Próximos 7 dias
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {upcomingReviews.map(item => {
                    const reviewDate = new Date(item.reviewDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const daysUntil = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div
                        key={item.topicId}
                        style={{
                          background: 'rgba(129,140,248,0.05)',
                          border: '1px solid rgba(129,140,248,0.15)',
                          borderRadius: '16px', padding: '1rem 1.25rem',
                          display: 'flex', flexDirection: 'column', gap: '3px',
                        }}
                      >
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: item.subjectColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.subjectName}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.topicName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} color="rgba(129,140,248,0.8)" />
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(129,140,248,0.8)' }}>
                            em {daysUntil} dia{daysUntil !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
