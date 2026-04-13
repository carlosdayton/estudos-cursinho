import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Focus, X, BookOpen } from 'lucide-react';
import type { Subject } from '../utils/studyLogic';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SubjectSelectModalProps {
  isOpen: boolean;
  subjects: Subject[];
  onConfirm: (subjectId: string | null) => void;
  onCancel: () => void;
}

export default function SubjectSelectModal({
  isOpen,
  subjects,
  onConfirm,
  onCancel,
}: SubjectSelectModalProps) {
  const [lastSubjectId] = useLocalStorage<string | null>('focus-mode-last-subject', null);
  const [selected, setSelected] = useState<string | null>(null);

  // Pre-select last used subject when modal opens
  useEffect(() => {
    if (isOpen) {
      const validLast = subjects.find((s) => s.id === lastSubjectId);
      setSelected(validLast ? lastSubjectId : null);
    }
  }, [isOpen, lastSubjectId, subjects]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="subject-select-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2,6,23,0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <motion.div
            key="subject-select-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Selecionar matéria para o Modo Foco"
            style={{
              background: 'rgba(15,23,42,0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(129,140,248,0.25)',
              borderRadius: '28px',
              padding: '2rem',
              width: '100%',
              maxWidth: '440px',
              maxHeight: '80vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'relative',
            }}
          >
            {/* Shimmer top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)',
              borderRadius: '28px 28px 0 0',
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8',
                }}>
                  <Focus size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Modo Foco
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    O que você vai estudar?
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                aria-label="Fechar modal"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Free option */}
              <SubjectOption
                id={null}
                name="Livre"
                subtitle="Sem matéria específica"
                color="#64748b"
                isSelected={selected === null}
                onSelect={() => setSelected(null)}
                icon={<BookOpen size={16} />}
              />

              {subjects.map((subject) => (
                <SubjectOption
                  key={subject.id}
                  id={subject.id}
                  name={subject.name}
                  color={subject.color}
                  isSelected={selected === subject.id}
                  onSelect={() => setSelected(subject.id)}
                />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                  fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => onConfirm(selected)}
                style={{
                  flex: 2, padding: '0.75rem', borderRadius: '14px', border: 'none',
                  background: '#818cf8', color: '#020617',
                  fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer', boxShadow: '0 4px 20px rgba(129,140,248,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                <Focus size={15} />
                Entrar no Modo Foco
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── SubjectOption ─────────────────────────────────────────────────────────────

interface SubjectOptionProps {
  id: string | null;
  name: string;
  subtitle?: string;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
}

function SubjectOption({ name, subtitle, color, isSelected, onSelect, icon }: SubjectOptionProps) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={isSelected}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem', borderRadius: '14px', border: 'none',
        background: isSelected ? `${color}18` : 'rgba(255,255,255,0.03)',
        outline: isSelected ? `1.5px solid ${color}55` : '1.5px solid rgba(255,255,255,0.06)',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.15s ease',
        boxShadow: isSelected ? `0 0 16px ${color}22` : 'none',
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
        background: `${color}22`, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color,
      }}>
        {icon ?? <span style={{ fontSize: '14px', fontWeight: 900 }}>{name.charAt(0)}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
          {name}
        </p>
        {subtitle && (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {isSelected && (
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: color, boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }} />
      )}
    </button>
  );
}
