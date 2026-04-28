import { useState } from 'react';
import { Calendar, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudyGoal } from '../utils/plannerTypes';
import { clampHours, daysUntil, weeklyTotal } from '../utils/plannerEngine';

interface GoalConfigSectionProps {
  goal: StudyGoal;
  onGoalChange: (goal: StudyGoal) => void;
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function GoalConfigSection({ goal, onGoalChange }: GoalConfigSectionProps) {
  const [clampWarning, setClampWarning] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const days = daysUntil(goal.targetDate);
  const isExpired = days <= 0;
  const total = weeklyTotal(goal.dailyHours);

  const urgency = isExpired ? 'rgba(255,255,255,0.3)' : days <= 30 ? '#f87171' : days <= 90 ? '#fbbf24' : '#818cf8';

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    onGoalChange({ ...goal, targetDate: e.target.value });
  }

  function handleWeeklyTotalChange(raw: string) {
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) return;
    
    // Distribui as horas proporcionalmente pelos dias úteis (seg-sex: 2h, sáb: 3h, dom: 0h)
    const defaultPattern = [0, 2, 2, 2, 2, 2, 3]; // dom, seg, ter, qua, qui, sex, sáb
    const defaultTotal = defaultPattern.reduce((a, b) => a + b, 0); // 13h
    
    const newHours = defaultPattern.map(h => {
      const proportion = h / defaultTotal;
      return clampHours(Math.round(parsed * proportion * 10) / 10);
    });
    
    onGoalChange({ ...goal, dailyHours: newHours });
  }

  function handleHoursChange(dayIndex: number, raw: string) {
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) return;
    const clamped = clampHours(parsed);
    if (clamped !== parsed) {
      setClampWarning(dayIndex);
      setTimeout(() => setClampWarning(null), 2000);
    }
    const newHours = [...goal.dailyHours];
    newHours[dayIndex] = clamped;
    onGoalChange({ ...goal, dailyHours: newHours });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Data-alvo */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Calendar size={14} style={{ color: urgency }} />
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
            Data da Prova
          </span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="date"
            value={goal.targetDate}
            onChange={handleDateChange}
            aria-label="Data da prova"
            style={{
              flex: 1,
              background:   'rgba(255,255,255,0.05)',
              border:       `1px solid ${urgency}44`,
              borderRadius: '12px',
              padding:      '0.6rem 0.75rem',
              color:        '#fff',
              fontSize:     '0.9rem',
              fontFamily:   'Lexend, sans-serif',
              outline:      'none',
              colorScheme:  'dark',
            }}
          />
          <div style={{
            background:   `${urgency}15`,
            border:       `1px solid ${urgency}33`,
            borderRadius: '12px',
            padding:      '0.5rem 0.75rem',
            textAlign:    'center',
            minWidth:     '72px',
          }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 900, color: urgency, margin: 0, lineHeight: 1 }}>
              {isExpired ? '—' : days}
            </p>
            <p style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              {isExpired ? 'expirado' : 'dias'}
            </p>
          </div>
        </div>
        {isExpired && (
          <p style={{ fontSize: '11px', color: '#f87171', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> A data da prova já passou ou é hoje.
          </p>
        )}
      </div>

      {/* Horas por semana - simplificado */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Clock size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
            Quantas horas você pode estudar por semana?
          </span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="number"
            min={0}
            max={84}
            step={1}
            value={total}
            onChange={e => handleWeeklyTotalChange(e.target.value)}
            aria-label="Horas totais por semana"
            style={{
              flex: 1,
              background:   'rgba(255,255,255,0.05)',
              border:       `1px solid ${total > 0 ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '12px',
              padding:      '0.6rem 0.75rem',
              color:        total > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize:     '1rem',
              fontWeight:   700,
              fontFamily:   'Lexend, sans-serif',
              outline:      'none',
              transition:   'border-color 0.2s',
            }}
          />
          <div style={{
            background:   'rgba(129,140,248,0.15)',
            border:       '1px solid rgba(129,140,248,0.3)',
            borderRadius: '12px',
            padding:      '0.5rem 0.75rem',
            textAlign:    'center',
            minWidth:     '72px',
          }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 900, color: '#818cf8', margin: 0, lineHeight: 1 }}>
              {total}h
            </p>
            <p style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              semana
            </p>
          </div>
        </div>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '6px', fontStyle: 'italic' }}>
          As horas serão distribuídas automaticamente durante a semana
        </p>

        {/* Botão para mostrar detalhes avançados */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'Lexend, sans-serif',
            cursor: 'pointer',
            padding: '0.4rem 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.div>
          {showAdvanced ? 'Ocultar detalhes por dia' : 'Ajustar horas por dia'}
        </button>

        {/* Horas por dia - avançado (colapsável) */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
                {DAY_LABELS.map((label, i) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {label}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      step={0.5}
                      value={goal.dailyHours[i]}
                      onChange={e => handleHoursChange(i, e.target.value)}
                      aria-label={`Horas de estudo na ${label}`}
                      style={{
                        width:        '100%',
                        background:   clampWarning === i ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.05)',
                        border:       `1px solid ${clampWarning === i ? 'rgba(248,113,113,0.5)' : goal.dailyHours[i] > 0 ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '10px',
                        padding:      '0.4rem 0.3rem',
                        color:        goal.dailyHours[i] > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                        fontSize:     '0.85rem',
                        fontWeight:   700,
                        fontFamily:   'Lexend, sans-serif',
                        textAlign:    'center',
                        outline:      'none',
                        transition:   'border-color 0.2s, background 0.2s',
                      }}
                    />
                    {clampWarning === i && (
                      <span style={{ fontSize: '8px', color: '#f87171', fontWeight: 700 }}>máx 12h</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
