import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import PomodoroTimer from './PomodoroTimer';
import ParticleBackground from './ParticleBackground';
import type { Subject } from '../utils/studyLogic';

interface FocusModeOverlayProps {
  activeSubject: Subject | null;
  onExit: () => void;
}

export default function FocusModeOverlay({ activeSubject, onExit }: FocusModeOverlayProps) {
  const accentColor = activeSubject?.color ?? '#818cf8';

  // Escape key to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExit]);

  return (
    <motion.div
      key="focus-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-modal="true"
      aria-label="Modo Foco ativo"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2,6,23,0.97)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        overflow: 'hidden',
      }}
    >
      {/* Particle background */}
      <ParticleBackground accentColor={accentColor} />

      {/* Content layer */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          width: '100%',
          maxWidth: '420px',
          padding: '0 1.5rem',
        }}
      >
        {/* Active subject badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}44`,
          borderRadius: '99px',
          padding: '0.5rem 1.25rem',
          boxShadow: `0 0 20px ${accentColor}22`,
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: accentColor, boxShadow: `0 0 8px ${accentColor}`,
          }} />
          <span style={{
            fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.15em', color: accentColor,
            fontFamily: 'Lexend, sans-serif',
          }}>
            {activeSubject ? activeSubject.name : 'Estudo Livre'}
          </span>
          {!activeSubject && <BookOpen size={13} color={accentColor} />}
        </div>

        {/* Pomodoro Timer — reused as-is */}
        <div style={{ width: '100%' }}>
          <PomodoroTimer />
        </div>

        {/* Exit button */}
        <button
          onClick={onExit}
          aria-label="Sair do Modo Foco"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.75rem', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
            fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
            cursor: 'pointer', transition: 'all 0.2s',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          <X size={15} />
          Sair do Modo Foco
        </button>

        {/* Keyboard hint */}
        <p style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.2)',
          fontFamily: 'Lexend, sans-serif', letterSpacing: '0.05em',
          margin: 0,
        }}>
          Pressione <kbd style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px', padding: '1px 6px',
            fontSize: '10px', fontFamily: 'monospace',
          }}>Esc</kbd> para sair
        </p>
      </motion.div>

      {/* sr-only live region for timer state */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute', width: '1px', height: '1px',
          overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
        }}
      >
        Modo Foco ativo{activeSubject ? ` — estudando ${activeSubject.name}` : ''}
      </div>
    </motion.div>
  );
}
