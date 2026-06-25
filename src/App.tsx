import { useState, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { FocusModeProvider, useFocusMode } from './context/FocusModeContext';
import FocusModeOverlay from './components/FocusModeOverlay';
import AppLayout, { type TabId } from './components/AppLayout';
import { SubjectsProvider, useSubjectsContext } from './context/SubjectsContext';
import { useSimulados } from './hooks/useSimulados';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToastContext } from './context/ToastContext';
import { ConfirmModal } from './components/ConfirmModal';
import ErrorBoundary from './components/ErrorBoundary';
import SubjectCard from './components/SubjectCard';
import PomodoroTimer from './components/PomodoroTimer';
import RevisionPanel from './components/RevisionPanel';
import StatsPanel from './components/StatsPanel';
import NotesView from './components/NotesView';
import RedacaoView from './components/RedacaoView';
import GoalsView from './components/GoalsView';
import SimuladosAnalise from './components/SimuladosAnalise';
import ScheduleView from './components/ScheduleView';
import QuestoesView from './components/QuestoesView';
import LandingPage from './components/LandingPage';
import CheckoutPage from './components/CheckoutPage';
import SuccessPage from './components/SuccessPage';
import AuthScreen from './components/AuthScreen';
import ResetPasswordPage from './components/ResetPasswordPage';
import { Plus, GraduationCap, LayoutGrid } from 'lucide-react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSubscription } from './hooks/useSubscription';
import EnemCountdown from './components/EnemCountdown';
import './components/Dashboard.css';

const FlashcardsPanel = lazy(() => import('./components/flashcards/FlashcardsPanel'));

const SimuladosTracker = lazy(() => import('./components/SimuladosTracker'));

const PAGE_PADDING: React.CSSProperties = { padding: 'clamp(1rem, 4vw, 3rem) clamp(1rem, 5vw, 3.5rem) clamp(4rem, 10vw, 8rem)', width: '100%', boxSizing: 'border-box' };

function SectionSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Carregando...
      </span>
    </div>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────
// Handles authentication and subscription-based routing for public pages
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();

  const loading = authLoading || subLoading;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', width: '100vw',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-dark)', backgroundImage: 'var(--bg-gradient)',
      }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Carregando...</p>
        </motion.div>
      </div>
    );
  }

  // If user is authenticated AND has active subscription → go to dashboard
  if (user && hasActiveSubscription) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated BUT no active subscription → stay on current page
  // This allows them to see the landing page or checkout to complete purchase
  return <>{children}</>;
}

// Protected route wrapper for authenticated users with subscription check
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();

  const loading = authLoading || subscriptionLoading;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', width: '100vw',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-dark)', backgroundImage: 'var(--bg-gradient)',
      }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Carregando...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Redirect to landing page if user doesn't have an active subscription
  if (!hasActiveSubscription) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


// EnemCountdown component extracted to src/components/EnemCountdown.tsx

// ─── Page header helper ───────────────────────────────────────────────────────
function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: 500 }}>{subtitle}</p>}
    </div>
  );
}

// ─── Individual tab views ─────────────────────────────────────────────────────

function DashboardView() {
  const { subjects, overallProgress } = useSubjectsContext();
  const { simulados } = useSimulados();
  const [pomodoroSessions] = useLocalStorage<number>('pomodoro-sessions-completed', 0);

  return (
    <div style={PAGE_PADDING}>
      {/* Hero */}
      <div className="dashboard-header">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-title-group">
          <div className="dashboard-logo">
            <GraduationCap size={36} strokeWidth={1.5} />
          </div>
          <h1 className="dashboard-title">Foco ENEM</h1>
        </motion.div>

        {/* Progress card */}
        <div className="overall-progress-card">
          <p className="overall-progress-label">Desempenho Global</p>
          <div className="overall-progress-value-wrapper">
            <span className="overall-progress-value">{overallProgress}</span>
            <span className="overall-progress-percent">%</span>
          </div>
          <div className="overall-progress-track">
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 1.2, ease: 'circOut' }} className="overall-progress-fill" />
          </div>
        </div>
      </div>

      {/* 2-col widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        <PomodoroTimer />
        <EnemCountdown />
      </div>

      {/* Stats */}
      <StatsPanel subjects={subjects} simulados={simulados} pomodoroSessions={pomodoroSessions} />

      {/* Weekly Goals inline */}
      <div style={{ marginTop: '2.5rem' }}>
        <GoalsView />
      </div>
    </div>
  );
}

function MateriasView() {
  const { subjects, addSubject, addTopic, updateTopic, deleteSubject, removeTopic } = useSubjectsContext();
  const { showToast } = useToastContext();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; subjectId: string | null }>({ isOpen: false, subjectId: null });

  const handleAdd = () => {
    if (!newName.trim()) return;
    addSubject(newName);
    setNewName('');
    setShowAdd(false);
  };

  const handleAddTopic = useCallback((subjectId: string, name: string) => addTopic(subjectId, name), [addTopic]);
  const handleUpdateTopic = useCallback((subjectId: string, topicId: string, patch: Parameters<typeof updateTopic>[2]) => updateTopic(subjectId, topicId, patch), [updateTopic]);
  const handleRemoveTopic = useCallback((subjectId: string, topicId: string) => removeTopic(subjectId, topicId), [removeTopic]);
  const handleRequestDelete = useCallback((id: string) => setConfirmModal({ isOpen: true, subjectId: id }), []);
  const handleConfirmDelete = useCallback(() => {
    if (confirmModal.subjectId) { deleteSubject(confirmModal.subjectId); showToast('Matéria excluída.', 'info'); }
    setConfirmModal({ isOpen: false, subjectId: null });
  }, [confirmModal.subjectId, deleteSubject, showToast]);

  return (
    <div style={PAGE_PADDING}>
      <ConfirmModal isOpen={confirmModal.isOpen} message="Excluir esta matéria? Todos os tópicos serão perdidos." onConfirm={handleConfirmDelete} onCancel={() => setConfirmModal({ isOpen: false, subjectId: null })} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <PageHeader title="Matérias" subtitle={`${subjects.length} matéria${subjects.length !== 1 ? 's' : ''} cadastrada${subjects.length !== 1 ? 's' : ''}`} />
        <button onClick={() => setShowAdd(!showAdd)} className="btn-new-subject" style={{ height: '48px', padding: '0 1.5rem', fontSize: '0.85rem' }}>
          <Plus size={16} strokeWidth={2} /> Nova Matéria
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="new-subject-form-wrapper">
            <p className="new-subject-form-label">Nova Matéria</p>
            <div className="new-subject-input-group">
              <input type="text" autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAdd()} placeholder="Ex: Literatura, Filosofia, História..." className="new-subject-input" />
              <button onClick={() => setShowAdd(false)} className="btn-new-subject-cancel">Cancelar</button>
              <button onClick={handleAdd} className="btn-new-subject-submit">Criar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="subjects-grid">
        {subjects.map(subject => (
          <ErrorBoundary key={subject.id}>
            <SubjectCard subject={subject} onAddTopic={(name) => handleAddTopic(subject.id, name)} onUpdateTopic={(topicId, patch) => handleUpdateTopic(subject.id, topicId, patch)} onRemoveTopic={(topicId) => handleRemoveTopic(subject.id, topicId)} onDeleteSubject={() => handleRequestDelete(subject.id)} />
          </ErrorBoundary>
        ))}
        {subjects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}><LayoutGrid size={24} /></div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Nenhuma matéria ainda</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>Clique em "Nova Matéria" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pill sub-tab component ───────────────────────────────────────────────────
function PillTabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '6px', padding: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem', width: 'fit-content' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: active === t.id ? 'rgba(255,255,255,0.12)' : 'transparent',
          color: active === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
          fontSize: '13px', fontWeight: active === t.id ? 800 : 600,
          fontFamily: 'Lexend, sans-serif', transition: 'all 0.2s',
          letterSpacing: '0.01em',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── Revisar = Revisões + Flashcards ──────────────────────────────────────────
function RevisarView() {
  const { subjects, updateTopic } = useSubjectsContext();
  const [subTab, setSubTab] = useState('revisoes');
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Revisar" subtitle="Revisão espaçada e flashcards" />
      <PillTabs tabs={[{ id: 'revisoes', label: 'Pendentes' }, { id: 'flashcards', label: 'Flashcards' }]} active={subTab} onChange={setSubTab} />
      {subTab === 'revisoes' ? (
        <RevisionPanel subjects={subjects} updateTopic={updateTopic} />
      ) : (
        <Suspense fallback={<SectionSkeleton />}>
          <FlashcardsPanel subjects={subjects} />
        </Suspense>
      )}
    </div>
  );
}

// ─── Praticar = Questões + Simulados + Análise ───────────────────────────────
function PraticarView() {
  const [subTab, setSubTab] = useState('questoes');
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Praticar" subtitle="Questões, simulados e análise de desempenho" />
      <PillTabs tabs={[{ id: 'questoes', label: 'Questões' }, { id: 'simulados', label: 'Simulados' }, { id: 'analise', label: 'Análise' }]} active={subTab} onChange={setSubTab} />
      {subTab === 'questoes' && <QuestoesView />}
      {subTab === 'simulados' && (
        <div style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '2rem' }}>
          <Suspense fallback={<SectionSkeleton />}><SimuladosTracker /></Suspense>
        </div>
      )}
      {subTab === 'analise' && <SimuladosAnalise />}
    </div>
  );
}

// ─── Tab router ───────────────────────────────────────────────────────────────
function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'dashboard':    return <DashboardView />;
    case 'materias':     return <MateriasView />;
    case 'revisar':      return <RevisarView />;
    case 'praticar':     return <PraticarView />;
    case 'redacao':      return <RedacaoView />;
    case 'cronograma':   return <ScheduleView />;
    case 'anotacoes':    return <NotesView />;
  }
}

// ─── App inner ────────────────────────────────────────────────────────────────
function AppInner() {
  const { activeTab, navigateTo } = useNavigation();
  const { isFocusMode, exitFocusMode } = useFocusMode();
  const { subjects } = useSubjectsContext();
  const { user, signOut } = useAuth();

  return (
    <>
      <div style={{ display: isFocusMode ? 'none' : 'flex', width: '100vw', minHeight: '100vh' }}>
        <AppLayout activeTab={activeTab} onTabChange={navigateTo} onSignOut={signOut} userEmail={user?.email}>
          <TabContent tab={activeTab} />
        </AppLayout>
      </div>

      <AnimatePresence>
        {isFocusMode && <FocusModeOverlay subjects={subjects} onExit={exitFocusMode} />}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FocusModeProvider>
          <NavigationProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                <AuthGate>
                  <LandingPage />
                </AuthGate>
              } />

              <Route path="/login" element={
                <AuthGate>
                  <LandingPage showLoginInitially />
                </AuthGate>
              } />
              
              <Route path="/auth" element={
                <AuthGate>
                  <AuthScreen />
                </AuthGate>
              } />
              
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              <Route path="/checkout" element={
                <AuthGate>
                  <CheckoutPage />
                </AuthGate>
              } />
              
              {/* Bug #1 fix: /success must be outside AuthGate so that an already-
                  authenticated user who just paid can still see the confirmation page
                  instead of being redirected to /dashboard. */}
              <Route path="/success" element={<SuccessPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <SubjectsProvider>
                    <AppInner />
                  </SubjectsProvider>
                </ProtectedRoute>
              } />
              
              {/* Redirect any unknown routes to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NavigationProvider>
        </FocusModeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
