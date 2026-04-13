import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useFocusMode } from '../context/FocusModeContext';
import { useStudyCycles } from '../hooks/useStudyCycles';
import { useActiveCycle } from '../hooks/useActiveCycle';
import ParticleBackground from './ParticleBackground';
import CycleProgressBadge from './CycleProgressBadge';
import CycleCompletionScreen from './CycleCompletionScreen';
import type { Subject } from '../utils/studyLogic';

interface FocusModeOverlayProps {
  activeSubject: Subject | null;
  onExit: () => void;
}

export default function FocusModeOverlay({ activeSubject, onExit }: FocusModeOverlayProps) {
  const { cycleProgress, clearCycle, startCycle, activeCycleId, advanceCycle, subjectJustChanged } = useFocusMode();
  const { getCycleById } = useStudyCycles();
  const { activeCycleState } = useActiveCycle();
  // Para o indicador de Pomodoros por matéria
  const activeCycle = activeCycleId ? getCycleById(activeCycleId) : undefined;
  const pomodorosNeeded = activeCycle ? Math.max(1, activeCycle.pomodorosPerSubject ?? 1) : 1;
  const pomodorosDone = activeCycleState?.pomodorosInCurrentSubject ?? 0;

  const accentColor = activeSubject?.color ?? '#818cf8';
  const accentGlow = `${accentColor}55`;

  const isCompleted = cycleProgress?.isCompleted ?? false;

  const {
    isActive, mode, formattedTime, progress,
    start, pause, reset, switchMode,
  } = usePomodoroTimer({
    onFocusSessionComplete: (cycleProgress && !isCompleted) ? advanceCycle : undefined,
  });

  const toggleTimer = () => (isActive ? pause() : start());
  const isWork = mode === 'work';
  const modeAccent = isWork ? accentColor : '#34d399';
  const modeGlow = isWork ? accentGlow : 'rgba(52,211,153,0.35)';

  // Escape to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExit]);

  const handleRepeatCycle = () => {
    if (!activeCycleId) return;
    const cycle = getCycleById(activeCycleId);
    if (cycle) startCycle(cycle);
  };

  const handleExitCycle = () => {
    clearCycle();
  };

  return (
    <motion.div
      key="focus-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Modo Foco ativo"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2,6,23,0.98)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        overflow: 'hidden',
      }}
    >
      <ParticleBackground accentColor={accentColor} />

      {/* Flash de troca de matéria */}
      <AnimatePresence>
        {subjectJustChanged && (
          <motion.div
            key="subject-change-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: `radial-gradient(ellipse at center, ${accentColor}18 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
        }}
      >
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <CycleCompletionScreen
              key="completion"
              cycleName={cycleProgress?.cycleName ?? ''}
              totalSubjects={cycleProgress?.total ?? 0}
              onRepeat={handleRepeatCycle}
              onExit={handleExitCycle}
            />
          ) : (
            <motion.div
              key="timer-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}
            >
              {/* Cycle progress badge */}
              {cycleProgress ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <CycleProgressBadge
                    currentIndex={cycleProgress.currentIndex}
                    total={cycleProgress.total}
                    subjectName={activeSubject?.name ?? ''}
                    accentColor={accentColor}
                  />
                  {/* Pomodoro dots — só mostra se há mais de 1 Pomodoro por matéria */}
                  {pomodorosNeeded > 1 && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {Array.from({ length: pomodorosNeeded }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: i < pomodorosDone ? '10px' : '8px',
                            height: i < pomodorosDone ? '10px' : '8px',
                            borderRadius: '50%',
                            background: i < pomodorosDone ? accentColor : 'rgba(255,255,255,0.15)',
                            boxShadow: i < pomodorosDone ? `0 0 8px ${accentColor}` : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                      <span style={{
                        fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                        fontFamily: 'Lexend, sans-serif', marginLeft: '4px',
                      }}>
                        {pomodorosDone}/{pomodorosNeeded} pomodoros
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Subject name pill (modo foco livre) */
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}33`,
                  borderRadius: '99px',
                  padding: '0.4rem 1.1rem',
                }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: accentColor, boxShadow: `0 0 8px ${accentColor}`,
                  }} />
                  <span style={{
                    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.2em', color: accentColor,
                    fontFamily: 'Lexend, sans-serif',
                  }}>
                    {activeSubject ? activeSubject.name : 'Estudo Livre'}
                  </span>
                </div>
              )}

              {/* Big timer ring */}
              <div style={{ position: 'relative', width: '260px', height: '260px' }}>
                <svg width="260" height="260" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="130" cy="130" r="118" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle
                    cx="130" cy="130" r="118" fill="none"
                    stroke={modeAccent} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 118}`}
                    strokeDashoffset={`${2 * Math.PI * 118 * (1 - progress / 100)}`}
                    style={{
                      transition: 'stroke-dashoffset 1s linear',
                      filter: `drop-shadow(0 0 12px ${modeGlow})`,
                    }}
                  />
                </svg>

                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                  <motion.span
                    key={formattedTime}
                    initial={{ scale: 0.95, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      fontSize: 'clamp(3rem, 8vw, 4.5rem)',
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '-0.04em',
                      fontVariantNumeric: 'tabular-nums',
                      textShadow: `0 0 40px ${modeGlow}`,
                      lineHeight: 1,
                    }}
                  >
                    {formattedTime}
                  </motion.span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700,
                    color: modeAccent, textTransform: 'uppercase', letterSpacing: '0.2em',
                  }}>
                    {isWork ? 'Foco' : 'Pausa'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => switchMode(isWork ? 'break' : 'work')}
                  aria-label={isWork ? 'Mudar para pausa' : 'Mudar para foco'}
                  style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {isWork ? <Coffee size={18} /> : <Focus size={18} />}
                </button>

                <button
                  onClick={toggleTimer}
                  aria-label={isActive ? 'Pausar timer' : 'Iniciar timer'}
                  style={{
                    width: '68px', height: '68px', borderRadius: '22px', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? `${modeAccent}22` : '#fff',
                    color: isActive ? modeAccent : '#020617',
                    boxShadow: isActive
                      ? `0 0 28px ${modeGlow}`
                      : '0 8px 32px rgba(255,255,255,0.25)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isActive
                    ? <Pause size={26} fill="currentColor" />
                    : <Play size={26} fill="currentColor" />}
                </button>

                <button
                  onClick={reset}
                  aria-label="Reiniciar timer"
                  style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {/* Exit hint */}
              <button
                onClick={onExit}
                aria-label="Sair do Modo Foco"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '11px', color: 'rgba(255,255,255,0.2)',
                  fontFamily: 'Lexend, sans-serif', letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'color 0.2s',
                  padding: '4px 8px',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
              >
                Pressione{' '}
                <kbd style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '4px', padding: '1px 6px',
                  fontSize: '10px', fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.4)',
                }}>Esc</kbd>
                {' '}para sair
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* sr-only live region */}
      <div aria-live="polite" aria-atomic="true" style={{
        position: 'absolute', width: '1px', height: '1px',
        overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
      }}>
        Modo Foco ativo{activeSubject ? ` — estudando ${activeSubject.name}` : ''}
        {cycleProgress ? ` — Matéria ${cycleProgress.currentIndex + 1} de ${cycleProgress.total}` : ''}
      </div>
    </motion.div>
  );
}
