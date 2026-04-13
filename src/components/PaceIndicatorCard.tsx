import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import type { PaceIndicator, PaceStatus } from '../utils/plannerTypes';

interface PaceIndicatorCardProps {
  pace: PaceIndicator;
}

const STATUS_CONFIG: Record<PaceStatus, {
  color: string;
  bg: string;
  border: string;
  label: string;
  icon: React.ReactNode;
}> = {
  ok: {
    color:  '#4ade80',
    bg:     'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.25)',
    label:  'Ritmo Adequado',
    icon:   <TrendingUp size={18} />,
  },
  warning: {
    color:  '#fbbf24',
    bg:     'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.25)',
    label:  'Atenção ao Ritmo',
    icon:   <AlertTriangle size={18} />,
  },
  danger: {
    color:  '#f87171',
    bg:     'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.25)',
    label:  'Ritmo Insuficiente',
    icon:   <XCircle size={18} />,
  },
  completed: {
    color:  '#a78bfa',
    bg:     'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    label:  'Todos os Tópicos Cobertos',
    icon:   <CheckCircle size={18} />,
  },
  expired: {
    color:  'rgba(255,255,255,0.3)',
    bg:     'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
    label:  'Data Expirada',
    icon:   <Clock size={18} />,
  },
};

export default function PaceIndicatorCard({ pace }: PaceIndicatorCardProps) {
  const cfg = STATUS_CONFIG[pace.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background:         cfg.bg,
        backdropFilter:     'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border:             `1px solid ${cfg.border}`,
        borderRadius:       '20px',
        padding:            '1.5rem',
        position:           'relative',
        overflow:           'hidden',
      }}
    >
      {/* shimmer top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${cfg.color}55, transparent)`,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.color,
        }}>
          {cfg.icon}
        </div>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Indicador de Ritmo
          </p>
          <p style={{ fontSize: '12px', fontWeight: 700, color: cfg.color, margin: 0 }}>
            {cfg.label}
          </p>
        </div>
      </div>

      {/* Main metric */}
      {pace.status !== 'expired' && pace.status !== 'completed' && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <motion.span
            key={pace.topicsPerStudyDay}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 900,
              color: cfg.color,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              textShadow: `0 0 24px ${cfg.color}66`,
              display: 'block',
            }}
          >
            {pace.topicsPerStudyDay === Infinity ? '∞' : pace.topicsPerStudyDay.toFixed(1)}
          </motion.span>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '4px' }}>
            tópicos / dia de estudo
          </p>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {pace.status !== 'expired' && (
          <StatChip label="Tópicos restantes" value={pace.remainingTopics} color={cfg.color} />
        )}
        {pace.status !== 'expired' && pace.status !== 'completed' && (
          <StatChip label="Dias de estudo" value={pace.studyDaysLeft} color={cfg.color} />
        )}
        {pace.status === 'completed' && (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', margin: 0 }}>
            Parabéns! Todos os tópicos foram cobertos.
          </p>
        )}
        {pace.status === 'expired' && (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: 0 }}>
            A data-alvo já passou. Configure uma nova data.
          </p>
        )}
      </div>
    </motion.div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: 1,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '0.6rem 0.75rem',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>
        {label}
      </p>
    </div>
  );
}
