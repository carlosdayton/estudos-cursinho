import { useState, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';
import { FocusModeProvider, useFocusMode } from './context/FocusModeContext';
import FocusModeOverlay from './components/FocusModeOverlay';
import FocusModeButton from './components/FocusModeButton';
import AppLayout, { type TabId } from './components/AppLayout';
import { useSubjects } from './hooks/useSubjects';
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
import { Plus, GraduationCap, LayoutGrid, Target, Sparkles } from 'lucide-react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSubscription } from './hooks/useSubscription';

import { getDaysUntilEnem, ENEM_2026_DATE } from './utils/studyLogic';
import { useEffect } from 'react';
const StudyPlannerPanel = lazy(() => import('./components/StudyPlannerPanel'));
const FlashcardsPanel = lazy(() => import('./components/flashcards/FlashcardsPanel'));
const StudyCyclesPanel = lazy(() => import('./components/StudyCyclesPanel'));

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
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(id); }, []);
  const totalDays = 305;
  const elapsed = Math.max(0, totalDays - days);
  const yearProgress = Math.min(100, Math.round((elapsed / totalDays) * 100));
  const quote = MOTIVATIONAL[Math.floor(Date.now() / 86400000) % MOTIVATIONAL.length];
  const msLeft = new Date(ENEM_2026_DATE).getTime() - Date.now();
  const hLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const sLeft = Math.floor((msLeft % (1000 * 60)) / 1000);
  const urgency = days <= 30 ? '#f87171' : days <= 90 ? '#fbbf24' : '#818cf8';

  return (
    <div style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${urgency}33`, borderRadius: '28px', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${urgency}66, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${urgency}22`, border: `1px solid ${urgency}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: urgency }}>
          <Target size={18} />
        </div>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Contagem Regressiva</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>ENEM 2026</p>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <motion.span key={days} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: 'clamp(4rem, 6vw, 5.5rem)', fontWeight: 900, color: urgency, letterSpacing: '-0.04em', lineHeight: 1, textShadow: `0 0 30px ${urgency}66`, display: 'block' }}>{days}</motion.span>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>dias restantes</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
        {[{ val: String(hLeft).padStart(2, '0'), label: 'h' }, { val: String(mLeft).padStart(2, '0'), label: 'm' }, { val: String(sLeft).padStart(2, '0'), label: 's' }].map(({ val, label }, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 900, fontSize: '1rem', marginRight: '4px' }}>:</span>}
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{val}</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{label}</span>
          </div>
        ))}
        <span style={{ display: 'none' }}>{tick}</span>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Jan 2026</span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: urgency, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{yearProgress}% do caminho</span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nov 2026</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${yearProgress}%` }} transition={{ duration: 1.5, ease: 'circOut' }} style={{ height: '100%', background: urgency, borderRadius: '99px', boxShadow: `0 0 10px ${urgency}88` }} />
        </div>
      </div>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>"{quote}"</p>
    </div>
  );
}

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
  const { subjects, overallProgress } = useSubjects();
  const { simulados } = useSimulados();
  const [pomodoroSessions] = useLocalStorage<number>('pomodoro-sessions-completed', 0);

  return (
    <div style={PAGE_PADDING}>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem', marginBottom: '3rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 40px rgba(99,102,241,0.5)', transform: 'rotate(6deg)', margin: '0 auto 1rem' }}>
            <GraduationCap size={36} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff', margin: 0 }}>Foco ENEM</h1>
        </motion.div>

        {/* Progress card */}
        <div style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '32px', padding: '2.5rem 4rem', width: '100%', maxWidth: '700px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Desempenho Global</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 0 40px rgba(255,255,255,0.3)' }}>{overallProgress}</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 1.2, ease: 'circOut' }} style={{ height: '100%', background: '#fff', borderRadius: '99px', boxShadow: '0 0 20px rgba(255,255,255,0.6)' }} />
          </div>
        </div>
      </div>

      {/* 3-col widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        <PomodoroTimer />
        <EnemCountdown />
        <RevisionPanel subjects={subjects} updateTopic={() => {}} />
      </div>

      {/* Stats */}
      <StatsPanel subjects={subjects} simulados={simulados} pomodoroSessions={pomodoroSessions} />
    </div>
  );
}

function MateriasView() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjects();
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

  const handleUpdateSubject = useCallback((updated: Parameters<typeof updateSubject>[0]) => updateSubject(updated), [updateSubject]);
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
        <button onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.625rem 1.25rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: '#818cf8', color: '#020617', fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(129,140,248,0.4)' }}>
          <Plus size={16} strokeWidth={3} /> Nova Matéria
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Nova Matéria</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input type="text" autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAdd()} placeholder="Ex: Literatura, Filosofia, História..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.95rem', fontFamily: 'Lexend, sans-serif', outline: 'none' }} />
              <button onClick={() => setShowAdd(false)} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleAdd} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: '#818cf8', color: '#020617', fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', boxShadow: '0 4px 20px rgba(129,140,248,0.4)' }}>Criar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="subjects-grid">
        {subjects.map(subject => (
          <ErrorBoundary key={subject.id}>
            <SubjectCard subject={subject} onUpdateSubject={handleUpdateSubject} onDeleteSubject={() => handleRequestDelete(subject.id)} />
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

function PomodoroView() {
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Pomodoro" subtitle="Gerencie suas sessões de foco" />
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <PomodoroTimer />
      </div>
    </div>
  );
}

function RevisoesView() {
  const { subjects, updateTopic } = useSubjects();
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Revisões" subtitle="Tópicos pendentes e próximas revisões" />
      <RevisionPanel subjects={subjects} updateTopic={updateTopic} />
    </div>
  );
}

function SimuladosView() {
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Simulados" subtitle="Acompanhe sua evolução rumo à aprovação" />
      <div style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '2rem' }}>
        <Suspense fallback={<SectionSkeleton />}>
          <SimuladosTracker />
        </Suspense>
      </div>
    </div>
  );
}

function EstatisticasView() {
  const { subjects } = useSubjects();
  const { simulados } = useSimulados();
  const [pomodoroSessions] = useLocalStorage<number>('pomodoro-sessions-completed', 0);
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Estatísticas" subtitle="Seu progresso em números" />
      <StatsPanel subjects={subjects} simulados={simulados} pomodoroSessions={pomodoroSessions} />
    </div>
  );
}

function CiclosView() {
  const { subjects } = useSubjects();
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Ciclos de Estudo" subtitle="Organize seus ciclos de revisão" />
      <Suspense fallback={<SectionSkeleton />}>
        <StudyCyclesPanel subjects={subjects} />
      </Suspense>
    </div>
  );
}

function PlannerView() {
  const { subjects } = useSubjects();
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Planner" subtitle="Planeje sua semana de estudos" />
      <Suspense fallback={<SectionSkeleton />}>
        <StudyPlannerPanel subjects={subjects} />
      </Suspense>
    </div>
  );
}

function FlashcardsView() {
  const { subjects } = useSubjects();
  return (
    <div style={PAGE_PADDING}>
      <PageHeader title="Flashcards" subtitle="Revise com cartões de memória" />
      <Suspense fallback={<SectionSkeleton />}>
        <FlashcardsPanel subjects={subjects} />
      </Suspense>
    </div>
  );
}

// ─── Tab router ───────────────────────────────────────────────────────────────
function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'dashboard':    return <DashboardView />;
    case 'materias':     return <MateriasView />;
    case 'pomodoro':     return <PomodoroView />;
    case 'revisoes':     return <RevisoesView />;
    case 'simulados':    return <SimuladosView />;
    case 'anotacoes':    return <NotesView />;
    case 'estatisticas': return <EstatisticasView />;
    case 'ciclos':       return <CiclosView />;
    case 'planner':      return <PlannerView />;
    case 'flashcards':   return <FlashcardsView />;
    case 'redacao':      return <RedacaoView />;
    case 'metas':        return <GoalsView />;
    case 'analise':      return <SimuladosAnalise />;
    case 'cronograma':   return <ScheduleView />;
    case 'questoes':     return <QuestoesView />;
  }
}

// ─── App inner ────────────────────────────────────────────────────────────────
function AppInner() {
  const { activeTab, navigateTo } = useNavigation();
  const { isFocusMode, exitFocusMode } = useFocusMode();
  const { subjects } = useSubjects();
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

      {!isFocusMode && (
        <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.08)', zIndex: 9999, padding: '12px 2rem' }}>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617', borderRadius: '10px', boxShadow: '0 4px 12px rgba(255,255,255,0.2)', flexShrink: 0 }}>
                <Sparkles size={18} fill="currentColor" />
              </div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0 }}>Sistema de Elite</p>
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Revisão Automática Ativada</p>
              </div>
            </div>
            <div style={{ position: 'absolute', right: 0 }}>
              <FocusModeButton subjects={subjects} />
            </div>
          </motion.div>
        </footer>
      )}
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
                  <AppInner />
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
