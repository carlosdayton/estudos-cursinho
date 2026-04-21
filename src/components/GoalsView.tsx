import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Trophy, Flame, CheckCircle2, BookOpen, Timer, BarChart3, RefreshCw } from 'lucide-react';
import { useGoals, getMondayOfWeek, type WeeklyGoal } from '../hooks/useGoals';
import { useSubjects } from '../hooks/useSubjects';
import { useSimulados } from '../hooks/useSimulados';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useRevisions } from '../hooks/useRevisions';

const ACCENT = '#fb923c';

const GOAL_TYPES: { value: WeeklyGoal['type']; label: string; icon: React.ReactNode; unit: string }[] = [
  { value: 'topics', label: 'Tópicos estudados', icon: <BookOpen size={16} />, unit: 'tópicos' },
  { value: 'pomodoros', label: 'Sessões Pomodoro', icon: <Timer size={16} />, unit: 'sessões' },
  { value: 'simulados', label: 'Simulados realizados', icon: <BarChart3 size={16} />, unit: 'simulados' },
  { value: 'revisoes', label: 'Revisões feitas', icon: <RefreshCw size={16} />, unit: 'revisões' },
];

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const particles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#fb923c', '#e879f9', '#4ade80', '#fbbf24', '#60a5fa', '#f87171'][i % 6],
    delay: Math.random() * 0.4,
    size: 6 + Math.random() * 8,
  })), []);

  if (!active) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: '-10px', opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: 720 }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: 'easeIn' }}
          style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: '2px', background: p.color }}
        />
      ))}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function GoalCard({ goal: _goal, progress, target, unit, label, icon, subjectName, onDelete }: {
  goal: WeeklyGoal;
  progress: number;
  target: number;
  unit: string;
  label: string;
  icon: React.ReactNode;
  subjectName?: string;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.min(100, Math.round((progress / target) * 100));
  const done = pct >= 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: done ? 'rgba(74,222,128,0.06)' : 'rgba(30,41,59,0.4)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${done ? 'rgba(74,222,128,0.25)' : hovered ? ACCENT + '44' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '20px', padding: '1.25rem',
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {done && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: done ? 'rgba(74,222,128,0.15)' : `${ACCENT}18`, border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : ACCENT + '33'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#4ade80' : ACCENT }}>
            {done ? <CheckCircle2 size={16} /> : icon}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>{label}</p>
            {subjectName && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{subjectName}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: done ? '#4ade80' : ACCENT }}>{progress}/{target} {unit}</span>
          <button
            onClick={onDelete}
            style={{ width: '26px', height: '26px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', opacity: hovered ? 1 : 0, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'circOut' }}
          style={{ height: '100%', background: done ? '#4ade80' : ACCENT, borderRadius: '99px', boxShadow: done ? '0 0 10px rgba(74,222,128,0.5)' : `0 0 10px ${ACCENT}66` }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{pct}% concluído</span>
        {done && <span style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80' }}>✓ Meta batida!</span>}
      </div>
    </motion.div>
  );
}

// ─── Add goal form ────────────────────────────────────────────────────────────
function AddGoalForm({ onAdd, onClose, subjects }: { onAdd: (data: Omit<WeeklyGoal, 'id' | 'createdAt' | 'weekStart'>) => void; onClose: () => void; subjects: { id: string; name: string }[] }) {
  const [type, setType] = useState<WeeklyGoal['type']>('topics');
  const [subjectId, setSubjectId] = useState<string>('');
  const [target, setTarget] = useState(5);

  const typeInfo = GOAL_TYPES.find(t => t.value === type)!;

  const handleAdd = () => {
    onAdd({ type, subjectId: subjectId || undefined, target });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}33`, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Nova Meta Semanal</p>

      {/* Type */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {GOAL_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', border: `1px solid ${type === t.value ? ACCENT + '66' : 'rgba(255,255,255,0.1)'}`, background: type === t.value ? `${ACCENT}18` : 'rgba(255,255,255,0.04)', color: type === t.value ? ACCENT : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Subject (optional, only for topics) */}
        {type === 'topics' && (
          <select
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.625rem 1rem', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', cursor: 'pointer' }}
          >
            <option value="" style={{ background: '#0f172a', color: '#fff' }}>Todas as matérias</option>
            {subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#0f172a', color: '#fff' }}>{s.name}</option>)}
          </select>
        )}

        {/* Target */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Meta:</span>
          <button onClick={() => setTarget(t => Math.max(1, t - 1))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: ACCENT, minWidth: '32px', textAlign: 'center' }}>{target}</span>
          <button onClick={() => setTarget(t => t + 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{typeInfo.unit}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>Cancelar</button>
        <button onClick={handleAdd} style={{ padding: '0.625rem 1.5rem', borderRadius: '10px', border: 'none', background: ACCENT, color: '#020617', fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', boxShadow: `0 4px 16px ${ACCENT}44` }}>Adicionar meta</button>
      </div>
    </motion.div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function GoalsView() {
  const { currentWeekGoals, addGoal, deleteGoal } = useGoals();
  const { subjects, updateTopic } = useSubjects();
  const { simulados } = useSimulados();
  const [pomodoroSessions] = useLocalStorage<number>('pomodoro-sessions-completed', 0);
  const { reviewsDue: _reviewsDue } = useRevisions(subjects, updateTopic);
  const [completedRevisions] = useLocalStorage<number>('enem-completed-revisions-count', 0);

  const [showAdd, setShowAdd] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [celebratedGoals, setCelebratedGoals] = useLocalStorage<string[]>('enem-celebrated-goals', []);

  // Calculate current week's progress for each goal type
  const weekStart = getMondayOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const completedTopicsThisWeek = useMemo(() => {
    return subjects.reduce((acc, s) => {
      return acc + s.topics.filter(t => {
        if (!t.completedAt) return false;
        const d = new Date(t.completedAt);
        return d >= new Date(weekStart) && d < weekEnd;
      }).length;
    }, 0);
  }, [subjects, weekStart]);

  const simuladosThisWeek = useMemo(() => {
    return simulados.filter(s => {
      const d = new Date(s.date);
      return d >= new Date(weekStart) && d < weekEnd;
    }).length;
  }, [simulados, weekStart]);

  function getProgress(goal: WeeklyGoal): number {
    switch (goal.type) {
      case 'topics': {
        if (!goal.subjectId) return completedTopicsThisWeek;
        return subjects.find(s => s.id === goal.subjectId)?.topics.filter(t => {
          if (!t.completedAt) return false;
          const d = new Date(t.completedAt);
          return d >= new Date(weekStart) && d < weekEnd;
        }).length ?? 0;
      }
      case 'pomodoros': return pomodoroSessions;
      case 'simulados': return simuladosThisWeek;
      case 'revisoes': return completedRevisions;
      default: return 0;
    }
  }

  // Detect newly completed goals and trigger confetti
  useEffect(() => {
    for (const goal of currentWeekGoals) {
      const progress = getProgress(goal);
      if (progress >= goal.target && !celebratedGoals.includes(goal.id)) {
        setConfetti(true);
        setCelebratedGoals(prev => [...prev, goal.id]);
        setTimeout(() => setConfetti(false), 2500);
        break;
      }
    }
  }, [currentWeekGoals, celebratedGoals]);

  const allDone = currentWeekGoals.length > 0 && currentWeekGoals.every(g => getProgress(g) >= g.target);

  const SUGGESTIONS = [
    { type: 'topics' as const, target: 10, label: '10 tópicos estudados' },
    { type: 'pomodoros' as const, target: 15, label: '15 sessões Pomodoro' },
    { type: 'simulados' as const, target: 1, label: '1 simulado realizado' },
    { type: 'revisoes' as const, target: 5, label: '5 revisões feitas' },
  ];

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 3rem) clamp(1rem, 5vw, 3.5rem) clamp(4rem, 10vw, 8rem)', width: '100%', boxSizing: 'border-box' }}>
      <Confetti active={confetti} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <Target size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Metas Semanais</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Semana de {new Date(weekStart).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {allDone && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '10px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '12px', fontWeight: 700 }}>
              <Trophy size={14} /> Semana perfeita!
            </motion.div>
          )}
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer', background: ACCENT, color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', boxShadow: `0 4px 20px ${ACCENT}44` }}
          >
            <Plus size={18} strokeWidth={3} /> Nova Meta
          </button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <AddGoalForm
            onAdd={addGoal}
            onClose={() => setShowAdd(false)}
            subjects={subjects}
          />
        )}
      </AnimatePresence>

      {/* Goals grid */}
      {currentWeekGoals.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed rgba(251,146,60,0.2)', borderRadius: '24px', background: 'rgba(251,146,60,0.03)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 1.25rem', background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <Target size={28} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Nenhuma meta para esta semana</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginBottom: '2rem' }}>Defina metas e acompanhe seu progresso semanal</p>

          {/* Suggestions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s.type}
                onClick={() => { addGoal({ type: s.type, target: s.target }); }}
                style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${ACCENT}33`, background: `${ACCENT}10`, color: ACCENT, fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}
              >
                + {s.label}
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <AnimatePresence>
            {currentWeekGoals.map(goal => {
              const typeInfo = GOAL_TYPES.find(t => t.value === goal.type)!;
              const subject = subjects.find(s => s.id === goal.subjectId);
              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={getProgress(goal)}
                  target={goal.target}
                  unit={typeInfo.unit}
                  label={typeInfo.label}
                  icon={typeInfo.icon}
                  subjectName={subject?.name}
                  onDelete={() => deleteGoal(goal.id)}
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Streak info */}
      {currentWeekGoals.length > 0 && (
        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
          <Flame size={18} color={ACCENT} />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Complete todas as metas desta semana para manter sua sequência!
          </p>
        </div>
      )}
    </div>
  );
}
