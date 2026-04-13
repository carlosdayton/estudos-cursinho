import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Pencil, Trash2, ListOrdered, RefreshCw } from 'lucide-react';
import { useStudyCycles } from '../hooks/useStudyCycles';
import { useFocusMode } from '../context/FocusModeContext';
import { useToastContext } from '../context/ToastContext';
import { ConfirmModal } from './ConfirmModal';
import CycleEditorModal from './CycleEditorModal';
import type { Subject, StudyCycle } from '../utils/studyLogic';

interface StudyCyclesPanelProps {
  subjects: Subject[];
}

export default function StudyCyclesPanel({ subjects }: StudyCyclesPanelProps) {
  const { cycles, saveCycle, deleteCycle } = useStudyCycles();
  const { startCycle } = useFocusMode();
  const { showToast } = useToastContext();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<StudyCycle | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; cycleId: string | null }>({
    isOpen: false,
    cycleId: null,
  });

  const handleNewCycle = () => {
    setEditingCycle(null);
    setEditorOpen(true);
  };

  const handleEditCycle = useCallback((cycle: StudyCycle) => {
    setEditingCycle(cycle);
    setEditorOpen(true);
  }, []);

  const handleSaveCycle = useCallback(
    (data: StudyCycle & { id?: string }) => {
      saveCycle(data);
      setEditorOpen(false);
      showToast(data.id ? 'Ciclo atualizado.' : 'Ciclo criado com sucesso.', 'success');
    },
    [saveCycle, showToast]
  );

  const handleRequestDelete = useCallback((id: string) => {
    setConfirmDelete({ isOpen: true, cycleId: id });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete.cycleId) {
      deleteCycle(confirmDelete.cycleId);
      showToast('Ciclo excluído.', 'info');
    }
    setConfirmDelete({ isOpen: false, cycleId: null });
  }, [confirmDelete.cycleId, deleteCycle, showToast]);

  const handleStartCycle = useCallback(
    (cycle: StudyCycle) => {
      startCycle(cycle);
    },
    [startCycle]
  );

  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const getSubjectColor = (id: string) => subjects.find((s) => s.id === id)?.color ?? '#818cf8';

  return (
    <>
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        message="Tem certeza que deseja excluir este ciclo?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, cycleId: null })}
      />

      <CycleEditorModal
        isOpen={editorOpen}
        cycle={editingCycle}
        subjects={subjects}
        onSave={handleSaveCycle}
        onClose={() => setEditorOpen(false)}
      />

      <div style={{
        background: 'rgba(30,41,59,0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(129,140,248,0.15)',
              border: '1px solid rgba(129,140,248,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#818cf8',
            }}>
              <ListOrdered size={18} />
            </div>
            <div>
              <p style={{
                fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)',
                fontFamily: 'Lexend, sans-serif', margin: 0,
              }}>
                Módulo
              </p>
              <h3 style={{
                fontSize: '16px', fontWeight: 900, color: '#fff',
                fontFamily: 'Lexend, sans-serif', margin: 0, letterSpacing: '-0.01em',
              }}>
                Ciclos de Estudo
              </h3>
            </div>
          </div>

          <button
            onClick={handleNewCycle}
            aria-label="Criar novo ciclo"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '12px', border: 'none',
              background: '#818cf8', color: '#020617',
              fontSize: '12px', fontWeight: 900, fontFamily: 'Lexend, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(129,140,248,0.35)',
              transition: 'all 0.2s',
              letterSpacing: '0.05em',
            }}
          >
            <Plus size={14} strokeWidth={3} />
            Novo Ciclo
          </button>
        </div>

        {/* Cycles list */}
        <AnimatePresence initial={false}>
          {cycles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                border: '1px dashed rgba(255,255,255,0.07)',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <ListOrdered size={28} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{
                fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                fontFamily: 'Lexend, sans-serif', marginBottom: '4px',
              }}>
                Nenhum ciclo criado
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Lexend, sans-serif' }}>
                Clique em "Novo Ciclo" para montar sua sequência de estudos
              </p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cycles.map((cycle) => (
                <motion.div
                  key={cycle.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{
                        fontSize: '14px', fontWeight: 800, color: '#fff',
                        fontFamily: 'Lexend, sans-serif',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {cycle.name}
                      </span>
                      {cycle.loop && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '3px',
                          fontSize: '9px', fontWeight: 800, color: '#818cf8',
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          background: 'rgba(129,140,248,0.12)',
                          border: '1px solid rgba(129,140,248,0.25)',
                          borderRadius: '99px', padding: '1px 6px',
                          fontFamily: 'Lexend, sans-serif',
                        }}>
                          <RefreshCw size={8} />
                          Loop
                        </span>
                      )}
                    </div>

                    {/* Subject pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {cycle.subjectIds.map((id, idx) => (
                        <span
                          key={id}
                          style={{
                            fontSize: '10px', fontWeight: 700,
                            color: getSubjectColor(id),
                            background: `${getSubjectColor(id)}15`,
                            border: `1px solid ${getSubjectColor(id)}30`,
                            borderRadius: '99px',
                            padding: '1px 8px',
                            fontFamily: 'Lexend, sans-serif',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {idx + 1}. {getSubjectName(id)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleStartCycle(cycle)}
                      aria-label={`Iniciar ciclo ${cycle.name}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 0.9rem',
                        borderRadius: '10px', border: 'none',
                        background: '#818cf8', color: '#020617',
                        fontSize: '11px', fontWeight: 900, fontFamily: 'Lexend, sans-serif',
                        cursor: 'pointer',
                        boxShadow: '0 2px 12px rgba(129,140,248,0.35)',
                        transition: 'all 0.2s',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <Play size={12} fill="currentColor" />
                      Iniciar
                    </button>

                    <button
                      onClick={() => handleEditCycle(cycle)}
                      aria-label={`Editar ciclo ${cycle.name}`}
                      style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      onClick={() => handleRequestDelete(cycle.id)}
                      aria-label={`Excluir ciclo ${cycle.name}`}
                      style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        border: '1px solid rgba(248,113,113,0.15)',
                        background: 'rgba(248,113,113,0.06)',
                        color: 'rgba(248,113,113,0.6)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
