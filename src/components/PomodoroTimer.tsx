import { useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Focus, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoroTimer, WORK_DURATION_OPTIONS, BREAK_DURATION_OPTIONS } from '../hooks/usePomodoroTimer';

export default function PomodoroTimer() {
  const {
    isActive, mode, sessionsCompleted, formattedTime, progress,
    start, pause, reset, switchMode,
    workMinutes, breakMinutes, setWorkMinutes, setBreakMinutes,
  } = usePomodoroTimer();
  const [showSettings, setShowSettings] = useState(false);
  const toggleTimer = () => (isActive ? pause() : start());
  const modeLabel = mode === 'work' ? 'Foco' : 'Pausa';
  const statusLabel = isActive ? `${modeLabel} em andamento — ${formattedTime}` : `${modeLabel} pausado — ${formattedTime}`;
  const isWork = mode === 'work';
  const accentColor = isWork ? '#818cf8' : '#34d399';
  const accentGlow = isWork ? 'rgba(129,140,248,0.35)' : 'rgba(52,211,153,0.35)';

  return (
    <div style={{
      background: 'rgba(30,41,59,0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '28px',
      padding: '2.5rem 2rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* shimmer top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${accentColor}66, transparent)` }} />

      {/* sr-only */}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        {statusLabel}
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px' }}>
        {(['work', 'break'] as const).map((m) => {
          const active = mode === m;
          const color = m === 'work' ? '#818cf8' : '#34d399';
          return (
            <button
              key={m}
              onClick={() => mode !== m && switchMode(m)}
              aria-pressed={active}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontFamily: 'Lexend, sans-serif', fontSize: '11px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                background: active ? color : 'transparent',
                color: active ? '#020617' : 'rgba(255,255,255,0.5)',
                boxShadow: active ? `0 0 16px ${color}66` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {m === 'work' ? <Focus size={13} /> : <Coffee size={13} />}
              {m === 'work' ? `Foco ${workMinutes}m` : `Pausa ${breakMinutes}m`}
            </button>
          );
        })}
      </div>

      {/* Progress ring + time */}
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg width="200" height="200" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle
            cx="100" cy="100" r="88" fill="none"
            stroke={accentColor} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 10px ${accentGlow})` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <motion.span
            key={formattedTime}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            aria-hidden="true"
            style={{ fontSize: '2.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', textShadow: `0 0 24px ${accentGlow}` }}
          >
            {formattedTime}
          </motion.span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {modeLabel}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={toggleTimer}
          aria-label={isActive ? 'Pausar timer' : 'Iniciar timer'}
          style={{
            width: '64px', height: '64px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? 'rgba(251,191,36,0.15)' : '#fff',
            color: isActive ? '#fbbf24' : '#020617',
            boxShadow: isActive ? '0 0 24px rgba(251,191,36,0.3)' : '0 8px 28px rgba(255,255,255,0.25)',
            transition: 'all 0.2s ease',
          }}
        >
          {isActive ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
        </button>
        <button
          onClick={reset}
          aria-label="Reiniciar timer"
          style={{
            width: '64px', height: '64px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw size={22} />
        </button>
        <button
          onClick={() => setShowSettings(s => !s)}
          aria-label="Configurar duração"
          aria-expanded={showSettings}
          style={{
            width: '64px', height: '64px', borderRadius: '20px',
            border: `1px solid ${showSettings ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.1)'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: showSettings ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.05)',
            color: showSettings ? '#818cf8' : 'rgba(255,255,255,0.6)',
            transition: 'all 0.2s ease',
          }}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Duration settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '1rem',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#818cf8', fontFamily: 'Lexend, sans-serif', margin: '0 0 0.4rem' }}>
                  Foco (min)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {WORK_DURATION_OPTIONS.map(n => (
                    <button key={n} onClick={() => setWorkMinutes(n)} style={{
                      padding: '4px 10px', borderRadius: '8px',
                      border: `1px solid ${workMinutes === n ? 'rgba(129,140,248,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      background: workMinutes === n ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.04)',
                      color: workMinutes === n ? '#818cf8' : 'rgba(255,255,255,0.4)',
                      fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#34d399', fontFamily: 'Lexend, sans-serif', margin: '0 0 0.4rem' }}>
                  Pausa (min)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {BREAK_DURATION_OPTIONS.map(n => (
                    <button key={n} onClick={() => setBreakMinutes(n)} style={{
                      padding: '4px 10px', borderRadius: '8px',
                      border: `1px solid ${breakMinutes === n ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      background: breakMinutes === n ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
                      color: breakMinutes === n ? '#34d399' : 'rgba(255,255,255,0.4)',
                      fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sessions */}
      {sessionsCompleted > 0 && (
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em' }}>
          {sessionsCompleted} {sessionsCompleted === 1 ? 'sessão concluída' : 'sessões concluídas'}
        </p>
      )}
    </div>
  );
}
