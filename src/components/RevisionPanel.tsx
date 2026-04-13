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
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card p-6 flex items-center justify-between border-amber-500/20 hover:bg-amber-500/5 transition-all group"
        aria-expanded={isOpen}
        aria-label="Painel de revisões"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Timer size={24} className="animate-pulse" />
          </div>
          <div className="text-left">
            <h4 className="text-lg font-black text-white uppercase tracking-wider">Revisões</h4>
            <p className="text-sm text-white font-bold uppercase tracking-widest">
              {reviewsDue.length > 0 && (
                <span className="text-amber-400">
                  {reviewsDue.length} vencida{reviewsDue.length !== 1 ? 's' : ''}
                </span>
              )}
              {reviewsDue.length > 0 && upcomingReviews.length > 0 && (
                <span className="text-white/40 mx-1">·</span>
              )}
              {upcomingReviews.length > 0 && (
                <span className="text-indigo-400">
                  {upcomingReviews.length} próxima{upcomingReviews.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 space-y-6"
          >
            {/* Revisões vencidas */}
            {reviewsDue.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-3 px-1">
                  Vencidas
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewsDue.map(item => (
                    <div
                      key={item.topicId}
                      className="glass-card p-5 flex items-center justify-between border-amber-500/10 bg-amber-500/[0.03]"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1 mr-3">
                        <span
                          className="text-[10px] font-black uppercase tracking-[0.2em] truncate"
                          style={{ color: item.subjectColor }}
                        >
                          {item.subjectName}
                        </span>
                        <h5 className="text-base font-black text-white tracking-tight truncate">{item.topicName}</h5>
                        <div className="flex items-center gap-1 text-amber-400/80">
                          <AlertCircle size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {item.daysOverdue === 0
                              ? 'Vence hoje'
                              : `${item.daysOverdue} dia${item.daysOverdue !== 1 ? 's' : ''} atrasado`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => markReviewed(item.topicId, item.subjectId)}
                        className="flex-shrink-0 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-all"
                        aria-label={`Marcar ${item.topicName} como revisado`}
                        title="Marcar como revisado"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revisões futuras — próximos 7 dias */}
            {upcomingReviews.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3 px-1">
                  Próximos 7 dias
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingReviews.map(item => {
                    const reviewDate = new Date(item.reviewDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const daysUntil = Math.ceil(
                      (reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div
                        key={item.topicId}
                        className="glass-card p-5 flex items-center justify-between border-indigo-500/10 bg-indigo-500/[0.03]"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span
                            className="text-[10px] font-black uppercase tracking-[0.2em] truncate"
                            style={{ color: item.subjectColor }}
                          >
                            {item.subjectName}
                          </span>
                          <h5 className="text-base font-black text-white tracking-tight truncate">{item.topicName}</h5>
                          <div className="flex items-center gap-1 text-indigo-400/80">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              em {daysUntil} dia{daysUntil !== 1 ? 's' : ''}
                            </span>
                          </div>
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
