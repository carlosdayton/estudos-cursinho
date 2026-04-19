import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock, Sparkles, Download, Trash2,
  ChevronDown, ChevronUp, X, Check, Plus
} from 'lucide-react';
import { useSchedule, DAY_NAMES, getVisibleHours } from '../hooks/useSchedule';
import { useSubjects } from '../hooks/useSubjects';

const ACCENT = '#a3e635';
const DAYS_ALL = [0, 1, 2, 3, 4, 5, 6];

// ─── Subject picker popover ───────────────────────────────────────────────────
interface PickerProps {
  subjects: { id: string; name: string; color: string }[];
  current: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

function SubjectPicker({ subjects, current, onSelect, onClose, anchorRef }: PickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute', top: '100%', left: 0, marginTop: '4px',
        background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px',
        padding: '0.5rem', zIndex: 200,
        minWidth: '160px', maxWidth: '200px',
        maxHeight: '280px', overflowY: 'auto',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* Clear option */}
      <button
        onClick={() => { onSelect(null); onClose(); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          background: current === null ? 'rgba(255,255,255,0.06)' : 'transparent',
          color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600,
          fontFamily: 'Lexend, sans-serif', transition: 'all 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = current === null ? 'rgba(255,255,255,0.06)' : 'transparent')}
      >
        <X size={12} /> Limpar
      </button>

      {/* Subject options */}
      {subjects.map(s => (
        <button
          key={s.id}
          onClick={() => { onSelect(s.id); onClose(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: current === s.id ? `${s.color}18` : 'transparent',
            color: current === s.id ? s.color : 'rgba(255,255,255,0.7)',
            fontSize: '12px', fontWeight: current === s.id ? 700 : 500,
            fontFamily: 'Lexend, sans-serif', transition: 'all 0.1s',
            textAlign: 'left',
          }}
          onMouseEnter={e => { if (current !== s.id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { if (current !== s.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
          {current === s.id && <Check size={11} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
        </button>
      ))}
    </motion.div>
  );
}

// ─── Single cell ──────────────────────────────────────────────────────────────
interface CellProps {
  day: number;
  hour: number;
  subjectId: string | null;
  subjects: { id: string; name: string; color: string }[];
  onSet: (subjectId: string | null) => void;
  disabled?: boolean;
  compact?: boolean;
}

function ScheduleCell({ day, hour, subjectId, subjects, onSet, disabled, compact }: CellProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const subject = subjects.find(s => s.id === subjectId);
  const cellH = compact ? '28px' : '52px';

  if (disabled) {
    return (
      <div style={{
        minHeight: cellH, borderRadius: compact ? '6px' : '10px',
        background: 'rgba(255,255,255,0.01)',
        border: '1px solid rgba(255,255,255,0.03)',
      }} />
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        title={subject ? subject.name : 'Clique para adicionar'}
        style={{
          width: '100%', minHeight: cellH, borderRadius: compact ? '6px' : '10px', border: 'none', cursor: 'pointer',
          background: subject ? `${subject.color}18` : 'rgba(255,255,255,0.03)',
          outline: `1px solid ${subject ? subject.color + '33' : 'rgba(255,255,255,0.06)'}`,
          display: 'flex', flexDirection: compact ? 'row' : 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: compact ? '0 4px' : '6px 4px', gap: '3px',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          if (!subject) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
        }}
        onMouseLeave={e => {
          if (!subject) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
        }}
      >
        {subject ? (
          <>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: subject.color, flexShrink: 0 }} />
            {!compact && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: subject.color, lineHeight: 1.2, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', padding: '0 4px' }}>
                {subject.name}
              </span>
            )}
          </>
        ) : (
          <Plus size={compact ? 9 : 12} color="rgba(255,255,255,0.12)" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <SubjectPicker
            subjects={subjects}
            current={subjectId}
            onSelect={onSet}
            onClose={() => setOpen(false)}
            anchorRef={btnRef as React.RefObject<HTMLElement>}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Auto-generate config modal ───────────────────────────────────────────────
interface AutoConfigProps {
  config: ReturnType<typeof useSchedule>['config'];
  setConfig: ReturnType<typeof useSchedule>['setConfig'];
  subjects: { id: string; name: string; color: string }[];
  onGenerate: () => void;
  onClose: () => void;
}

function AutoConfigModal({ config, setConfig, subjects, onGenerate, onClose }: AutoConfigProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(6px)', zIndex: 9000 }}
      />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9001, width: '100%', maxWidth: '520px', padding: '0 1rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          style={{ background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${ACCENT}88, transparent)`, borderRadius: '24px 24px 0 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={18} color={ACCENT} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0 }}>Gerar Cronograma Automático</h3>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}><X size={18} /></button>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
            O cronograma será gerado automaticamente com base no progresso de cada matéria. Matérias com menos progresso recebem mais tempo. Você pode editar qualquer célula depois.
          </p>

          {/* Hour range */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>Início do dia</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setConfig({ ...config, startHour: Math.max(0, (config.startHour ?? 6) - 1) })} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: ACCENT, minWidth: '44px', textAlign: 'center' }}>{config.startHour ?? 6}h</span>
                <button onClick={() => setConfig({ ...config, startHour: Math.min((config.endHour ?? 23) - 1, (config.startHour ?? 6) + 1) })} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>Fim do dia</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setConfig({ ...config, endHour: Math.max((config.startHour ?? 6) + 1, (config.endHour ?? 23) - 1) })} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: ACCENT, minWidth: '44px', textAlign: 'center' }}>{config.endHour ?? 23}h</span>
                <button onClick={() => setConfig({ ...config, endHour: Math.min(23, (config.endHour ?? 23) + 1) })} style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
          </div>

          {/* Days */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>Dias disponíveis</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DAYS_ALL.map(d => {
                const sel = config.availableDays.includes(d);
                return (
                  <button key={d} onClick={() => {
                    const next = sel ? config.availableDays.filter(x => x !== d) : [...config.availableDays, d].sort((a, b) => a - b);
                    setConfig({ ...config, availableDays: next });
                  }} style={{ padding: '6px 12px', borderRadius: '10px', border: `1px solid ${sel ? ACCENT + '66' : 'rgba(255,255,255,0.1)'}`, background: sel ? `${ACCENT}18` : 'rgba(255,255,255,0.04)', color: sel ? ACCENT : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {DAY_NAMES[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority subjects */}
          {subjects.length > 0 && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>Matérias prioritárias <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(recebem 50% mais tempo)</span></label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {subjects.map(s => {
                  const sel = config.prioritySubjectIds.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => {
                      const next = sel ? config.prioritySubjectIds.filter(x => x !== s.id) : [...config.prioritySubjectIds, s.id];
                      setConfig({ ...config, prioritySubjectIds: next });
                    }} style={{ padding: '6px 12px', borderRadius: '10px', border: `1px solid ${sel ? s.color + '66' : 'rgba(255,255,255,0.1)'}`, background: sel ? `${s.color}18` : 'rgba(255,255,255,0.04)', color: sel ? s.color : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={onClose} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={() => { onGenerate(); onClose(); }} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: ACCENT, color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', boxShadow: `0 4px 20px ${ACCENT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={16} /> Gerar cronograma
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function ScheduleView() {
  const { config, setConfig, cells, setCell, clearAll, generateAuto, exportAsText } = useSchedule();
  const { subjects } = useSubjects();
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getCellSubject = (day: number, hour: number) =>
    cells.find(c => c.day === day && c.hour === hour)?.subjectId ?? null;

  const filledCount = cells.filter(c => c.subjectId).length;

  const handleExport = () => {
    const text = exportAsText(subjects);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cronograma-estudos.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const startHour = config.startHour ?? 6;
  const endHour = config.endHour ?? 23;
  const visibleHours = getVisibleHours(startHour, endHour);
  // Compact mode: show all hours but small cells; expanded: full cells with labels
  const compact = !expanded;

  return (
    <div style={{ padding: '3rem 3.5rem 8rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <CalendarClock size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Cronograma</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              {filledCount > 0 ? `${filledCount} slot${filledCount !== 1 ? 's' : ''} preenchido${filledCount !== 1 ? 's' : ''}` : 'Clique em qualquer célula para adicionar uma matéria'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {filledCount > 0 && (
            <>
              <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.625rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>
                <Download size={16} /> Exportar
              </button>
              <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.625rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.06)', color: '#f87171', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>
                <Trash2 size={16} /> Limpar tudo
              </button>
            </>
          )}
          <button
            onClick={() => setShowAutoModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.625rem 1.25rem', borderRadius: '12px', border: 'none', background: ACCENT, color: '#020617', fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', boxShadow: `0 4px 16px ${ACCENT}44` }}
          >
            <Sparkles size={16} /> Gerar automático
          </button>
        </div>
      </div>

      {/* Legend */}
      {subjects.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {subjects.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: s.color }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {subjects.length === 0 ? (
        <div style={{ padding: '5rem 2rem', textAlign: 'center', border: `1px dashed ${ACCENT}33`, borderRadius: '24px', background: `${ACCENT}04` }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 1.25rem', background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <CalendarClock size={28} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Adicione matérias primeiro</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>Vá para a aba "Matérias" e cadastre suas matérias de estudo.</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `${compact ? '32px' : '48px'} repeat(7, 1fr)`,
            gap: compact ? '3px' : '6px',
            minWidth: '640px',
          }}>
            {/* Header row */}
            <div />
            {DAYS_ALL.map(d => {
              const isActive = config.availableDays.includes(d);
              return (
                <div key={d} style={{ textAlign: 'center', padding: compact ? '4px 2px' : '8px 4px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}>
                  {DAY_NAMES[d]}
                </div>
              );
            })}

            {/* Hour rows */}
            {visibleHours.map(h => (
              <>
                <div key={`h-${h}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: compact ? '4px' : '8px', fontSize: compact ? '9px' : '11px', fontWeight: 700, color: 'rgba(255,255,255,0.25)' }}>
                  {h}h
                </div>
                {DAYS_ALL.map(d => {
                  const isActive = config.availableDays.includes(d);
                  return (
                    <ScheduleCell
                      key={`${d}-${h}`}
                      day={d}
                      hour={h}
                      subjectId={getCellSubject(d, h)}
                      subjects={subjects}
                      onSet={id => setCell(d, h, id)}
                      disabled={!isActive}
                      compact={compact}
                    />
                  );
                })}
              </>
            ))}
          </div>

          {/* Expand / collapse button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 14px', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: 700,
                fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}
            >
              {expanded ? <><ChevronUp size={12} /> Recolher</> : <><ChevronDown size={12} /> Ver mais</>}
            </button>
          </div>

          {/* Hours control — only visible when expanded */}
          {expanded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>De:</span>
              <button
                onClick={() => setConfig({ ...config, startHour: Math.max(0, startHour - 1) })}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: '14px', fontWeight: 900, color: ACCENT, minWidth: '32px', textAlign: 'center' }}>{startHour}h</span>
              <button
                onClick={() => setConfig({ ...config, startHour: Math.min(endHour - 1, startHour + 1) })}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>

              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Até:</span>
              <button
                onClick={() => setConfig({ ...config, endHour: Math.max(startHour + 1, endHour - 1) })}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: '14px', fontWeight: 900, color: ACCENT, minWidth: '32px', textAlign: 'center' }}>{endHour}h</span>
              <button
                onClick={() => setConfig({ ...config, endHour: Math.min(23, endHour + 1) })}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>({visibleHours.length}h visíveis)</span>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {DAYS_ALL.map(d => {
                  const sel = config.availableDays.includes(d);
                  return (
                    <button key={d} onClick={() => {
                      const next = sel ? config.availableDays.filter(x => x !== d) : [...config.availableDays, d].sort((a, b) => a - b);
                      setConfig({ ...config, availableDays: next });
                    }} style={{ padding: '4px 10px', borderRadius: '8px', border: `1px solid ${sel ? ACCENT + '55' : 'rgba(255,255,255,0.08)'}`, background: sel ? `${ACCENT}15` : 'rgba(255,255,255,0.03)', color: sel ? ACCENT : 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {DAY_NAMES[d]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto config modal */}
      <AnimatePresence>
        {showAutoModal && (
          <AutoConfigModal
            config={config}
            setConfig={setConfig}
            subjects={subjects}
            onGenerate={() => generateAuto(subjects)}
            onClose={() => setShowAutoModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
