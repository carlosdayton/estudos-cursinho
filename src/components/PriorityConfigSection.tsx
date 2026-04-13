import type { Subject } from '../utils/studyLogic';
import type { SubjectPriority, SubjectPriorityMap, PriorityLevel, DifficultyLevel } from '../utils/plannerTypes';
import { makeDefaultSubjectPriority } from '../utils/plannerTypes';

interface PriorityConfigSectionProps {
  subjects: Subject[];
  priorities: SubjectPriorityMap;
  onPriorityChange: (subjectId: string, patch: Partial<SubjectPriority>) => void;
}

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string; color: string }[] = [
  { value: 'baixa', label: 'Baixa', color: '#4ade80' },
  { value: 'média', label: 'Média', color: '#fbbf24' },
  { value: 'alta',  label: 'Alta',  color: '#f87171' },
];

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'fácil',  label: 'Fácil',  color: '#4ade80' },
  { value: 'médio',  label: 'Médio',  color: '#fbbf24' },
  { value: 'difícil', label: 'Difícil', color: '#f87171' },
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
        const priorityCfg = PRIORITY_OPTIONS.find(o => o.value === p.priority)!;

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 120px', minWidth: 0 }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: subject.color, flexShrink: 0,
                boxShadow: `0 0 8px ${subject.color}88`,
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subject.name}
              </span>
              {/* Priority badge */}
              <span style={{
                fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: priorityCfg.color,
                background: `${priorityCfg.color}18`,
                border: `1px solid ${priorityCfg.color}33`,
                borderRadius: '6px', padding: '2px 6px', flexShrink: 0,
              }}>
                {priorityCfg.label}
              </span>
            </div>

            {/* Priority selector */}
            <SegmentedControl
              label="Prioridade"
              options={PRIORITY_OPTIONS}
              value={p.priority}
              onChange={v => onPriorityChange(subject.id, { priority: v as PriorityLevel })}
            />

            {/* Difficulty selector */}
            <SegmentedControl
              label="Dificuldade"
              options={DIFFICULTY_OPTIONS}
              value={p.difficulty}
              onChange={v => onPriorityChange(subject.id, { difficulty: v as DifficultyLevel })}
            />
          </div>
        );
      })}
    </div>
  );
}

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; color: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
        {options.map(opt => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              aria-label={`${label}: ${opt.label}`}
              style={{
                padding:      '3px 8px',
                borderRadius: '6px',
                border:       'none',
                background:   active ? `${opt.color}22` : 'transparent',
                color:        active ? opt.color : 'rgba(255,255,255,0.3)',
                fontSize:     '10px',
                fontWeight:   active ? 800 : 600,
                fontFamily:   'Lexend, sans-serif',
                cursor:       'pointer',
                transition:   'all 0.15s',
                outline:      active ? `1px solid ${opt.color}44` : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
