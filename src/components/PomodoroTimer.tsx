import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';

export default function PomodoroTimer() {
  const { isActive, mode, sessionsCompleted, formattedTime, progress, start, pause, reset, switchMode } = usePomodoroTimer();
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
      borderRadius: '24px',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* shimmer top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${accentColor}66, transparent)`,
      }} />

      {/* sr-only live region */}
      <div aria-live="polite" aria-atomic="true" style={{
        position: 'absolute', width: '1px', height: '1px',
        overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
      }}>
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
              {m === 'work' ? 'Foco' : 'Pausa'}
            </button>
          );
        })}
      </div>

      {/* Progress ring + time */}
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="80" cy="80" r="70" fill="none"
            stroke={accentColor} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${accentGlow})` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
        }}>
          <motion.span
            key={formattedTime}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            aria-hidden="true"
            style={{
              fontSize: '2.25rem', fontWeight: 900, color: '#fff',
              letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
              textShadow: `0 0 20px ${accentGlow}`,
            }}
          >
            {formattedTime}
          </motion.span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {modeLabel}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={toggleTimer}
          aria-label={isActive ? 'Pausar timer' : 'Iniciar timer'}
          style={{
            width: '56px', height: '56px', borderRadius: '18px', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? 'rgba(251,191,36,0.15)' : '#fff',
            color: isActive ? '#fbbf24' : '#020617',
            boxShadow: isActive ? '0 0 20px rgba(251,191,36,0.3)' : '0 8px 24px rgba(255,255,255,0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          {isActive ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>
        <button
          onClick={reset}
          aria-label="Reiniciar timer"
          style={{
            width: '56px', height: '56px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Sessions */}
      {sessionsCompleted > 0 && (
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em' }}>
          {sessionsCompleted} {sessionsCompleted === 1 ? 'sessão concluída' : 'sessões concluídas'}
        </p>
      )}
    </div>
  );
}
