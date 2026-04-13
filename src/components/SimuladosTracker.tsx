import { useState } from 'react';
import { useSimulados } from '../hooks/useSimulados';
import { useToastContext } from '../context/ToastContext';
import { ConfirmModal } from './ConfirmModal';
import type { SimuladoScores } from '../utils/studyLogic';
import { Plus, BarChart3, TrendingUp, X, Save, ArrowUp, ArrowDown, ArrowRight, Trophy, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AREA_LABELS: Record<keyof SimuladoScores, string> = {
  linguagens: 'Linguagens',
  humanas: 'Humanas',
  natureza: 'Natureza',
  matematica: 'Matemática',
  redacao: 'Redação',
};

const AREA_COLORS: Record<keyof SimuladoScores, string> = {
  linguagens: '#818cf8',
  humanas: '#f472b6',
  natureza: '#34d399',
  matematica: '#60a5fa',
  redacao: '#fbbf24',
};

function ScoreInput({ label, color, value, onChange }: {
  label: string; color: string; value: number; onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.max(0, Math.min(1000, v));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
      <label style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color }}>
        {label.substring(0, 3)}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${color}33`,
        borderRadius: '10px', overflow: 'hidden',
        minWidth: 0,
      }}>
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          style={{
            width: '28px', height: '38px', border: 'none', cursor: 'pointer', flexShrink: 0,
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', fontFamily: 'Lexend, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = color)}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >−</button>
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(clamp(Number(e.target.value)))}
          placeholder="0"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: '#fff', fontSize: '1rem', fontWeight: 900,
            textAlign: 'center', fontFamily: 'Lexend, sans-serif',
            outline: 'none', padding: '0', minWidth: 0, width: '100%',
          }}
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          style={{
            width: '28px', height: '38px', border: 'none', cursor: 'pointer', flexShrink: 0,
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', fontFamily: 'Lexend, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = color)}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >+</button>
      </div>
    </div>
  );
}

const TREND_CONFIG = {
  up:     { icon: ArrowUp,    color: '#34d399', label: 'Em alta',  bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
  down:   { icon: ArrowDown,  color: '#f87171', label: 'Em queda', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  stable: { icon: ArrowRight, color: '#94a3b8', label: 'Estável',  bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
};

export default function SimuladosTracker() {
  const { simulados, addSimulado, deleteSimulado, averageScore, bestScore, trend } = useSimulados();
  const { showToast } = useToastContext();

  const [showAdd, setShowAdd] = useState(false);
  const [newScores, setNewScores] = useState<SimuladoScores>({
    linguagens: 0, humanas: 0, natureza: 0, matematica: 0, redacao: 0,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    addSimulado(newScores);
    setShowAdd(false);
    setNewScores({ linguagens: 0, humanas: 0, natureza: 0, matematica: 0, redacao: 0 });
    showToast('Simulado adicionado com sucesso!', 'success');
  };

  const requestDelete = (id: string) => { setPendingDeleteId(id); setConfirmOpen(true); };
  const handleConfirmDelete = () => {
    if (pendingDeleteId) { deleteSimulado(pendingDeleteId); showToast('Simulado excluído.', 'info'); }
    setConfirmOpen(false); setPendingDeleteId(null);
  };
  const handleCancelDelete = () => { setConfirmOpen(false); setPendingDeleteId(null); };

  const tc = TREND_CONFIG[trend];
  const TrendIcon = tc.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8',
          }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
              Rastreador de Simulados
            </h3>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              Acompanhe sua evolução
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '0.625rem 1.25rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: '#818cf8', color: '#020617',
            fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(129,140,248,0.4)',
            transition: 'all 0.2s ease', flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={16} strokeWidth={3} />
          Novo Simulado
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: 'rgba(129,140,248,0.05)',
              border: '1px solid rgba(129,140,248,0.2)',
              borderRadius: '20px', padding: '1.5rem',
              overflow: 'hidden',
            }}
          >
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>
              Notas por área
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {(Object.keys(newScores) as (keyof SimuladoScores)[]).map(key => (
                <ScoreInput
                  key={key}
                  label={AREA_LABELS[key]}
                  color={AREA_COLORS[key]}
                  value={newScores[key]}
                  onChange={v => setNewScores({ ...newScores, [key]: v })}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowAdd(false)} style={{
                padding: '0.5rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
              }}>
                Cancelar
              </button>
              <button onClick={handleAdd} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.5rem 1.5rem', borderRadius: '10px', border: 'none',
                background: '#818cf8', color: '#020617',
                fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(129,140,248,0.4)',
              }}>
                <Save size={14} /> Salvar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>

        {/* Stats sidebar — aparece primeiro no mobile */}
        <div style={{
          background: 'rgba(129,140,248,0.05)',
          border: '1px solid rgba(129,140,248,0.15)',
          borderRadius: '20px', padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.75rem',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0, gridColumn: '1 / -1' }}>
            Estatísticas
          </p>

          {/* Average */}
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              Média Geral
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
              {averageScore}
            </p>
          </div>

          {/* Best */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(251,191,36,0.06)', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.15)' }}>
            <Trophy size={18} color="#fbbf24" />
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Melhor</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24', letterSpacing: '-0.02em', margin: 0 }}>{bestScore}</p>
            </div>
          </div>

          {/* Trend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: tc.bg, borderRadius: '12px', border: `1px solid ${tc.border}` }}>
            <Target size={18} color={tc.color} />
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Tendência</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendIcon size={14} color={tc.color} />
                <p style={{ fontSize: '13px', fontWeight: 800, color: tc.color, margin: 0 }}>{tc.label}</p>
              </div>
            </div>
          </div>

          {simulados.length > 0 && (
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.5, gridColumn: '1 / -1' }}>
              Baseado em {simulados.length} simulado{simulados.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Simulados list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {simulados.map(sim => (
            <motion.div
              layout
              key={sim.id}
              style={{
                background: 'rgba(30,41,59,0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Date + total */}
              <div style={{ minWidth: '120px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                  {new Date(sim.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {sim.total}
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>pts</span>
                </p>
              </div>

              {/* Area scores */}
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
                {(Object.entries(sim.scores) as [keyof SimuladoScores, number][]).map(([area, score]) => (
                  <div key={area} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '4px 10px', borderRadius: '8px',
                    background: `${AREA_COLORS[area]}10`,
                    border: `1px solid ${AREA_COLORS[area]}25`,
                    minWidth: '44px',
                  }}>
                    <span style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: AREA_COLORS[area] }}>
                      {area.substring(0, 3)}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{score}</span>
                  </div>
                ))}
              </div>

              {/* Delete */}
              <button
                onClick={() => requestDelete(sim.id)}
                aria-label="Excluir simulado"
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: 'transparent', color: 'rgba(255,255,255,0.2)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)'; }}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}

          {simulados.length === 0 && (
            <div style={{
              padding: '3rem 1rem', textAlign: 'center',
              border: '1px dashed rgba(129,140,248,0.2)', borderRadius: '16px',
              background: 'rgba(129,140,248,0.03)',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 0.75rem',
                background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8',
              }}>
                <TrendingUp size={22} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                Nenhum simulado ainda
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
                Clique em "Novo Simulado" para começar
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message="Tem certeza que deseja excluir este simulado? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
