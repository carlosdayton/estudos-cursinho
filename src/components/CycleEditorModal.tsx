import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import type { Subject, StudyCycle } from '../utils/studyLogic';

interface CycleEditorModalProps {
  isOpen: boolean;
  cycle: StudyCycle | null;
  subjects: Subject[];
  onSave: (cycle: StudyCycle & { id?: string }) => void;
  onClose: () => void;
}

export default function CycleEditorModal({
  isOpen,
  cycle,
  subjects,
  onSave,
  onClose,
}: CycleEditorModalProps) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loop, setLoop] = useState(false);
  const [pomodorosPerSubject, setPomodorosPerSubject] = useState(1);
  const [nameError, setNameError] = useState('');
  const [subjectsError, setSubjectsError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Preencher ao abrir
  useEffect(() => {
    if (isOpen) {
      setName(cycle?.name ?? '');
      setSelectedIds(cycle?.subjectIds ?? []);
      setLoop(cycle?.loop ?? false);
      setPomodorosPerSubject(cycle?.pomodorosPerSubject ?? 1);
      setNameError('');
      setSubjectsError('');
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen, cycle]);

  // Fechar com Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setSubjectsError('');
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setSelectedIds((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const validate = (): boolean => {
    let valid = true;
    if (!name.trim()) {
      setNameError('O nome do ciclo não pode estar vazio.');
      valid = false;
    } else if (name.trim().length > 50) {
      setNameError('O nome deve ter no máximo 50 caracteres.');
      valid = false;
    } else {
      setNameError('');
    }

    if (selectedIds.length < 2) {
      setSubjectsError('Selecione pelo menos 2 matérias.');
      valid = false;
    } else {
      setSubjectsError('');
    }

    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      name: name.trim(),
      subjectIds: selectedIds,
      loop,
      pomodorosPerSubject,
      createdAt: cycle?.createdAt ?? new Date().toISOString(),
      ...(cycle?.id ? { id: cycle.id } : {}),
    };
    onSave(payload as Parameters<typeof onSave>[0]);
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(2,6,23,0.75)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={cycle ? 'Editar ciclo de estudos' : 'Criar ciclo de estudos'}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10001,
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgba(15,23,42,0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(129,140,248,0.2)',
              borderRadius: '24px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{
                fontSize: '16px', fontWeight: 900, color: '#fff',
                fontFamily: 'Lexend, sans-serif', letterSpacing: '-0.01em', margin: 0,
              }}>
                {cycle ? 'Editar Ciclo' : 'Novo Ciclo'}
              </h2>
              <button
                onClick={onClose}
                aria-label="Fechar modal"
                style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Nome */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                htmlFor="cycle-name"
                style={{
                  fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                Nome do Ciclo
              </label>
              <input
                id="cycle-name"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                placeholder="Ex: Ciclo Exatas, Ciclo Humanas..."
                maxLength={50}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${nameError ? '#f87171' : 'rgba(129,140,248,0.25)'}`,
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'Lexend, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { if (!nameError) e.target.style.borderColor = 'rgba(129,140,248,0.6)'; }}
                onBlur={(e) => { if (!nameError) e.target.style.borderColor = 'rgba(129,140,248,0.25)'; }}
              />
              {nameError && (
                <p style={{ fontSize: '11px', color: '#f87171', fontFamily: 'Lexend, sans-serif', margin: 0 }}>
                  {nameError}
                </p>
              )}
            </div>

            {/* Pomodoros por matéria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{
                fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)',
                fontFamily: 'Lexend, sans-serif',
              }}>
                Pomodoros por Matéria
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPomodorosPerSubject(n)}
                    aria-pressed={pomodorosPerSubject === n}
                    style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      border: `1px solid ${pomodorosPerSubject === n ? 'rgba(129,140,248,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      background: pomodorosPerSubject === n ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.04)',
                      color: pomodorosPerSubject === n ? '#818cf8' : 'rgba(255,255,255,0.4)',
                      fontSize: '14px', fontWeight: 900, fontFamily: 'Lexend, sans-serif',
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: pomodorosPerSubject === n ? '0 0 12px rgba(129,140,248,0.3)' : 'none',
                    }}
                  >
                    {n}
                  </button>
                ))}
                <span style={{
                  fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'Lexend, sans-serif',
                }}>
                  × 25min = {pomodorosPerSubject * 25}min por matéria
                </span>
              </div>
            </div>

            {/* Seleção de matérias */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{
                fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)',
                fontFamily: 'Lexend, sans-serif', margin: 0,
              }}>
                Matérias ({selectedIds.length} selecionadas)
              </p>

              {subjects.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Lexend, sans-serif' }}>
                  Nenhuma matéria cadastrada. Adicione matérias no Dashboard primeiro.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {subjects.map((subject) => {
                    const isSelected = selectedIds.includes(subject.id);
                    return (
                      <button
                        key={subject.id}
                        onClick={() => toggleSubject(subject.id)}
                        aria-pressed={isSelected}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.6rem 0.9rem',
                          borderRadius: '10px',
                          border: `1px solid ${isSelected ? `${subject.color}50` : 'rgba(255,255,255,0.07)'}`,
                          background: isSelected ? `${subject.color}15` : 'rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{
                          width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                          background: isSelected ? subject.color : 'rgba(255,255,255,0.15)',
                          boxShadow: isSelected ? `0 0 8px ${subject.color}` : 'none',
                          transition: 'all 0.15s',
                        }} />
                        <span style={{
                          fontSize: '13px', fontWeight: 700, color: isSelected ? '#fff' : 'rgba(255,255,255,0.5)',
                          fontFamily: 'Lexend, sans-serif', flex: 1,
                          transition: 'color 0.15s',
                        }}>
                          {subject.name}
                        </span>
                        {isSelected && (
                          <span style={{
                            fontSize: '9px', fontWeight: 800, color: subject.color,
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            fontFamily: 'Lexend, sans-serif',
                          }}>
                            #{selectedIds.indexOf(subject.id) + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {subjectsError && (
                <p style={{ fontSize: '11px', color: '#f87171', fontFamily: 'Lexend, sans-serif', margin: 0 }}>
                  {subjectsError}
                </p>
              )}
            </div>

            {/* Ordem das matérias selecionadas */}
            {selectedIds.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{
                  fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'Lexend, sans-serif', margin: 0,
                }}>
                  Ordem do Ciclo
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {selectedIds.map((id, index) => {
                    const subject = getSubjectById(id);
                    if (!subject) return null;
                    return (
                      <div
                        key={id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <span style={{
                          fontSize: '10px', fontWeight: 900, color: subject.color,
                          fontFamily: 'Lexend, sans-serif', minWidth: '16px',
                        }}>
                          {index + 1}
                        </span>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: subject.color, flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '12px', fontWeight: 700, color: '#fff',
                          fontFamily: 'Lexend, sans-serif', flex: 1,
                        }}>
                          {subject.name}
                        </span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            aria-label={`Mover ${subject.name} para cima`}
                            style={{
                              width: '26px', height: '26px', borderRadius: '7px',
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.04)',
                              color: index === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === selectedIds.length - 1}
                            aria-label={`Mover ${subject.name} para baixo`}
                            style={{
                              width: '26px', height: '26px', borderRadius: '7px',
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.04)',
                              color: index === selectedIds.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
                              cursor: index === selectedIds.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                          >
                            <ChevronDown size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Toggle loop */}
            <button
              onClick={() => setLoop((v) => !v)}
              aria-pressed={loop}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: `1px solid ${loop ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.08)'}`,
                background: loop ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <RefreshCw size={15} color={loop ? '#818cf8' : 'rgba(255,255,255,0.35)'} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '12px', fontWeight: 800, color: loop ? '#818cf8' : 'rgba(255,255,255,0.6)',
                  fontFamily: 'Lexend, sans-serif', margin: 0, transition: 'color 0.2s',
                }}>
                  Repetir ciclo ao terminar
                </p>
                <p style={{
                  fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'Lexend, sans-serif', margin: 0,
                }}>
                  O ciclo reinicia automaticamente ao completar todas as matérias
                </p>
              </div>
              {/* Toggle pill */}
              <div style={{
                width: '36px', height: '20px', borderRadius: '99px',
                background: loop ? '#818cf8' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  left: loop ? '19px' : '3px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </div>
            </button>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.7rem 1.25rem', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '12px', fontWeight: 800, fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none',
                  background: '#818cf8', color: '#020617',
                  fontSize: '12px', fontWeight: 900, fontFamily: 'Lexend, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(129,140,248,0.4)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.05em',
                }}
              >
                {cycle ? 'Salvar Alterações' : 'Criar Ciclo'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
