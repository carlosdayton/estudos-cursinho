import { motion } from 'framer-motion';
import { ListOrdered } from 'lucide-react';

interface CycleProgressBadgeProps {
  currentIndex: number;  // 0-based
  total: number;
  subjectName: string;
  accentColor: string;
}

export default function CycleProgressBadge({
  currentIndex,
  total,
  subjectName,
  accentColor,
}: CycleProgressBadgeProps) {
  const current = currentIndex + 1; // exibir 1-based

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: `${accentColor}18`,
        border: `1px solid ${accentColor}40`,
        borderRadius: '99px',
        padding: '0.35rem 0.9rem',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <ListOrdered size={13} color={accentColor} />
      <span
        style={{
          fontSize: '11px',
          fontWeight: 800,
          fontFamily: 'Lexend, sans-serif',
          letterSpacing: '0.08em',
          color: accentColor,
          whiteSpace: 'nowrap',
        }}
      >
        Matéria {current} de {total}
        {subjectName ? ` — ${subjectName}` : ''}
      </span>
    </motion.div>
  );
}
