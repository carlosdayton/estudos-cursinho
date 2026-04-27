import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trophy } from 'lucide-react';
import type { Subject } from '../utils/studyLogic';
import { useStudyPlanning } from '../hooks/useStudyPlanning';
import GoalConfigSection from './GoalConfigSection';
import PriorityConfigSection from './PriorityConfigSection';
import WeeklyScheduleGrid from './WeeklyScheduleGrid';
import PaceIndicatorCard from './PaceIndicatorCard';

interface StudyPlannerPanelProps {
  subjects: Subject[];
}

export default function StudyPlannerPanel({ subjects }: StudyPlannerPanelProps) {
  const { goal, priorities, schedule, pace, setTargetDate, setDailyHours, setPriority } = useStudyPlanning(subjects);

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
            Planejamento
          </p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Organize seus Estudos
          </h2>
        </div>
      </div>

      {/* Panel body - single scrollable view */}
      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>

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

        {/* Pace indicator */}
        <PaceIndicatorCard pace={pace} />

        {/* Goal config - always visible */}
        <div>
          <SectionHeader title="Quando é sua prova?" subtitle="Configure a data e quanto tempo você tem para estudar" />
          <div style={{ marginTop: '0.75rem' }}>
            <GoalConfigSection
              goal={goal}
              onGoalChange={g => {
                setTargetDate(g.targetDate);
                g.dailyHours.forEach((h, i) => setDailyHours(i, h));
              }}
            />
          </div>
        </div>

        {/* Priority config - always visible */}
        <div>
          <SectionHeader title="Prioridade das Matérias" subtitle="Quais matérias você quer focar mais?" />
          <div style={{ marginTop: '0.75rem' }}>
            <PriorityConfigSection
              subjects={subjects}
              priorities={priorities}
              onPriorityChange={setPriority}
            />
          </div>
        </div>

        {/* Schedule - always visible */}
        <div>
          <SectionHeader title="Seu Cronograma da Semana" subtitle="Veja como suas horas serão distribuídas" />
          <div style={{ marginTop: '1rem' }}>
            <WeeklyScheduleGrid schedule={schedule} />
          </div>
        </div>
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
