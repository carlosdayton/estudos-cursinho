import type { Subject } from '../utils/studyLogic';
import type { SubjectPriority, SubjectPriorityMap, PriorityLevel } from '../utils/plannerTypes';
import { makeDefaultSubjectPriority } from '../utils/plannerTypes';

interface PriorityConfigSectionProps {
  subjects: Subject[];
  priorities: SubjectPriorityMap;
  onPriorityChange: (subjectId: string, patch: Partial<SubjectPriority>) => void;
}

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string; color: string; description: string }[] = [
  { value: 'baixa', label: 'Normal', color: '#4ade80', description: 'Estudar menos' },
  { value: 'média', label: 'Importante', color: '#fbbf24', description: 'Estudar mais' },
  { value: 'alta',  label: 'Prioritária',  color: '#f87171', description: 'Focar bastante' },
];

export default function PriorityConfigSection({ subjects, priorities, onPriorityChange }: PriorityConfigSectionProps) {
  if (subjects.length === 0) {
    return (
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
        Nenhuma matéria cadastrada.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {subjects.map(subject => {
        const p = priorities[subject.id] ?? makeDefaultSubjectPriority(subject.id);

        return (
          <div
            key={subject.id}
            style={{
              background:   'rgba(255,255,255,0.03)',
              border:       `1px solid ${subject.color}22`,
              borderRadius: '14px',
              padding:      '0.75rem 1rem',
              display:      'flex',
              alignItems:   'center',
              gap:          '0.75rem',
              flexWrap:     'wrap',
            }}
          >
            {/* Subject color dot + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 140px', minWidth: 0 }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: subject.color, flexShrink: 0,
                boxShadow: `0 0 8px ${subject.color}88`,
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subject.name}
              </span>
            </div>

            {/* Priority selector - simplified */}
            <div style={{ display: 'flex', gap: '0.4rem', flex: '0 0 auto' }}>
              {PRIORITY_OPTIONS.map(opt => {
                const active = opt.value === p.priority;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onPriorityChange(subject.id, { priority: opt.value as PriorityLevel })}
                    aria-pressed={active}
                    aria-label={`${opt.label}: ${opt.description}`}
                    title={opt.description}
                    style={{
                      padding:      '0.5rem 0.9rem',
                      borderRadius: '10px',
                      border:       'none',
                      background:   active ? `${opt.color}22` : 'rgba(255,255,255,0.05)',
                      color:        active ? opt.color : 'rgba(255,255,255,0.3)',
                      fontSize:     '11px',
                      fontWeight:   active ? 800 : 600,
                      fontFamily:   'Lexend, sans-serif',
                      cursor:       'pointer',
                      transition:   'all 0.15s',
                      outline:      active ? `1px solid ${opt.color}44` : 'none',
                      whiteSpace:   'nowrap',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
