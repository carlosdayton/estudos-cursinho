import { useState, useCallback, lazy, Suspense } from 'react';
import { useSubjectsContext } from '../context/SubjectsContext';
import { useSimulados } from '../hooks/useSimulados';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToastContext } from '../context/ToastContext';
import SubjectCard from './SubjectCard';
import ErrorBoundary from './ErrorBoundary';
import { ConfirmModal } from './ConfirmModal';
import { Plus, GraduationCap, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PomodoroTimer from './PomodoroTimer';
import RevisionPanel from './RevisionPanel';
import EnemCountdown from './EnemCountdown';
import './Dashboard.css';

const SimuladosTracker = lazy(() => import('./SimuladosTracker'));
const StatsPanel = lazy(() => import('./StatsPanel'));
const StudyPlannerPanel = lazy(() => import('./StudyPlannerPanel'));
const FlashcardsPanel = lazy(() => import('./flashcards/FlashcardsPanel'));
const StudyCyclesPanel = lazy(() => import('./StudyCyclesPanel'));

function SectionSkeleton() {
  return (
    <div className="glass-card p-8 flex items-center justify-center min-h-[120px]" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)'}}>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Carregando Módulo...
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { subjects, addSubject, updateSubject, deleteSubject, updateTopic, overallProgress } = useSubjectsContext();
  const { simulados } = useSimulados();
  const [pomodoroSessions] = useLocalStorage<number>('pomodoro-sessions-completed', 0);
  const { showToast } = useToastContext();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

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

  const handleUpdateSubject = useCallback(
    (updated: Parameters<typeof updateSubject>[0]) => {
      updateSubject(updated);
    },
    [updateSubject]
  );

  const handleRequestDelete = useCallback((id: string) => {
    setConfirmModal({ isOpen: true, subjectId: id });
  }, []);

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
    <div key="dashboard-root" className="dashboard-root">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message="Tem certeza que deseja excluir esta matéria? Todos os tópicos serão perdidos."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <div className="max-w-7xl mx-auto pb-32">
        <header className="dashboard-header">
          <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="dashboard-title-group">
              <div className="dashboard-logo">
                <GraduationCap size={40} strokeWidth={1.5} />
              </div>
              <h1 className="dashboard-title">
                Foco ENEM
              </h1>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
            className="dashboard-actions-group">
            <div className="overall-progress-card">
              <p className="overall-progress-label">
                Desempenho Global
              </p>
              <div className="overall-progress-value-wrapper">
                <span className="overall-progress-value">
                  {overallProgress}
                </span>
                <span className="overall-progress-percent">%</span>
              </div>
              <div className="overall-progress-track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1.2, ease: 'circOut' }}
                  className="overall-progress-fill"
                />
              </div>
            </div>

            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="btn-new-subject"
            >
              <Plus size={24} strokeWidth={2} />
              Nova Matéria
            </button>
          </motion.div>
        </header>

        <AnimatePresence>
          {showAddSubject && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="new-subject-form-wrapper"
            >
              <p className="new-subject-form-label">
                Criar Nova Matéria
              </p>
              <div className="new-subject-input-group">
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
                  className="new-subject-input"
                />
                <button
                  onClick={() => setShowAddSubject(false)}
                  className="btn-new-subject-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSubject}
                  className="btn-new-subject-submit"
                >
                  Adicionar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="dashboard-top-section">
          <PomodoroTimer />
          <EnemCountdown />
          <RevisionPanel subjects={subjects} updateTopic={updateTopic} />
        </section>

        <section style={{ paddingTop: '2rem' }}>
          <Suspense fallback={<SectionSkeleton />}>
            <StatsPanel
              subjects={subjects}
              simulados={simulados}
              pomodoroSessions={pomodoroSessions}
            />
          </Suspense>
        </section>

        <div className="dashboard-divider">
          <div className="dashboard-divider-line" />
        </div>

        <div className="subjects-grid">
          {subjects.map(subject => (
            <ErrorBoundary key={subject.id}>
              <SubjectCard
                subject={subject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleRequestDelete}
              />
            </ErrorBoundary>
          ))}
          {subjects.length === 0 && (
            <div className="empty-subjects-placeholder">
              <div className="empty-subjects-icon">
                <LayoutGrid size={24} strokeWidth={1.5} />
              </div>
              <p className="empty-subjects-title">
                Nenhuma matéria monitorada
              </p>
              <p className="empty-subjects-subtitle">
                Adicione uma nova matéria para começar o rastreamento.
              </p>
            </div>
          )}
        </div>

        {/* Lazy Panels */}
        <section className="dashboard-lazy-section">
          <Suspense fallback={<SectionSkeleton />}>
            <StudyCyclesPanel subjects={subjects} />
          </Suspense>
        </section>

        <section className="dashboard-lazy-section">
          <Suspense fallback={<SectionSkeleton />}>
            <StudyPlannerPanel subjects={subjects} />
          </Suspense>
        </section>

        <section className="dashboard-lazy-section">
          <div className="dashboard-lazy-container">
            <Suspense fallback={<SectionSkeleton />}>
              <SimuladosTracker />
            </Suspense>
          </div>
        </section>

        <section className="dashboard-lazy-section">
          <Suspense fallback={<SectionSkeleton />}>
            <FlashcardsPanel subjects={subjects} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
