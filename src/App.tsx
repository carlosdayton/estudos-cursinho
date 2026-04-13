import Dashboard from './components/Dashboard'
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { FocusModeProvider, useFocusMode, resolveActiveSubject } from './context/FocusModeContext';
import FocusModeOverlay from './components/FocusModeOverlay';
import FocusModeButton from './components/FocusModeButton';
import { useSubjects } from './hooks/useSubjects';

function AppInner() {
  const { isFocusMode, activeSubjectId, exitFocusMode } = useFocusMode();
  const { subjects } = useSubjects();
  const activeSubject = resolveActiveSubject(activeSubjectId, subjects);

  return (
    <div className="App">
      {/* Dashboard hidden (not unmounted) to preserve PomodoroTimer state */}
      <div style={{ display: isFocusMode ? 'none' : 'block' }}>
        <Dashboard />
      </div>

      <AnimatePresence>
        {isFocusMode && (
          <FocusModeOverlay activeSubject={activeSubject} onExit={exitFocusMode} />
        )}
      </AnimatePresence>

      {/* GLOBAL FLOAT BAR - FOOTER */}
      {!isFocusMode && (
        <footer
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 9999,
            padding: '16px 2rem',
          }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', position: 'relative' }}
          >
            {/* Sistema de Elite */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#020617',
                  borderRadius: '12px',
                  boxShadow: '0 10px 20px rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <h5 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-1 font-lexend">Sistema de Elite</h5>
                <p className="text-[13px] font-black text-white tracking-[0.05em] uppercase leading-none font-lexend">Revisão Automática Ativada</p>
              </div>
            </div>

            {/* Botão Modo Foco — canto direito do footer */}
            <div style={{ position: 'absolute', right: 0 }}>
              <FocusModeButton subjects={subjects} />
            </div>
          </motion.div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <FocusModeProvider>
        <AppInner />
      </FocusModeProvider>
    </ToastProvider>
  );
}

export default App
