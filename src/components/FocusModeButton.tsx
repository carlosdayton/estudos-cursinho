import { useState } from 'react';
import { motion } from 'framer-motion';
import { Focus } from 'lucide-react';
import SubjectSelectModal from './SubjectSelectModal';
import { useFocusMode } from '../context/FocusModeContext';
import type { Subject } from '../utils/studyLogic';

interface FocusModeButtonProps {
  subjects: Subject[];
}

export default function FocusModeButton({ subjects }: FocusModeButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { enterFocusMode } = useFocusMode();

  const handleConfirm = (subjectId: string | null) => {
    setModalOpen(false);
    enterFocusMode(subjectId ?? undefined);
  };

  return (
    <>
      <motion.button
        onClick={() => setModalOpen(true)}
        aria-label="Ativar Modo Foco"
        whileHover={{ scale: 1.06, boxShadow: '0 0 32px rgba(129,140,248,0.6)' }}
        whileTap={{ scale: 0.96 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0 1.5rem',
          height: '48px',
          borderRadius: '14px',
          border: '1px solid rgba(129,140,248,0.35)',
          background: 'rgba(129,140,248,0.12)',
          color: '#818cf8',
          fontSize: '12px',
          fontWeight: 800,
          fontFamily: 'Lexend, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(129,140,248,0.2)',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <Focus size={16} />
        Modo Foco
      </motion.button>

      <SubjectSelectModal
        isOpen={modalOpen}
        subjects={subjects}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
