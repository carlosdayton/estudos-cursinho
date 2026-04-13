import { useReducedMotion, AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

export function ConfirmModal({ isOpen, message, onConfirm, onCancel }: ConfirmModalProps) {
  const shouldReduceMotion = useReducedMotion();

  // Req 14.5: respeitar prefers-reduced-motion
  const backdropVariants = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const modalVariants = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.92, y: 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.92, y: 16 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — Req 13.1, 13.3 */}
          <motion.div
            key="confirm-backdrop"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(2, 6, 23, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 9998,
            }}
          />

          {/* Modal — Req 13.1, 13.2, 13.4 */}
          <motion.div
            key="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-message"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              width: '100%',
              maxWidth: '420px',
              padding: '0 1rem',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '24px',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(129, 140, 248, 0.1)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top shimmer line */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.4), transparent)',
                }}
              />

              {/* Close button — Req 13.3 */}
              <button
                onClick={onCancel}
                aria-label="Fechar modal"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#64748b',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget;
                  btn.style.color = '#e2e8f0';
                  btn.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget;
                  btn.style.color = '#64748b';
                  btn.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <X size={14} />
              </button>

              {/* Icon */}
              <div
                aria-hidden="true"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(248, 113, 113, 0.12)',
                  border: '1px solid rgba(248, 113, 113, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertTriangle size={24} color="#f87171" />
              </div>

              {/* Title */}
              <h2
                id="confirm-modal-title"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  marginBottom: '0.625rem',
                  fontFamily: 'Lexend, sans-serif',
                  letterSpacing: '-0.02em',
                }}
              >
                Confirmar exclusão
              </h2>

              {/* Message */}
              <p
                id="confirm-modal-message"
                style={{
                  fontSize: '0.9rem',
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  marginBottom: '1.75rem',
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                {message}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                {/* Cancel — Req 13.3 */}
                <button
                  onClick={onCancel}
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Lexend, sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = 'rgba(255, 255, 255, 0.1)';
                    btn.style.color = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = 'rgba(255, 255, 255, 0.05)';
                    btn.style.color = '#94a3b8';
                  }}
                >
                  Cancelar
                </button>

                {/* Confirm — Req 13.2 */}
                <button
                  onClick={onConfirm}
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '14px',
                    background: 'rgba(248, 113, 113, 0.15)',
                    border: '1px solid rgba(248, 113, 113, 0.35)',
                    color: '#f87171',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Lexend, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = 'rgba(248, 113, 113, 0.25)';
                    btn.style.borderColor = 'rgba(248, 113, 113, 0.55)';
                    btn.style.color = '#fca5a5';
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.background = 'rgba(248, 113, 113, 0.15)';
                    btn.style.borderColor = 'rgba(248, 113, 113, 0.35)';
                    btn.style.color = '#f87171';
                  }}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
