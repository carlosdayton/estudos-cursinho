import { memo, useState } from 'react';
import type { Subject, Topic } from '../utils/studyLogic';
import { calculateReviewDate, getProgress } from '../utils/studyLogic';
import TopicItem from './TopicItem';
import { Plus, GraduationCap, ChevronDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastContext } from '../context/ToastContext';

interface Props {
  subject: Subject;
  onUpdateSubject: (updated: Subject) => void;
  onDeleteSubject: () => void;
}

function SubjectCard({ subject, onUpdateSubject, onDeleteSubject }: Props) {
  const [newTopicName, setNewTopicName] = useState('');
  const [isExpanded, setIsExpanded] = useState(() => window.innerWidth >= 768);
  const [hoverDelete, setHoverDelete] = useState(false);
  const { showToast } = useToastContext();

  const addTopic = () => {
    if (!newTopicName.trim()) return;
    const newTopic: Topic = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTopicName,
      isStudied: false,
      isExercisesDone: false,
    };
    onUpdateSubject({ ...subject, topics: [...subject.topics, newTopic] });
    setNewTopicName('');
  };

  const updateTopic = (topicId: string, updates: Partial<Topic>) => {
    const updatedTopics = subject.topics.map(t => {
      if (t.id !== topicId) return t;
      const updated = { ...t, ...updates };
      if (updated.isStudied && updated.isExercisesDone && (!t.isStudied || !t.isExercisesDone)) {
        updated.completedAt = new Date().toISOString();
        updated.reviewDate = calculateReviewDate(updated.completedAt);
        showToast('Tópico concluído! Revisão agendada.', 'success');
      }
      return updated;
    });
    onUpdateSubject({ ...subject, topics: updatedTopics });
  };

  const removeTopic = (topicId: string) => {
    onUpdateSubject({ ...subject, topics: subject.topics.filter(t => t.id !== topicId) });
  };

  const progress = getProgress(subject);

  return (
    <motion.div
      layout
      style={{
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${subject.color}33`,
        borderRadius: '28px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `0 20px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px ${subject.color}11`,
      }}
    >
      {/* Color accent top bar */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, transparent, ${subject.color}, transparent)`,
        opacity: 0.8,
      }} />

      {/* Header */}
      <div style={{ padding: 'clamp(1rem, 3vw, 1.75rem) clamp(1rem, 3vw, 1.75rem) clamp(0.75rem, 2vw, 1.25rem)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Icon + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 'clamp(40px, 10vw, 52px)', height: 'clamp(40px, 10vw, 52px)', borderRadius: 'clamp(12px, 3vw, 16px)', flexShrink: 0,
            background: `${subject.color}18`,
            border: `1.5px solid ${subject.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: subject.color,
            boxShadow: `0 0 20px ${subject.color}22`,
          }}>
            <GraduationCap size={22} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: 'clamp(0.95rem, 4vw, 1.25rem)', fontWeight: 900, color: '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {subject.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {subject.topics.length} tópico{subject.topics.length !== 1 ? 's' : ''}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}>·</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: subject.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {progress}% feito
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={onDeleteSubject}
              onMouseEnter={() => setHoverDelete(true)}
              onMouseLeave={() => setHoverDelete(false)}
              aria-label={`Excluir matéria ${subject.name}`}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hoverDelete ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)',
                color: hoverDelete ? '#f87171' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? `Recolher ${subject.name}` : `Expandir ${subject.name}`}
              aria-expanded={isExpanded}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isExpanded ? `${subject.color}22` : 'rgba(255,255,255,0.05)',
                color: isExpanded ? subject.color : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronDown size={18} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'circOut' }}
            style={{
              height: '100%', borderRadius: '99px',
              background: progress === 100
                ? `linear-gradient(90deg, ${subject.color}, #34d399)`
                : subject.color,
              boxShadow: `0 0 12px ${subject.color}88`,
            }}
          />
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* Add topic input */}
            <div style={{ padding: '0 clamp(1rem, 3vw, 1.75rem) clamp(0.75rem, 2vw, 1.25rem)', display: 'flex', gap: '0.75rem' }}>
              <label htmlFor={`new-topic-${subject.id}`} style={{
                position: 'absolute', width: '1px', height: '1px',
                overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
              }}>
                Novo tópico para {subject.name}
              </label>
              <input
                id={`new-topic-${subject.id}`}
                type="text"
                value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addTopic()}
                placeholder="Adicionar tópico..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '0.625rem 1rem',
                  color: '#fff', fontSize: '0.9rem', fontFamily: 'Lexend, sans-serif',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = `${subject.color}66`)}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <button
                onClick={addTopic}
                aria-label={`Adicionar tópico a ${subject.name}`}
                style={{
                  width: '40px', height: '40px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: subject.color, color: '#020617',
                  boxShadow: `0 4px 16px ${subject.color}55`,
                  transition: 'all 0.2s ease',
                }}
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Topics list */}
            <div style={{
              padding: '0 clamp(1rem, 3vw, 1.75rem) clamp(1rem, 3vw, 1.75rem)',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
              maxHeight: '600px', overflowY: 'auto',
            }}>
              {subject.topics.map(topic => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  subjectId={subject.id}
                  onToggleStudied={() => updateTopic(topic.id, { isStudied: !topic.isStudied })}
                  onToggleExercises={() => updateTopic(topic.id, { isExercisesDone: !topic.isExercisesDone })}
                  onRemove={() => removeTopic(topic.id)}
                  onUpdateNotes={notes => updateTopic(topic.id, { notes })}
                />
              ))}

              {subject.topics.length === 0 && (
                <div style={{
                  padding: '2.5rem 1rem', textAlign: 'center',
                  border: `1px dashed ${subject.color}22`,
                  borderRadius: '16px',
                  background: `${subject.color}05`,
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px', margin: '0 auto 0.75rem',
                    background: `${subject.color}15`, border: `1px solid ${subject.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: subject.color,
                  }}>
                    <Plus size={18} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                    Nenhum tópico ainda
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                    Digite acima e pressione Enter para adicionar
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(SubjectCard);
