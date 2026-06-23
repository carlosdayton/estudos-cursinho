import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, RefreshCw,
  GraduationCap, ChevronLeft, ChevronRight,
  NotebookPen, PenLine, CalendarClock, HelpCircle, LogOut,
  Menu, X
} from 'lucide-react';

import './AppLayout.css';

export type TabId =
  | 'dashboard'
  | 'materias'
  | 'revisar'
  | 'praticar'
  | 'redacao'
  | 'cronograma'
  | 'anotacoes';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',   icon: <LayoutDashboard size={18} strokeWidth={1.5} /> },
  { id: 'materias',    label: 'Matérias',    icon: <BookOpen size={18} strokeWidth={1.5} /> },
  { id: 'revisar',     label: 'Revisar',     icon: <RefreshCw size={18} strokeWidth={1.5} /> },
  { id: 'praticar',    label: 'Praticar',    icon: <HelpCircle size={18} strokeWidth={1.5} /> },
  { id: 'redacao',     label: 'Redação',     icon: <PenLine size={18} strokeWidth={1.5} /> },
  { id: 'cronograma',  label: 'Cronograma',  icon: <CalendarClock size={18} strokeWidth={1.5} /> },
  { id: 'anotacoes',   label: 'Anotações',   icon: <NotebookPen size={18} strokeWidth={1.5} /> },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarWidth = collapsed ? '64px' : '260px';

  const renderSidebarContent = (isMobile: boolean = false) => (
    <>
      <div className="logo-area" style={{ justifyContent: collapsed && !isMobile ? 'center' : 'flex-start', padding: collapsed && !isMobile ? '1rem 0' : '1rem 1.25rem' }}>
        <div className="logo-box">
          <GraduationCap size={16} strokeWidth={2} />
        </div>
        {(!collapsed || isMobile) && (
          <span className="logo-text">Foco ENEM</span>
        )}
      </div>

      <nav className="nav-menu">
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (isMobile) setMobileMenuOpen(false);
              }}
              title={collapsed && !isMobile ? item.label : undefined}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                padding: collapsed && !isMobile ? '0.75rem 0' : '0.75rem 1.25rem'
              }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {(!collapsed || isMobile) && (
                <span className="nav-item-label">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {(!collapsed || isMobile) && userEmail && (
          <div className="user-info">
            <p className="user-label">Operador</p>
            <p className="user-email">{userEmail}</p>
          </div>
        )}

        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Sair da conta"
            className="logout-btn"
            style={{
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
              padding: collapsed && !isMobile ? '0' : '0 1rem'
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            {(!collapsed || isMobile) && <span>Desconectar</span>}
          </button>
        )}

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expandir painel' : 'Recolher painel'}
            className="collapse-btn"
            style={{
              justifyContent: collapsed ? 'center' : 'flex-end',
              padding: '0 0.75rem'
            }}
          >
            {collapsed ? <ChevronRight size={16} strokeWidth={1.5} /> : <ChevronLeft size={16} strokeWidth={1.5} />}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* Mobile hamburger button */}
      <button
        className="mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`app-sidebar mobile ${mobileMenuOpen ? 'open' : 'closed'}`} style={{ width: '280px', minWidth: '280px' }}>
        {renderSidebarContent(true)}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="app-sidebar desktop" style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
        {renderSidebarContent(false)}
      </aside>

      {/* Main content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ flex: 1, width: '100%', height: '100%', padding: '0' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
