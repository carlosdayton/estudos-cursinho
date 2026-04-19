import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Trash2, Play, CheckCircle2, XCircle, BarChart3, ChevronLeft, Filter } from 'lucide-react';
import { useQuestions, type Question } from '../hooks/useQuestions';
import { useSubjects } from '../hooks/useSubjects';
import { ConfirmModal } from './ConfirmModal';

const ACCENT = '#f472b6';
const ALT_KEYS = ['a', 'b', 'c', 'd', 'e'] as const;

// ─── Add question form ────────────────────────────────────────────────────────
function AddQuestionForm({ onAdd, onClose, subjects }: {
  onAdd: (data: Omit<Question, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  subjects: { id: string; name: string }[];
}) {
  const [statement, setStatement] = useState('');
  const [alts, setAlts] = useState({ a: '', b: '', c: '', d: '', e: '' });
  const [answer, setAnswer] = useState<Question['answer']>('a');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [year, setYear] = useState<string>('');

  const subjectName = subjects.find(s => s.id === subjectId)?.name ?? '';

  const handleAdd = () => {
    if (!statement.trim() || !subjectId) return;
    onAdd({ statement, alternatives: alts, answer, subjectId, subjectName, year: year ? Number(year) : undefined });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}33`, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Nova Questão</p>

      {/* Statement */}
      <textarea
        value={statement}
        onChange={e => setStatement(e.target.value)}
        placeholder="Enunciado da questão..."
        rows={4}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#fff', fontSize: '14px', fontFamily: 'Lexend, sans-serif', outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
      />

      {/* Alternatives */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ALT_KEYS.map(k => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setAnswer(k)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: `2px solid ${answer === k ? ACCENT : 'rgba(255,255,255,0.15)'}`, background: answer === k ? `${ACCENT}22` : 'rgba(255,255,255,0.04)', color: answer === k ? ACCENT : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
            >
              {k.toUpperCase()}
            </button>
            <input
              type="text"
              value={alts[k]}
              onChange={e => setAlts(prev => ({ ...prev, [k]: e.target.value }))}
              placeholder={`Alternativa ${k.toUpperCase()}...`}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${answer === k ? ACCENT + '44' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '0.5rem 0.875rem', color: '#fff', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none' }}
            />
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <select
          value={subjectId}
          onChange={e => setSubjectId(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', cursor: 'pointer' }}
        >
          {subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#0f172a', color: '#fff' }}>{s.name}</option>)}
        </select>
        <input
          type="number"
          value={year}
          onChange={e => setYear(e.target.value)}
          placeholder="Ano (ex: 2023)"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.5rem 1rem', color: '#fff', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', width: '140px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>Cancelar</button>
        <button onClick={handleAdd} disabled={!statement.trim() || !subjectId} style={{ padding: '0.625rem 1.5rem', borderRadius: '10px', border: 'none', background: statement.trim() && subjectId ? ACCENT : 'rgba(244,114,182,0.3)', color: '#020617', fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: statement.trim() && subjectId ? 'pointer' : 'not-allowed', boxShadow: statement.trim() && subjectId ? `0 4px 16px ${ACCENT}44` : 'none' }}>Adicionar questão</button>
      </div>
    </motion.div>
  );
}

// ─── Practice mode ────────────────────────────────────────────────────────────
function PracticeMode({ questions, onRecord, onExit }: {
  questions: Question[];
  onRecord: (id: string, correct: boolean) => void;
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Question['answer'] | null>(null);
  const [revealed, setRevealed] = useState(false);

  const q = questions[idx];
  if (!q) return null;

  const handleSelect = (k: Question['answer']) => {
    if (revealed) return;
    setSelected(k);
  };

  const handleReveal = () => {
    if (!selected) return;
    setRevealed(true);
    onRecord(q.id, selected === q.answer);
  };

  const handleNext = () => {
    setSelected(null);
    setRevealed(false);
    setIdx(i => (i + 1) % questions.length);
  };

  const isCorrect = revealed && selected === q.answer;
  const isWrong = revealed && selected !== q.answer;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={16} /> Sair da prática
        </button>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{idx + 1} / {questions.length}</span>
      </div>

      <motion.div
        key={q.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Meta */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: ACCENT, background: `${ACCENT}18`, border: `1px solid ${ACCENT}33`, borderRadius: '6px', padding: '2px 8px' }}>{q.subjectName}</span>
          {q.year && <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px 8px' }}>{q.year}</span>}
        </div>

        {/* Statement */}
        <p style={{ fontSize: '15px', color: '#fff', lineHeight: 1.7, margin: 0 }}>{q.statement}</p>

        {/* Alternatives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ALT_KEYS.map(k => {
            const isSelected = selected === k;
            const isAnswer = q.answer === k;
            let bg = 'rgba(255,255,255,0.04)';
            let border = 'rgba(255,255,255,0.08)';
            let color = 'rgba(255,255,255,0.7)';
            if (revealed) {
              if (isAnswer) { bg = 'rgba(74,222,128,0.12)'; border = 'rgba(74,222,128,0.4)'; color = '#4ade80'; }
              else if (isSelected && !isAnswer) { bg = 'rgba(248,113,113,0.12)'; border = 'rgba(248,113,113,0.4)'; color = '#f87171'; }
            } else if (isSelected) {
              bg = `${ACCENT}18`; border = `${ACCENT}55`; color = ACCENT;
            }
            return (
              <button
                key={k}
                onClick={() => handleSelect(k)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, background: bg, color, fontSize: '14px', fontFamily: 'Lexend, sans-serif', cursor: revealed ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
              >
                <span style={{ fontWeight: 800, flexShrink: 0, minWidth: '20px' }}>{k.toUpperCase()})</span>
                <span style={{ lineHeight: 1.5 }}>{q.alternatives[k] || '—'}</span>
                {revealed && isAnswer && <CheckCircle2 size={16} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                {revealed && isSelected && !isAnswer && <XCircle size={16} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {!revealed ? (
            <button
              onClick={handleReveal}
              disabled={!selected}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: selected ? ACCENT : 'rgba(244,114,182,0.3)', color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            >
              Confirmar resposta
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                {isCorrect ? <CheckCircle2 size={20} color="#4ade80" /> : <XCircle size={20} color="#f87171" />}
                <span style={{ fontSize: '14px', fontWeight: 700, color: isCorrect ? '#4ade80' : '#f87171' }}>
                  {isCorrect ? 'Correto!' : `Errado. Resposta: ${q.answer.toUpperCase()}`}
                </span>
              </div>
              <button onClick={handleNext} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: ACCENT, color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>
                Próxima →
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function QuestoesView() {
  const { questions, attempts, addQuestion, deleteQuestion, recordAttempt, getStatsBySubject } = useQuestions();
  const { subjects } = useSubjects();
  const [showAdd, setShowAdd] = useState(false);
  const [practicing, setPracticing] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const stats = useMemo(() => getStatsBySubject(), [attempts, questions]);

  const years = useMemo(() => {
    const ys = [...new Set(questions.map(q => q.year).filter(Boolean))].sort((a, b) => (b ?? 0) - (a ?? 0));
    return ys as number[];
  }, [questions]);

  const filtered = useMemo(() => {
    let result = questions;
    if (filterSubject !== 'all') result = result.filter(q => q.subjectId === filterSubject);
    if (filterYear !== 'all') result = result.filter(q => String(q.year) === filterYear);
    return result;
  }, [questions, filterSubject, filterYear]);

  const practicePool = useMemo(() => {
    if (filterSubject !== 'all') return questions.filter(q => q.subjectId === filterSubject);
    return questions;
  }, [questions, filterSubject]);

  if (practicing && practicePool.length > 0) {
    return (
      <div style={{ padding: '3rem 3.5rem 8rem', width: '100%', boxSizing: 'border-box' }}>
        <PracticeMode questions={practicePool} onRecord={recordAttempt} onExit={() => setPracticing(false)} />
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 3.5rem 8rem', width: '100%', boxSizing: 'border-box' }}>
      <ConfirmModal
        isOpen={!!confirmDelete}
        message="Excluir esta questão?"
        onConfirm={() => { if (confirmDelete) deleteQuestion(confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <HelpCircle size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Banco de Questões</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{questions.length} questão{questions.length !== 1 ? 'ões' : ''} · {attempts.length} tentativa{attempts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {questions.length > 0 && (
            <button onClick={() => setPracticing(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none', background: '#4ade80', color: '#020617', fontSize: '13px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer', boxShadow: '0 4px 16px rgba(74,222,128,0.4)' }}>
              <Play size={16} /> Praticar
            </button>
          )}
          <button onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer', background: ACCENT, color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', boxShadow: `0 4px 20px ${ACCENT}44` }}>
            <Plus size={18} strokeWidth={3} /> Nova Questão
          </button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <AddQuestionForm
            onAdd={data => { addQuestion(data); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
            subjects={subjects}
          />
        )}
      </AnimatePresence>

      {/* Stats by subject */}
      {Object.keys(stats).length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {subjects.filter(s => stats[s.id]).map(s => {
            const st = stats[s.id];
            return (
              <div key={s.id} style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BarChart3 size={16} color={s.color} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: s.color, margin: 0 }}>{s.name}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{st.correct}/{st.total} ({st.pct}%)</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      {questions.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} color="rgba(255,255,255,0.3)" />
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', cursor: 'pointer' }}>
            <option value="all" style={{ background: '#0f172a', color: '#fff' }}>Todas as matérias</option>
            {subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#0f172a', color: '#fff' }}>{s.name}</option>)}
          </select>
          {years.length > 0 && (
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', cursor: 'pointer' }}>
              <option value="all" style={{ background: '#0f172a', color: '#fff' }}>Todos os anos</option>
              {years.map(y => <option key={y} value={String(y)} style={{ background: '#0f172a', color: '#fff' }}>{y}</option>)}
            </select>
          )}
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{filtered.length} questão{filtered.length !== 1 ? 'ões' : ''}</span>
        </div>
      )}

      {/* Empty state */}
      {questions.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '5rem 2rem', textAlign: 'center', border: '1px dashed rgba(244,114,182,0.2)', borderRadius: '24px', background: 'rgba(244,114,182,0.03)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 1.25rem', background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <HelpCircle size={28} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Nenhuma questão ainda</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', marginBottom: '1.5rem' }}>Adicione questões para praticar e acompanhar seu desempenho por matéria.</p>
          <button onClick={() => setShowAdd(true)} style={{ padding: '0.75rem 2rem', borderRadius: '12px', border: 'none', background: ACCENT, color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>
            Adicionar primeira questão
          </button>
        </motion.div>
      ) : (
        <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {filtered.map(q => {
              const subject = subjects.find(s => s.id === q.subjectId);
              return (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {subject && <span style={{ fontSize: '10px', fontWeight: 700, color: subject.color, background: `${subject.color}18`, border: `1px solid ${subject.color}33`, borderRadius: '6px', padding: '2px 8px' }}>{subject.name}</span>}
                      {q.year && <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px 8px' }}>{q.year}</span>}
                      <span style={{ fontSize: '10px', fontWeight: 700, color: ACCENT, background: `${ACCENT}18`, borderRadius: '6px', padding: '2px 8px' }}>Gabarito: {q.answer.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{q.statement}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(q.id)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', flexShrink: 0, transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
