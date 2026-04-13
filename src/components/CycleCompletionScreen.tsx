import { motion } from 'framer-motion';
import { CheckCircle, RefreshCw, X } from 'lucide-react';

interface CycleCompletionScreenProps {
  cycleName: string;
  totalSubjects: number;
  onRepeat: () => void;
  onExit: () => void;
}

export default function CycleCompletionScreen({
  cycleName,
  totalSubjects,
  onRepeat,
  onExit,
}: CycleCompletionScreenProps) {
  return (
    <motion.div
      key="cycle-completion"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {/* Ícone de conclusão */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: 'rgba(52,211,153,0.15)',
          border: '1px solid rgba(52,211,153,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#34d399',
          boxShadow: '0 0 40px rgba(52,211,153,0.25)',
        }}
      >
        <CheckCircle size={40} strokeWidth={2} />
      </motion.div>

      {/* Texto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            color: '#34d399',
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          Ciclo Concluído
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          {cycleName}
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          {totalSubjects} {totalSubjects === 1 ? 'matéria estudada' : 'matérias estudadas'}
        </p>
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onRepeat}
          aria-label="Repetir ciclo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '14px',
            border: '1px solid rgba(129,140,248,0.3)',
            background: 'rgba(129,140,248,0.12)',
            color: '#818cf8',
            fontSize: '13px',
            fontWeight: 800,
            fontFamily: 'Lexend, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(129,140,248,0.22)';
            e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(129,140,248,0.12)';
            e.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)';
          }}
        >
          <RefreshCw size={15} />
          Repetir Ciclo
        </button>

        <button
          onClick={onExit}
          aria-label="Encerrar modo foco"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '13px',
            fontWeight: 800,
            fontFamily: 'Lexend, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          <X size={15} />
          Encerrar
        </button>
      </div>
    </motion.div>
  );
}
