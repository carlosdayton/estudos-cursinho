import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface FlashcardFlipProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  subjectColor: string;
}

export default function FlashcardFlip({
  front,
  back,
  isFlipped,
  onFlip,
  subjectColor,
}: FlashcardFlipProps) {
  return (
    <div
      onClick={onFlip}
      role="button"
      aria-label={isFlipped ? 'Ver frente do card' : 'Virar card para ver resposta'}
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onFlip()}
      style={{
        perspective: '1200px',
        cursor: 'pointer',
        width: '100%',
        minHeight: '220px',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '220px',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Frente */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: 'rgba(30,41,59,0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${subjectColor}55`,
            borderRadius: '20px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: `0 0 30px ${subjectColor}22, 0 20px 40px rgba(0,0,0,0.4)`,
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: subjectColor,
              opacity: 0.7,
            }}
          >
            Pergunta
          </span>
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {front}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '0.5rem',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <RotateCcw size={12} />
            Clique para revelar
          </div>
        </div>

        {/* Verso */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${subjectColor}18, rgba(30,41,59,0.7))`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${subjectColor}88`,
            borderRadius: '20px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: `0 0 40px ${subjectColor}33, 0 20px 40px rgba(0,0,0,0.4)`,
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: subjectColor,
            }}
          >
            Resposta
          </span>
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontWeight: 600,
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {back}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
