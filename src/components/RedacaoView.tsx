import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Plus, Trash2, ChevronLeft, CheckCircle2, AlertCircle, FileText, Sparkles, Loader2, Key, X, ThumbsUp, AlertTriangle } from 'lucide-react';
import { useRedacoes, type Redacao } from '../hooks/useRedacoes';
import { useAIEvaluation, type AIFeedback } from '../hooks/useAIEvaluation';
import { ConfirmModal } from './ConfirmModal';

const ACCENT = '#e879f9';

const COMPETENCIAS = [
  { key: 'c1' as const, label: 'C1 — Domínio da Norma Culta', desc: 'Ortografia, acentuação, pontuação e gramática.' },
  { key: 'c2' as const, label: 'C2 — Compreensão da Proposta', desc: 'Entendimento do tema e adequação ao tipo textual.' },
  { key: 'c3' as const, label: 'C3 — Seleção de Argumentos', desc: 'Uso de repertório sociocultural e argumentação.' },
  { key: 'c4' as const, label: 'C4 — Coesão Textual', desc: 'Conectivos, progressão e articulação das ideias.' },
  { key: 'c5' as const, label: 'C5 — Proposta de Intervenção', desc: 'Solução detalhada, viável e respeitosa aos direitos humanos.' },
];

function scoreColor(total: number) {
  if (total >= 700) return '#4ade80';
  if (total >= 500) return '#fbbf24';
  return '#f87171';
}

function wordCount(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function lineCount(text: string) {
  if (!text.trim()) return 0;
  // Approximate: ~10 words per line
  return Math.ceil(wordCount(text) / 10);
}

// ─── Notebook textarea ────────────────────────────────────────────────────────
function NotebookTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{
      position: 'relative',
      background: 'rgba(8,12,28,0.6)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Red margin */}
      <div style={{ position: 'absolute', left: '48px', top: 0, bottom: 0, width: '1px', background: 'rgba(248,113,113,0.35)', zIndex: 1, pointerEvents: 'none' }} />
      {/* Ruled lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(232,121,249,0.08) 31px, rgba(232,121,249,0.08) 32px)', backgroundPosition: '0 16px', zIndex: 0, pointerEvents: 'none' }} />
      {/* Spiral holes */}
      <div style={{ position: 'absolute', left: '14px', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingTop: '16px', paddingBottom: '16px', zIndex: 2, pointerEvents: 'none' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.12)', background: 'rgba(2,6,23,0.8)', flexShrink: 0 }} />
        ))}
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Escreva sua redação aqui..."
        rows={20}
        style={{ position: 'relative', zIndex: 3, width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontFamily: 'Lexend, sans-serif', lineHeight: '32px', resize: 'none', boxSizing: 'border-box', padding: '16px 1.25rem 1.25rem 64px' }}
      />
    </div>
  );
}

// ─── Competência slider ───────────────────────────────────────────────────────
function CompetenciaSlider({ label, desc, value, onChange }: { label: string; desc: string; value: number; onChange: (v: number) => void }) {
  const steps = [0, 40, 80, 120, 160, 200];
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>{label}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{desc}</p>
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: ACCENT, minWidth: '48px', textAlign: 'right' }}>{value}</span>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '0.75rem' }}>
        {steps.map(step => (
          <button
            key={step}
            onClick={() => onChange(step)}
            style={{
              flex: 1, height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: value === step ? ACCENT : value > step ? `${ACCENT}33` : 'rgba(255,255,255,0.05)',
              color: value === step ? '#020617' : 'rgba(255,255,255,0.5)',
              fontSize: '11px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            {step}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AI Feedback panel ────────────────────────────────────────────────────────
function AIFeedbackPanel({ feedback, onApply, onClose }: {
  feedback: AIFeedback;
  onApply: (f: AIFeedback) => void;
  onClose: () => void;
}) {
  const total = feedback.c1 + feedback.c2 + feedback.c3 + feedback.c4 + feedback.c5;
  const color = scoreColor(total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      style={{
        background: 'rgba(10,15,30,0.97)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(232,121,249,0.25)',
        borderRadius: '20px',
        padding: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #e879f9, transparent)', borderRadius: '20px 20px 0 0' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#e879f9" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#e879f9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avaliação da IA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color, letterSpacing: '-0.03em' }}>{total}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>/1000</span>
        </div>
      </div>

      {/* Feedback geral */}
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0, padding: '0.875rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', borderLeft: '3px solid #e879f9' }}>
        {feedback.feedbackGeral}
      </p>

      {/* Scores por competência */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {COMPETENCIAS.map(c => {
          const score = feedback[c.key];
          const fb = feedback[`feedback${c.key.toUpperCase()}` as keyof AIFeedback] as string;
          const pct = (score / 200) * 100;
          const cColor = score >= 160 ? '#4ade80' : score >= 80 ? '#fbbf24' : '#f87171';
          return (
            <div key={c.key} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{c.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: cColor }}>{score}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{ height: '100%', background: cColor, borderRadius: '99px' }}
                />
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>{fb}</p>
            </div>
          );
        })}
      </div>

      {/* Pontos fortes e a melhorar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <ThumbsUp size={13} color="#4ade80" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pontos fortes</span>
          </div>
          {feedback.pontosFortres.map((p, i) => (
            <p key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', lineHeight: 1.4 }}>• {p}</p>
          ))}
        </div>
        <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <AlertTriangle size={13} color="#fbbf24" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em' }}>A melhorar</span>
          </div>
          {feedback.pontosAMelhorar.map((p, i) => (
            <p key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', lineHeight: 1.4 }}>• {p}</p>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => onApply(feedback)}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: '#e879f9', color: '#020617', fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', boxShadow: '0 4px 16px rgba(232,121,249,0.4)' }}
        >
          Aplicar notas automaticamente
        </button>
        <button
          onClick={onClose}
          style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}
        >
          Ignorar
        </button>
      </div>
    </motion.div>
  );
}

// ─── API Key config ───────────────────────────────────────────────────────────
function APIKeyConfig({ apiKey, onSave, onClose }: { apiKey: string; onSave: (k: string) => void; onClose: () => void }) {
  const [value, setValue] = useState(apiKey);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{ background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={16} color="#e879f9" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Chave da API OpenAI</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
          <X size={16} />
        </button>
      </div>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
        Sua chave é salva apenas no seu navegador (localStorage) e nunca enviada para nossos servidores. Obtenha em <span style={{ color: '#e879f9' }}>platform.openai.com</span>
      </p>
      <input
        type="password"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="sk-..."
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>Cancelar</button>
        <button onClick={() => { onSave(value); onClose(); }} style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', border: 'none', background: '#e879f9', color: '#020617', fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>Salvar chave</button>
      </div>
    </motion.div>
  );
}
interface EditorProps {
  initial?: Redacao | null;
  onSave: (data: Omit<Redacao, 'id' | 'createdAt' | 'updatedAt' | 'totalScore'>) => void;
  onClose: () => void;
}

function RedacaoEditor({ initial, onSave, onClose }: EditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [theme, setTheme] = useState(initial?.theme ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [competencias, setCompetencias] = useState(initial?.competencias ?? { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  const { apiKey, setApiKey, isLoading, error, evaluate, clearError } = useAIEvaluation();

  const total = competencias.c1 + competencias.c2 + competencias.c3 + competencias.c4 + competencias.c5;
  const words = wordCount(content);
  const lines = lineCount(content);
  const color = scoreColor(total);

  const setComp = (key: keyof typeof competencias, val: number) => {
    setCompetencias(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, theme, content, competencias });
    onClose();
  };

  const handleAIEvaluate = async () => {
    if (!apiKey.trim()) { setShowKeyConfig(true); return; }
    const result = await evaluate(theme, content);
    if (result) setAiFeedback(result);
  };

  const handleApplyAI = (fb: AIFeedback) => {
    setCompetencias({ c1: fb.c1, c2: fb.c2, c3: fb.c3, c4: fb.c4, c5: fb.c5 });
    setAiFeedback(null);
  };

  return (
    <div style={{ padding: '3rem 3.5rem 8rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Back */}
      <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
        <ChevronLeft size={16} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
          <PenLine size={18} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>{initial ? 'Editar Redação' : 'Nova Redação'}</h2>
      </div>

      {/* API Key config panel */}
      <AnimatePresence>
        {showKeyConfig && (
          <div style={{ marginBottom: '1.5rem' }}>
            <APIKeyConfig apiKey={apiKey} onSave={setApiKey} onClose={() => setShowKeyConfig(false)} />
          </div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Left: editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título da redação..."
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#fff', fontSize: '1rem', fontWeight: 700, fontFamily: 'Lexend, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />
          <input
            type="text"
            value={theme}
            onChange={e => setTheme(e.target.value)}
            placeholder="Tema da redação (ex: Desafios da educação no Brasil)..."
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', fontFamily: 'Lexend, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />

          <NotebookTextarea value={content} onChange={setContent} />

          {/* Word/line counter */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Palavras', val: words, ok: words >= 70 },
              { label: 'Linhas aprox.', val: lines, ok: lines >= 7 && lines <= 30, warn: lines > 30 },
            ].map(({ label, val, ok, warn }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${warn ? '#f87171' : ok ? '#4ade80' : 'rgba(255,255,255,0.08)'}33`, borderRadius: '10px', padding: '6px 12px' }}>
                {warn ? <AlertCircle size={13} color="#f87171" /> : ok ? <CheckCircle2 size={13} color="#4ade80" /> : <AlertCircle size={13} color="rgba(255,255,255,0.3)" />}
                <span style={{ fontSize: '12px', fontWeight: 700, color: warn ? '#f87171' : ok ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>{val} {label}</span>
              </div>
            ))}
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>
              ENEM: mín. 7 linhas / máx. 30 linhas
            </div>
          </div>
        </div>

        {/* Right: scoring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '2rem' }}>
          {/* AI Evaluate button */}
          <button
            onClick={handleAIEvaluate}
            disabled={isLoading || !content.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '0.875rem', borderRadius: '14px', border: `1px solid ${ACCENT}55`,
              cursor: isLoading || !content.trim() ? 'not-allowed' : 'pointer',
              background: isLoading || !content.trim() ? 'rgba(232,121,249,0.08)' : 'rgba(232,121,249,0.12)',
              color: isLoading || !content.trim() ? 'rgba(232,121,249,0.4)' : ACCENT,
              fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {isLoading
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Avaliando...</>
              : <><Sparkles size={16} /> Avaliar com IA</>
            }
          </button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '0.75rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px' }}
              >
                <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#f87171', margin: '0 0 4px', fontWeight: 700 }}>{error}</p>
                  {error.includes('chave') && (
                    <button onClick={() => { clearError(); setShowKeyConfig(true); }} style={{ fontSize: '11px', color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Lexend, sans-serif', fontWeight: 700 }}>
                      Configurar chave →
                    </button>
                  )}
                </div>
                <button onClick={clearError} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', flexShrink: 0 }}><X size={12} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Feedback panel */}
          <AnimatePresence>
            {aiFeedback && (
              <AIFeedbackPanel
                feedback={aiFeedback}
                onApply={handleApplyAI}
                onClose={() => setAiFeedback(null)}
              />
            )}
          </AnimatePresence>

          {/* Total score */}
          <div style={{ background: 'rgba(30,41,59,0.5)', border: `1px solid ${color}33`, borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.5rem' }}>Nota Total</p>
            <motion.span key={total} initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ fontSize: '3.5rem', fontWeight: 900, color, letterSpacing: '-0.04em', display: 'block', textShadow: `0 0 20px ${color}66` }}>
              {total}
            </motion.span>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '4px 0 1rem' }}>de 1000 pontos</p>
            {/* Progress bar */}
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(total / 1000) * 100}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', background: color, borderRadius: '99px', boxShadow: `0 0 10px ${color}88` }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '9px', color: '#f87171', fontWeight: 700 }}>0</span>
              <span style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 700 }}>500</span>
              <span style={{ fontSize: '9px', color: '#4ade80', fontWeight: 700 }}>1000</span>
            </div>
          </div>

          {/* Competências */}
          {COMPETENCIAS.map(c => (
            <CompetenciaSlider
              key={c.key}
              label={c.label}
              desc={c.desc}
              value={competencias[c.key]}
              onChange={v => setComp(c.key, v)}
            />
          ))}

          <button
            onClick={handleSave}
            disabled={!title.trim()}
            style={{
              padding: '0.875rem', borderRadius: '14px', border: 'none', cursor: title.trim() ? 'pointer' : 'not-allowed',
              background: title.trim() ? ACCENT : 'rgba(232,121,249,0.3)',
              color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif',
              boxShadow: title.trim() ? `0 4px 20px ${ACCENT}44` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {initial ? 'Salvar alterações' : 'Salvar redação'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function RedacaoCard({ redacao, onEdit, onDelete }: { redacao: Redacao; onEdit: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  const color = scoreColor(redacao.totalScore);
  const date = new Date(redacao.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onEdit}
      style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(12px)', border: `1px solid ${hovered ? ACCENT + '44' : 'rgba(255,255,255,0.07)'}`, borderRadius: '20px', padding: '1.25rem', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{redacao.title}</h3>
          {redacao.theme && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{redacao.theme}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color, letterSpacing: '-0.04em' }}>{redacao.totalScore}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '-2px' }}>/1000</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', opacity: hovered ? 1 : 0, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Mini competências */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {COMPETENCIAS.map(c => (
          <div key={c.key} style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(redacao.competencias[c.key] / 200) * 100}%`, background: color, borderRadius: '99px' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{date}</span>
        <span style={{ fontSize: '10px', fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}33`, borderRadius: '6px', padding: '2px 8px' }}>
          {redacao.totalScore >= 700 ? 'Excelente' : redacao.totalScore >= 500 ? 'Regular' : 'Abaixo da média'}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function RedacaoView() {
  const { redacoes, addRedacao, updateRedacao, deleteRedacao } = useRedacoes();
  const [editing, setEditing] = useState<Redacao | null | 'new'>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const avgScore = useMemo(() => {
    if (!redacoes.length) return 0;
    return Math.round(redacoes.reduce((a, r) => a + r.totalScore, 0) / redacoes.length);
  }, [redacoes]);

  if (editing === 'new') {
    return (
      <RedacaoEditor
        onSave={data => addRedacao(data)}
        onClose={() => setEditing(null)}
      />
    );
  }

  if (editing) {
    return (
      <RedacaoEditor
        initial={editing}
        onSave={data => updateRedacao(editing.id, data)}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div style={{ padding: '3rem 3.5rem 8rem', width: '100%', boxSizing: 'border-box' }}>
      <ConfirmModal
        isOpen={!!confirmDelete}
        message="Excluir esta redação? Esta ação não pode ser desfeita."
        onConfirm={() => { if (confirmDelete) deleteRedacao(confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <PenLine size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Redação ENEM</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              {redacoes.length} redaç{redacoes.length !== 1 ? 'ões' : 'ão'}{redacoes.length > 0 ? ` · média ${avgScore}/1000` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditing('new')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer', background: ACCENT, color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', boxShadow: `0 4px 20px ${ACCENT}44`, flexShrink: 0 }}
        >
          <Plus size={18} strokeWidth={3} /> Nova Redação
        </button>
      </div>

      {/* Empty state */}
      {redacoes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '5rem 2rem', textAlign: 'center', border: '1px dashed rgba(232,121,249,0.2)', borderRadius: '24px', background: 'rgba(232,121,249,0.03)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 1.25rem', background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <FileText size={28} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Nenhuma redação ainda</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginBottom: '1.5rem' }}>Pratique sua redação e acompanhe sua evolução rumo à nota 1000!</p>
          <button onClick={() => setEditing('new')} style={{ padding: '0.75rem 2rem', borderRadius: '12px', border: 'none', cursor: 'pointer', background: ACCENT, color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif' }}>
            Escrever primeira redação
          </button>
        </motion.div>
      ) : (
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          <AnimatePresence>
            {redacoes.map(r => (
              <RedacaoCard
                key={r.id}
                redacao={r}
                onEdit={() => setEditing(r)}
                onDelete={() => setConfirmDelete(r.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
