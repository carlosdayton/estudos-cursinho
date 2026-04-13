import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useSubjects } from '../hooks/useSubjects';
import { useSimulados } from '../hooks/useSimulados';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToastContext } from '../context/ToastContext';
import SubjectCard from './SubjectCard';
import ErrorBoundary from './ErrorBoundary';
import { ConfirmModal } from './ConfirmModal';
import { Plus, GraduationCap, LayoutGrid, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PomodoroTimer from './PomodoroTimer';
import RevisionPanel from './RevisionPanel';
import { getDaysUntilEnem, ENEM_2026_DATE } from '../utils/studyLogic';

// 15.2 — Lazy loading para SimuladosTracker e StatsPanel
const SimuladosTracker = lazy(() => import('./SimuladosTracker'));
const StatsPanel = lazy(() => import('./StatsPanel'));
const StudyPlannerPanel = lazy(() => import('./StudyPlannerPanel'));
const FlashcardsPanel = lazy(() => import('./flashcards/FlashcardsPanel'));
const StudyCyclesPanel = lazy(() => import('./StudyCyclesPanel'));

// Fallback simples para Suspense
function SectionSkeleton() {
  return (
    <div className="glass-card p-8 flex items-center justify-center min-h-[120px]">
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Carregando...
      </span>
    </div>
  );
}

const MOTIVATIONAL = [
  'Cada dia de estudo é um passo mais perto da aprovação.',
  'Consistência supera intensidade. Estude todo dia.',
  'O ENEM não espera. Mas você está preparado.',
  'Foco total. Resultado certo.',
  'Sua dedicação hoje é sua aprovação amanhã.',
];

function EnemCountdown() {
  const days = getDaysUntilEnem();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Progresso do ano até o ENEM (jan 2026 → nov 2026 ≈ 305 dias)
  const totalDays = 305;
  const elapsed = Math.max(0, totalDays - days);
  const yearProgress = Math.min(100, Math.round((elapsed / totalDays) * 100));

  const quote = MOTIVATIONAL[Math.floor(Date.now() / 86400000) % MOTIVATIONAL.length];

  // Tempo real até o ENEM
  const msLeft = new Date(ENEM_2026_DATE).getTime() - Date.now();
  const hLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const sLeft = Math.floor((msLeft % (1000 * 60)) / 1000);

  const urgency = days <= 30 ? '#f87171' : days <= 90 ? '#fbbf24' : '#818cf8';

  return (
    <div style={{
      background: 'rgba(30,41,59,0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${urgency}33`,
      borderRadius: '24px',
      padding: '1.75rem',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* top shimmer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${urgency}66, transparent)` }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: `${urgency}22`, border: `1px solid ${urgency}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: urgency,
        }}>
          <Target size={18} />
        </div>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Contagem Regressiva
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>ENEM 2026</p>
        </div>
      </div>

      {/* Big days number */}
      <div style={{ textAlign: 'center' }}>
        <motion.span
          key={days}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 900,
            color: urgency, letterSpacing: '-0.04em', lineHeight: 1,
            textShadow: `0 0 30px ${urgency}66`,
            display: 'block',
          }}
        >
          {days}
        </motion.span>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>
          dias restantes
        </p>
      </div>

      {/* HH:MM:SS live ticker */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '0.5rem',
        background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '0.6rem 1rem',
      }}>
        {[
          { val: String(hLeft).padStart(2, '0'), label: 'h' },
          { val: String(mLeft).padStart(2, '0'), label: 'm' },
          { val: String(sLeft).padStart(2, '0'), label: 's' },
        ].map(({ val, label }, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 900, fontSize: '1rem', marginRight: '4px' }}>:</span>}
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{val}</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{label}</span>
          </div>
        ))}
        {/* force re-render on tick */}
        <span style={{ display: 'none' }}>{tick}</span>
      </div>

      {/* Year progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Jan 2026</span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: urgency, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{yearProgress}% do caminho</span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nov 2026</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yearProgress}%` }}
            transition={{ duration: 1.5, ease: 'circOut' }}
            style={{ height: '100%', background: urgency, borderRadius: '99px', boxShadow: `0 0 10px ${urgency}88` }}
          />
        </div>
      </div>

      {/* Quote */}
      <p style={{
        fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic',
        lineHeight: 1.5, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem',
      }}>
        "{quote}"
      </p>
    </div>
  );
}

export default function Dashboard() {
  // 15.1 — useSubjects substitui useLocalStorage direto
  const { subjects, addSubject, updateSubject, deleteSubject, updateTopic, overallProgress } = useSubjects();

  // 15.3 — useSimulados para passar ao StatsPanel
  const { simulados } = useSimulados();

  // 15.3 — Ler sessionsCompleted do localStorage (persistido pelo usePomodoroTimer)
  const [pomodoroSessions] = useLocalStorage<number>('pomodoro-sessions-completed', 0);

  const { showToast } = useToastContext();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // 15.1 — Estado para ConfirmModal de exclusão de matéria
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; subjectId: string | null }>({
    isOpen: false,
    subjectId: null,
  });

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    addSubject(newSubjectName);
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  // 15.1 — useCallback para updateSubject passado como prop
  const handleUpdateSubject = useCallback(
    (updated: Parameters<typeof updateSubject>[0]) => {
      updateSubject(updated);
    },
    [updateSubject]
  );

  // 15.1 — Abre ConfirmModal em vez de window.confirm
  const handleRequestDelete = useCallback((id: string) => {
    setConfirmModal({ isOpen: true, subjectId: id });
  }, []);

  // 15.1 — Confirma exclusão via ConfirmModal + showToast
  const handleConfirmDelete = useCallback(() => {
    if (confirmModal.subjectId) {
      deleteSubject(confirmModal.subjectId);
      showToast('Matéria excluída com sucesso.', 'info');
    }
    setConfirmModal({ isOpen: false, subjectId: null });
  }, [confirmModal.subjectId, deleteSubject, showToast]);

  const handleCancelDelete = useCallback(() => {
    setConfirmModal({ isOpen: false, subjectId: null });
  }, []);

  return (
    <div key="dashboard-root" className="min-h-screen relative">
      {/* 15.1 — ConfirmModal para exclusão de matéria */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message="Tem certeza que deseja excluir esta matéria? Todos os tópicos serão perdidos."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <div className="fade-in max-w-7xl mx-auto space-y-16 pb-32">
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                borderRadius: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 40px rgba(99,102,241,0.5)',
                transform: 'rotate(6deg)',
              }}>
                <GraduationCap size={40} strokeWidth={2.5} />
              </div>
              <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff', textShadow: '0 0 60px rgba(255,255,255,0.15)' }}>
                Foco ENEM
              </h1>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', width: '100%' }}>
            {/* Progress card */}
            <div style={{
              background: 'rgba(30,41,59,0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '28px',
              padding: '2.5rem 3rem',
              width: '100%', maxWidth: '520px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
              <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                Desempenho Global
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: 'clamp(4rem, 12vw, 6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 0 40px rgba(255,255,255,0.3)' }}>
                  {overallProgress}
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1.2, ease: 'circOut' }}
                  style={{ height: '100%', background: '#fff', borderRadius: '99px', boxShadow: '0 0 20px rgba(255,255,255,0.6)' }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="btn btn-primary"
              style={{ height: '64px', padding: '0 2.5rem', fontSize: '1rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#818cf8', color: '#020617', boxShadow: '0 0 40px rgba(129,140,248,0.4)' }}
            >
              <Plus size={24} strokeWidth={3} />
              Nova Matéria
            </button>
          </motion.div>
        </header>

        {/* FocusModeButton movido para o footer em App.tsx */}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'stretch', padding: '1rem 0' }}>
          <PomodoroTimer />
          <EnemCountdown />
          <RevisionPanel subjects={subjects} updateTopic={updateTopic} />
        </section>

        {/* 15.3 — StatsPanel integrado com lazy loading */}
        <section style={{ paddingTop: '2rem' }}>
          <Suspense fallback={<SectionSkeleton />}>
            <StatsPanel
              subjects={subjects}
              simulados={simulados}
              pomodoroSessions={pomodoroSessions}
            />
          </Suspense>
        </section>

        <div style={{ padding: '2rem 0' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
        </div>

        <AnimatePresence>
          {showAddSubject && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                background: 'rgba(129,140,248,0.06)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(129,140,248,0.2)',
                borderRadius: '20px',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Nova Matéria
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <label htmlFor="new-subject-input" style={{
                  position: 'absolute', width: '1px', height: '1px',
                  overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
                }}>
                  Nome da matéria
                </label>
                <input
                  id="new-subject-input"
                  type="text"
                  autoFocus
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddSubject()}
                  placeholder="Ex: Literatura, Filosofia, História..."
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(129,140,248,0.25)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(129,140,248,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(129,140,248,0.25)')}
                />
                <button
                  onClick={() => setShowAddSubject(false)}
                  style={{
                    padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                    fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSubject}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                    background: '#818cf8', color: '#020617',
                    fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(129,140,248,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  Criar Matéria
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 15.1 — SubjectCard envolvido com ErrorBoundary */}
        {/* 15.5 — Grid responsiva: 1 coluna mobile, 2 colunas tablet, 3 colunas desktop */}
        <div className="subjects-grid">
          {subjects.map(subject => (
            <ErrorBoundary key={subject.id}>
              <SubjectCard
                subject={subject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={() => handleRequestDelete(subject.id)}
              />
            </ErrorBoundary>
          ))}
          {subjects.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '4rem 2rem', textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)',
              }}>
                <LayoutGrid size={24} />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
                Nenhuma matéria ainda
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
                Clique em "Nova Matéria" para começar
              </p>
            </div>
          )}
        </div>

        {/* StudyCyclesPanel */}
        <section style={{
          marginTop: '3rem',
          paddingTop: '3rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Suspense fallback={<SectionSkeleton />}>
            <StudyCyclesPanel subjects={subjects} />
          </Suspense>
        </section>

        {/* StudyPlannerPanel */}
        <section style={{
          marginTop: '3rem',
          paddingTop: '3rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Suspense fallback={<SectionSkeleton />}>
            <StudyPlannerPanel subjects={subjects} />
          </Suspense>
        </section>

        {/* SimuladosTracker */}
        <section style={{
          marginTop: '3rem',
          paddingTop: '3rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '28px',
            padding: '2rem',
          }}>
            <Suspense fallback={<SectionSkeleton />}>
              <SimuladosTracker />
            </Suspense>
          </div>
        </section>

        {/* FlashcardsPanel */}
        <section style={{
          marginTop: '3rem',
          paddingTop: '3rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Suspense fallback={<SectionSkeleton />}>
            <FlashcardsPanel subjects={subjects} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
