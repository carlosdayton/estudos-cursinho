import { motion } from 'framer-motion';
import { CalendarDays, Coffee } from 'lucide-react';
import type { WeeklySchedule, DayPlan } from '../utils/plannerTypes';

interface WeeklyScheduleGridProps {
  schedule: WeeklySchedule;
}

const DAY_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function WeeklyScheduleGrid({ schedule }: WeeklyScheduleGridProps) {
  const hasAnyAllocation = schedule.some(d => d.allocations.length > 0);

  if (!hasAnyAllocation) {
    return (
      <div style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        border: '1px dashed rgba(255,255,255,0.1)',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <CalendarDays size={32} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 0.75rem' }} />
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>
          Nenhuma alocação gerada
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
          Configure as horas diárias e adicione matérias com tópicos pendentes.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))',
        gap: '0.5rem',
        minWidth: '700px',
      }}>
        {schedule.map((day, i) => (
          <DayColumn key={day.dayIndex} day={day} abbr={DAY_ABBR[i]} index={i} />
        ))}
      </div>
    </div>
  );
}

function DayColumn({ day, abbr, index }: { day: DayPlan; abbr: string; index: number }) {
  const isRestDay = day.availableHours === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      style={{
        background:           isRestDay ? 'rgba(255,255,255,0.02)' : 'rgba(30,41,59,0.4)',
        backdropFilter:       'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border:               `1px solid ${isRestDay ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius:         '16px',
        padding:              '0.75rem',
        display:              'flex',
        flexDirection:        'column',
        gap:                  '0.5rem',
        minHeight:            '140px',
      }}
    >
      {/* Day header */}
      <div style={{ textAlign: 'center', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: isRestDay ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', margin: 0 }}>
          {abbr}
        </p>
        {!isRestDay && (
          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', margin: 0, marginTop: '2px' }}>
            {day.availableHours}h
          </p>
        )}
      </div>

      {/* Rest day */}
      {isRestDay && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Coffee size={16} style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Folga</p>
        </div>
      )}

      {/* Allocations */}
      {!isRestDay && day.allocations.map(alloc => (
        <motion.div
          key={alloc.subjectId}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background:   `${alloc.color}22`,
            border:       `1px solid ${alloc.color}44`,
            borderRadius: '10px',
            padding:      '0.4rem 0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: alloc.color, flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {alloc.subjectName}
            </p>
          </div>
          <p style={{ fontSize: '9px', color: alloc.color, fontWeight: 700, margin: 0, paddingLeft: '11px' }}>
            {alloc.hours}h
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
