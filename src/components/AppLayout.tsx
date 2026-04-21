import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Timer, RefreshCw,
  BarChart3, GraduationCap, ChevronLeft, ChevronRight,
  Layers, Calendar, Zap, NotebookPen,
  PenLine, Target, BarChart2, CalendarClock, HelpCircle, LogOut,
  Menu, X
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'materias'
  | 'pomodoro'
  | 'revisoes'
  | 'simulados'
  | 'anotacoes'
  | 'ciclos'
  | 'planner'
  | 'flashcards'
  | 'redacao'
  | 'metas'
  | 'analise'
  | 'cronograma'
  | 'questoes'
  | 'estatisticas';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={20} />, color: '#818cf8' },
  { id: 'materias',   label: 'Matérias',   icon: <BookOpen size={20} />,        color: '#34d399' },
  { id: 'pomodoro',   label: 'Pomodoro',   icon: <Timer size={20} />,           color: '#f472b6' },
  { id: 'revisoes',   label: 'Revisões',   icon: <RefreshCw size={20} />,       color: '#fbbf24' },
  { id: 'simulados',  label: 'Simulados',  icon: <BarChart3 size={20} />,       color: '#60a5fa' },
  { id: 'anotacoes',  label: 'Anotações',  icon: <NotebookPen size={20} />,     color: '#a78bfa' },
  { id: 'ciclos',      label: 'Ciclos',      icon: <Layers size={20} />,          color: '#fb923c' },
  { id: 'planner',     label: 'Planner',     icon: <Calendar size={20} />,        color: '#2dd4bf' },
  { id: 'flashcards',  label: 'Flashcards',  icon: <Zap size={20} />,             color: '#f87171' },
  { id: 'redacao',     label: 'Redação',     icon: <PenLine size={20} />,         color: '#e879f9' },
  { id: 'metas',       label: 'Metas',       icon: <Target size={20} />,          color: '#fb923c' },
  { id: 'analise',     label: 'Análise',     icon: <BarChart2 size={20} />,       color: '#38bdf8' },
  { id: 'cronograma',  label: 'Cronograma',  icon: <CalendarClock size={20} />,   color: '#a3e635' },
  { id: 'questoes',    label: 'Questões',    icon: <HelpCircle size={20} />,      color: '#f472b6' },
];

interface AppLayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: React.ReactNode;
  onSignOut?: () => void;
  userEmail?: string;
}

export default function AppLayout({ activeTab, onTabChange, children, onSignOut, userEmail }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const isMobile = window.innerWidth < 768;
      setMobile(isMobile);
      if (isMobile) setCollapsed(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const sidebarWidth = mobile ? (mobileMenuOpen ? '220px' : '0px') : (collapsed ? '72px' : '220px');

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Mobile hamburger button */}
      {mobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: 200,
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(10,15,30,0.9)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Mobile overlay */}
      {mobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        position: mobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: mobile ? 'none' : '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        zIndex: 100,
        paddingBottom: '64px',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '1.5rem 0' : '1.5rem 1.25rem',
          display: 'flex', alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>
            <GraduationCap size={18} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span style={{
              fontSize: '1rem', fontWeight: 900, color: '#fff',
              letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            }}>
              Foco ENEM
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '0.75rem' }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (mobile) setMobileMenuOpen(false);
                }}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem 0' : '0.75rem 1.25rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? `${item.color}18` : 'transparent',
                  color: isActive ? item.color : 'rgba(255,255,255,0.4)',
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '13px', fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
                  }
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle + logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* User email */}
          {!collapsed && userEmail && (
            <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', margin: '0 0 1px' }}>Logado como</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {userEmail}
              </p>
            </div>
          )}

          {/* Logout button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Sair da conta"
              style={{
                width: '100%',
                height: '38px',
                border: '1px solid rgba(248,113,113,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '8px',
                padding: collapsed ? '0' : '0 0.75rem',
                background: 'rgba(248,113,113,0.06)',
                borderRadius: '10px',
                color: 'rgba(248,113,113,0.7)',
                transition: 'all 0.2s',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)';
                (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.06)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,113,113,0.7)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.2)';
              }}
            >
              <LogOut size={15} />
              {!collapsed && <span>Sair da conta</span>}
            </button>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            style={{
              width: '100%',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.3)',
              transition: 'all 0.2s',
              height: '32px',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        width: 0,
        minWidth: 0,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '64px',
        paddingTop: mobile ? '60px' : '0px',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ flex: 1, width: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
