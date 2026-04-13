import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CalendarDays, BarChart3, Trophy, ChevronDown } from 'lucide-react';
import type { Subject } from '../utils/studyLogic';
import { useStudyPlanning } from '../hooks/useStudyPlanning';
import GoalConfigSection from './GoalConfigSection';
import PriorityConfigSection from './PriorityConfigSection';
import WeeklyScheduleGrid from './WeeklyScheduleGrid';
import PaceIndicatorCard from './PaceIndicatorCard';

interface StudyPlannerPanelProps {
  subjects: Subject[];
}

type Tab = 'schedule' | 'config';

export default function StudyPlannerPanel({ subjects }: StudyPlannerPanelProps) {
  const { goal, priorities, schedule, pace, setTargetDate, setDailyHours, setPriority } = useStudyPlanning(subjects);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [configOpen, setConfigOpen] = useState(true);

  const allCompleted = pace.status === 'completed';

  return (
    <div style={{
      background:           'rgba(15,23,42,0.5)',
      backdropFilter:       'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border:               '1px solid rgba(255,255,255,0.08)',
      borderRadius:         '28px',
      overflow:             'hidden',
    }}>
      {/* Panel header */}
      <div style={{
        padding:      '1.5rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display:      'flex',
        alignItems:   'center',
        gap:          '1rem',
        flexWrap:     'wrap',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: '0 0 24px rgba(129,140,248,0.4)',
          flexShrink: 0,
        }}>
          <BookOpen size={22} strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Módulo de Planejamento
          </p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Organização e Cronograma
          </h2>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
          {([
            { id: 'schedule', label: 'Cronograma', icon: <CalendarDays size={14} /> },
            { id: 'config',   label: 'Configurar',  icon: <BarChart3 size={14} /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '5px',
                padding:      '0.4rem 0.9rem',
                borderRadius: '8px',
                border:       'none',
                background:   activeTab === tab.id ? 'rgba(129,140,248,0.2)' : 'transparent',
                color:        activeTab === tab.id ? '#818cf8' : 'rgba(255,255,255,0.4)',
                fontSize:     '11px',
                fontWeight:   700,
                fontFamily:   'Lexend, sans-serif',
                cursor:       'pointer',
                transition:   'all 0.15s',
                outline:      activeTab === tab.id ? '1px solid rgba(129,140,248,0.3)' : 'none',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel body */}
      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* All completed banner */}
        <AnimatePresence>
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                background:   'rgba(167,139,250,0.1)',
                border:       '1px solid rgba(167,139,250,0.3)',
                borderRadius: '16px',
                padding:      '1rem 1.25rem',
                display:      'flex',
                alignItems:   'center',
                gap:          '0.75rem',
              }}
            >
              <Trophy size={20} style={{ color: '#a78bfa', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#a78bfa', margin: 0 }}>
                  Parabéns! Todos os tópicos foram cobertos.
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Continue revisando para manter o conhecimento fresco.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pace indicator — always visible */}
        <PaceIndicatorCard pace={pace} />

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <SectionHeader title="Cronograma Semanal" subtitle="Distribuição automática por prioridade" />
              <div style={{ marginTop: '1rem' }}>
                <WeeklyScheduleGrid schedule={schedule} />
              </div>
            </motion.div>
          )}

          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* Goal config */}
              <CollapsibleSection
                title="Meta e Horas de Estudo"
                subtitle="Data-alvo e disponibilidade diária"
                open={configOpen}
                onToggle={() => setConfigOpen(o => !o)}
              >
                <GoalConfigSection
                  goal={goal}
                  onGoalChange={g => {
                    setTargetDate(g.targetDate);
                    g.dailyHours.forEach((h, i) => setDailyHours(i, h));
                  }}
                />
              </CollapsibleSection>

              {/* Priority config */}
              <div>
                <SectionHeader title="Prioridade por Matéria" subtitle="Peso e dificuldade pessoal" />
                <div style={{ marginTop: '0.75rem' }}>
                  <PriorityConfigSection
                    subjects={subjects}
                    priorities={priorities}
                    onPriorityChange={setPriority}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: 0 }}>{title}</p>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, marginTop: '2px' }}>{subtitle}</p>
    </div>
  );
}

function CollapsibleSection({
  title, subtitle, open, onToggle, children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background:   'rgba(255,255,255,0.03)',
      border:       '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow:     'hidden',
    }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width:      '100%',
          display:    'flex',
          alignItems: 'center',
          gap:        '0.75rem',
          padding:    '0.9rem 1rem',
          background: 'transparent',
          border:     'none',
          cursor:     'pointer',
          textAlign:  'left',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff', margin: 0 }}>{title}</p>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{subtitle}</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1rem 1rem' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
