import { useState, useEffect } from 'react';
import type { Subject } from '../../utils/studyLogic';
import type { Flashcard, FlashcardDraft } from '../../utils/flashcardLogic';
import { FRONT_BACK_MAX_LENGTH } from '../../utils/flashcardLogic';
import { X, Save } from 'lucide-react';

interface FlashcardEditorProps {
  subjects: Subject[];
  initialCard?: Flashcard;
  onSave: (draft: FlashcardDraft) => string | null;
  onCancel: () => void;
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${hasError ? '#f87171' : 'rgba(255,255,255,0.12)'}`,
  borderRadius: '12px',
  padding: '0.75rem 1rem',
  color: '#fff',
  fontSize: '0.95rem',
  fontFamily: 'Lexend, sans-serif',
  outline: 'none',
  resize: 'vertical' as const,
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
});

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '6px',
  display: 'block',
};

export default function FlashcardEditor({
  subjects,
  initialCard,
  onSave,
  onCancel,
}: FlashcardEditorProps) {
  const [front, setFront] = useState(initialCard?.front ?? '');
  const [back, setBack] = useState(initialCard?.back ?? '');
  const [subjectId, setSubjectId] = useState(
    initialCard?.subjectId ?? (subjects[0]?.id ?? '')
  );
  const [topicId, setTopicId] = useState(initialCard?.topicId ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const selectedSubject = subjects.find(s => s.id === subjectId);
  const topics = selectedSubject?.topics ?? [];

  // Reset topicId when subject changes
  useEffect(() => {
    setTopicId('');
  }, [subjectId]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!front.trim()) newErrors.front = 'A frente não pode ser vazia.';
    else if (front.length > FRONT_BACK_MAX_LENGTH)
      newErrors.front = `Máximo ${FRONT_BACK_MAX_LENGTH} caracteres.`;

    if (!back.trim()) newErrors.back = 'O verso não pode ser vazio.';
    else if (back.length > FRONT_BACK_MAX_LENGTH)
      newErrors.back = `Máximo ${FRONT_BACK_MAX_LENGTH} caracteres.`;

    if (!subjectId) newErrors.subject = 'Selecione uma matéria.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const draft: FlashcardDraft = {
      front,
      back,
      subjectId,
      topicId: topicId || undefined,
    };
    const error = onSave(draft);
    if (error) setGlobalError(error);
  }

  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(129,140,248,0.2)',
        borderRadius: '20px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          {initialCard ? 'Editar Flashcard' : 'Novo Flashcard'}
        </p>
        <button
          onClick={onCancel}
          aria-label="Cancelar"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', padding: '4px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Frente */}
      <div>
        <label htmlFor="fc-front" style={labelStyle}>
          Frente (Pergunta)
        </label>
        <textarea
          id="fc-front"
          rows={3}
          value={front}
          onChange={e => setFront(e.target.value)}
          placeholder="Ex: O que é mitose?"
          style={inputStyle(!!errors.front)}
          onFocus={e => { if (!errors.front) e.target.style.borderColor = 'rgba(129,140,248,0.5)'; }}
          onBlur={e => { if (!errors.front) e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        />
        {errors.front && (
          <p style={{ fontSize: '11px', color: '#f87171', marginTop: '4px', margin: '4px 0 0' }}>
            {errors.front}
          </p>
        )}
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', textAlign: 'right', margin: '4px 0 0' }}>
          {front.length}/{FRONT_BACK_MAX_LENGTH}
        </p>
      </div>

      {/* Verso */}
      <div>
        <label htmlFor="fc-back" style={labelStyle}>
          Verso (Resposta)
        </label>
        <textarea
          id="fc-back"
          rows={3}
          value={back}
          onChange={e => setBack(e.target.value)}
          placeholder="Ex: Divisão celular que gera duas células-filhas geneticamente idênticas."
          style={inputStyle(!!errors.back)}
          onFocus={e => { if (!errors.back) e.target.style.borderColor = 'rgba(129,140,248,0.5)'; }}
          onBlur={e => { if (!errors.back) e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        />
        {errors.back && (
          <p style={{ fontSize: '11px', color: '#f87171', marginTop: '4px', margin: '4px 0 0' }}>
            {errors.back}
          </p>
        )}
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', textAlign: 'right', margin: '4px 0 0' }}>
          {back.length}/{FRONT_BACK_MAX_LENGTH}
        </p>
      </div>

      {/* Matéria */}
      <div>
        <label htmlFor="fc-subject" style={labelStyle}>
          Matéria
        </label>
        <select
          id="fc-subject"
          value={subjectId}
          onChange={e => setSubjectId(e.target.value)}
          style={{
            ...inputStyle(!!errors.subject),
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        >
          {subjects.length === 0 && (
            <option value="">Nenhuma matéria disponível</option>
          )}
          {subjects.map(s => (
            <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p style={{ fontSize: '11px', color: '#f87171', margin: '4px 0 0' }}>
            {errors.subject}
          </p>
        )}
      </div>

      {/* Tópico (opcional) */}
      {topics.length > 0 && (
        <div>
          <label htmlFor="fc-topic" style={labelStyle}>
            Tópico <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(opcional)</span>
          </label>
          <select
            id="fc-topic"
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
            style={{
              ...inputStyle(false),
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <option value="" style={{ background: '#0f172a' }}>Nenhum tópico específico</option>
            {topics.map(t => (
              <option key={t.id} value={t.id} style={{ background: '#0f172a' }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {globalError && (
        <p style={{ fontSize: '12px', color: '#f87171', background: 'rgba(248,113,113,0.1)', borderRadius: '8px', padding: '0.5rem 0.75rem', margin: 0 }}>
          {globalError}
        </p>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.65rem 1.25rem', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '13px', fontWeight: 700,
            fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '0.65rem 1.5rem', borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #818cf8, #a855f7)',
            color: '#fff',
            fontSize: '13px', fontWeight: 800,
            fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 20px rgba(129,140,248,0.35)',
          }}
        >
          <Save size={14} />
          Salvar
        </button>
      </div>
    </div>
  );
}
