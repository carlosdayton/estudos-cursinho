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
  message: string;
  icon: React.ReactNode;
}> = {
  ok: {
    color:  '#4ade80',
    bg:     'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.25)',
    label:  'Você está no caminho certo! 🎯',
    message: 'Continue assim e você vai conseguir estudar tudo a tempo.',
    icon:   <TrendingUp size={18} />,
  },
  warning: {
    color:  '#fbbf24',
    bg:     'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.25)',
    label:  'Atenção: Ritmo apertado ⚠️',
    message: 'Você vai precisar estudar bastante para cobrir tudo. Considere aumentar suas horas.',
    icon:   <AlertTriangle size={18} />,
  },
  danger: {
    color:  '#f87171',
    bg:     'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.25)',
    label:  'Cuidado: Muito conteúdo! 🚨',
    message: 'Vai ser difícil estudar tudo. Aumente suas horas ou ajuste a data da prova.',
    icon:   <XCircle size={18} />,
  },
  completed: {
    color:  '#a78bfa',
    bg:     'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    label:  'Parabéns! Tudo coberto! 🎉',
    message: 'Você já estudou todos os tópicos. Continue revisando para fixar o conteúdo.',
    icon:   <CheckCircle size={18} />,
  },
  expired: {
    color:  'rgba(255,255,255,0.3)',
    bg:     'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
    label:  'Data Expirada',
    message: 'A data da prova já passou. Configure uma nova data acima.',
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.color, flexShrink: 0,
        }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 800, color: cfg.color, margin: 0, marginBottom: '4px' }}>
            {cfg.label}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>
            {cfg.message}
          </p>
        </div>
      </div>

      {/* Stats row */}
      {pace.status !== 'expired' && pace.status !== 'completed' && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <StatChip label="Tópicos restantes" value={pace.remainingTopics} color={cfg.color} />
          <StatChip label="Dias para estudar" value={pace.studyDaysLeft} color={cfg.color} />
        </div>
      )}
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
