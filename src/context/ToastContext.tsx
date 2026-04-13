import { createContext, useContext, type ReactNode } from 'react';
import { useToast, type ToastType } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Retorna `showToast` do contexto global.
 * Deve ser usado dentro de um `ToastProvider`.
 */
export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastContext deve ser usado dentro de um <ToastProvider>');
  }
  return ctx;
}
