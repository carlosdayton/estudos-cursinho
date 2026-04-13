import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Focus } from 'lucide-react';
import SubjectSelectModal from './SubjectSelectModal';
import { useFocusMode } from '../context/FocusModeContext';
import type { Subject } from '../utils/studyLogic';

interface FocusModeButtonProps {
  subjects: Subject[];
}

export default function FocusModeButton({ subjects }: FocusModeButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { enterFocusMode } = useFocusMode();

  const handleConfirm = (subjectId: string | null) => {
    setModalOpen(false);
    enterFocusMode(subjectId ?? undefined);
  };

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                right: 'calc(100% + 10px)',
                whiteSpace: 'nowrap',
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(129,140,248,0.3)',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'Lexend, sans-serif',
                color: '#818cf8',
                letterSpacing: '0.08em',
                pointerEvents: 'none',
              }}
            >
              Modo Foco
            </motion.span>
          )}
        </AnimatePresence>

        {/* FAB button */}
        <motion.button
          onClick={() => setModalOpen(true)}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          aria-label="Ativar Modo Foco"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            border: '1px solid rgba(129,140,248,0.4)',
            background: 'rgba(129,140,248,0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#818cf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(129,140,248,0.25)',
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(129,140,248,0.25)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(129,140,248,0.5)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(129,140,248,0.15)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(129,140,248,0.25)';
          }}
        >
          <Focus size={20} strokeWidth={2.5} />
        </motion.button>
      </div>

      <SubjectSelectModal
        isOpen={modalOpen}
        subjects={subjects}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
