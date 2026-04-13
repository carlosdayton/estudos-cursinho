import { useReducedMotion } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast, ToastType } from '../hooks/useToast';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, { border: string; icon: React.ReactNode; label: string }> = {
  success: {
    border: '1px solid rgba(74, 222, 128, 0.4)',
    icon: <CheckCircle size={18} color="#4ade80" />,
    label: 'Sucesso',
  },
  error: {
    border: '1px solid rgba(248, 113, 113, 0.4)',
    icon: <XCircle size={18} color="#f87171" />,
    label: 'Erro',
  },
  info: {
    border: '1px solid rgba(129, 140, 248, 0.4)',
    icon: <Info size={18} color="#818cf8" />,
    label: 'Informação',
  },
  warning: {
    border: '1px solid rgba(251, 191, 36, 0.4)',
    icon: <AlertTriangle size={18} color="#fbbf24" />,
    label: 'Aviso',
  },
};

// ─── Single Toast ────────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const style = TOAST_STYLES[toast.type];

  // Req 14.5: respeitar prefers-reduced-motion
  const variants = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 24, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -12, scale: 0.95 },
      };

  return (
    <motion.div
      layout
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: style.border,
        borderRadius: '16px',
        padding: '0.875rem 1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: '280px',
        maxWidth: '400px',
        pointerEvents: 'auto',
      }}
    >
      <span aria-hidden="true">{style.icon}</span>
      <span
        style={{
          flex: 1,
          fontSize: '0.9rem',
          fontWeight: 500,
          color: '#e2e8f0',
          fontFamily: 'Lexend, sans-serif',
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Fechar notificação"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          borderRadius: '6px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#94a3b8')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#64748b')}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Toast Container ─────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      aria-label="Notificações"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
