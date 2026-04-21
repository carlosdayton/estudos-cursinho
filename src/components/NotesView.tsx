import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Pin, PinOff, Trash2, X, BookOpen,
  Tag, ChevronDown, FileText, Check
} from 'lucide-react';
import { useNotes, NOTE_TAGS, type Note, type NoteTag } from '../hooks/useNotes';
import { useSubjects } from '../hooks/useSubjects';
import { useToastContext } from '../context/ToastContext';
import { ConfirmModal } from './ConfirmModal';
import { useNavigation } from '../context/NavigationContext';

// ─── Tag badge ────────────────────────────────────────────────────────────────
function TagBadge({ tag, onRemove }: { tag: NoteTag; onRemove?: () => void }) {
  const meta = NOTE_TAGS.find(t => t.id === tag)!;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '99px',
      background: `${meta.color}18`, border: `1px solid ${meta.color}44`,
      color: meta.color, fontSize: '10px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      {meta.label}
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: meta.color, display: 'flex', padding: 0, lineHeight: 1 }}>
          <X size={10} />
        </button>
      )}
    </span>
  );
}

// ─── Note editor modal ────────────────────────────────────────────────────────
interface EditorProps {
  note?: Note | null;
  preset?: { title: string; subjectId: string | null } | null;
  onSave: (data: { title: string; content: string; subjectId: string | null; tags: NoteTag[] }) => void;
  onClose: () => void;
  subjects: { id: string; name: string; color: string }[];
}

function NoteEditor({ note, preset, onSave, onClose, subjects }: EditorProps) {
  const [title, setTitle] = useState(note?.title ?? preset?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [subjectId, setSubjectId] = useState<string | null>(note?.subjectId ?? preset?.subjectId ?? null);
  const [tags, setTags] = useState<NoteTag[]>(note?.tags ?? []);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const toggleTag = (tag: NoteTag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    onSave({ title, content, subjectId, tags });
    onClose();
  };

  const selectedSubject = subjects.find(s => s.id === subjectId);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(6px)', zIndex: 9000 }}
      />

      {/* Modal wrapper — centered via fixed + transform on a plain div */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9001,
        width: '100%',
        maxWidth: '680px',
        padding: '0 1rem',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
        <div style={{
          background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Top shimmer */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)' }} />

          <div style={{ padding: '1.75rem' }}>
            {/* Title input */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título da anotação..."
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Lexend, sans-serif',
                letterSpacing: '-0.02em', marginBottom: '1rem',
              }}
            />

            {/* Metadata row */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Subject picker — custom dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowSubjectPicker(s => !s); setShowTagPicker(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.06)', border: `1px solid ${selectedSubject ? selectedSubject.color + '55' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px', padding: '5px 10px', cursor: 'pointer',
                    color: selectedSubject ? selectedSubject.color : 'rgba(255,255,255,0.5)',
                    fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
                  }}
                >
                  <BookOpen size={12} />
                  {selectedSubject ? selectedSubject.name : 'Geral'}
                  <ChevronDown size={11} style={{ opacity: 0.5 }} />
                </button>
                <AnimatePresence>
                  {showSubjectPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                        background: 'rgba(10,15,30,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px', padding: '0.5rem', zIndex: 20,
                        display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '160px',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                      }}
                    >
                      {[{ id: null, name: 'Geral', color: 'rgba(255,255,255,0.4)' }, ...subjects].map(s => {
                        const isSelected = subjectId === s.id;
                        return (
                          <button
                            key={s.id ?? 'null'}
                            onClick={() => { setSubjectId(s.id); setShowSubjectPicker(false); }}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              background: isSelected ? `${s.color}18` : 'transparent',
                              color: isSelected ? s.color : 'rgba(255,255,255,0.6)',
                              fontSize: '13px', fontWeight: isSelected ? 700 : 500,
                              fontFamily: 'Lexend, sans-serif', transition: 'all 0.15s',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                          >
                            {s.name}
                            {isSelected && <Check size={12} />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tag picker */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowTagPicker(s => !s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '5px 10px', color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer',
                  }}
                >
                  <Tag size={12} /> Tags
                </button>
                <AnimatePresence>
                  {showTagPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                        background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px', padding: '0.75rem', zIndex: 10,
                        display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                      }}
                    >
                      {NOTE_TAGS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => toggleTag(t.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: tags.includes(t.id) ? `${t.color}18` : 'transparent',
                            color: tags.includes(t.id) ? t.color : 'rgba(255,255,255,0.5)',
                            fontSize: '12px', fontWeight: 700, fontFamily: 'Lexend, sans-serif',
                            transition: 'all 0.15s',
                          }}
                        >
                          {t.label}
                          {tags.includes(t.id) && <Check size={12} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected tags */}
              {tags.map(tag => (
                <TagBadge key={tag} tag={tag} onRemove={() => toggleTag(tag)} />
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.25rem' }} />

            {/* Notebook-style writing area */}
            <div style={{
              position: 'relative',
              background: 'rgba(8,12,28,0.6)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Red margin line */}
              <div style={{
                position: 'absolute',
                left: '48px',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'rgba(248,113,113,0.35)',
                zIndex: 1,
                pointerEvents: 'none',
              }} />

              {/* Horizontal ruled lines */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(129,140,248,0.08) 31px, rgba(129,140,248,0.08) 32px)',
                backgroundPosition: '0 16px',
                zIndex: 0,
                pointerEvents: 'none',
              }} />

              {/* Spiral holes */}
              <div style={{
                position: 'absolute',
                left: '14px',
                top: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                paddingTop: '16px',
                paddingBottom: '16px',
                zIndex: 2,
                pointerEvents: 'none',
                gap: '0',
              }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.12)',
                    background: 'rgba(2,6,23,0.8)',
                    flexShrink: 0,
                  }} />
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Comece a escrever sua anotação..."
                rows={14}
                style={{
                  position: 'relative',
                  zIndex: 3,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  fontFamily: 'Lexend, sans-serif',
                  lineHeight: '32px',
                  resize: 'none',
                  boxSizing: 'border-box',
                  padding: '16px 1.25rem 1.25rem 64px',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                {content.length} caracteres
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={onClose} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() && !content.trim()}
                  style={{
                    padding: '0.5rem 1.5rem', borderRadius: '10px', border: 'none',
                    background: (!title.trim() && !content.trim()) ? 'rgba(129,140,248,0.3)' : '#818cf8',
                    color: '#020617', fontSize: '13px', fontWeight: 800,
                    fontFamily: 'Lexend, sans-serif', cursor: (!title.trim() && !content.trim()) ? 'not-allowed' : 'pointer',
                    boxShadow: (!title.trim() && !content.trim()) ? 'none' : '0 4px 16px rgba(129,140,248,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  {note ? 'Salvar alterações' : 'Criar anotação'}
                </button>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Note card ────────────────────────────────────────────────────────────────
interface NoteCardProps {
  note: Note;
  subjectName?: string;
  subjectColor?: string;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

function NoteCard({ note, subjectName, subjectColor, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  const [hovered, setHovered] = useState(false);
  const preview = note.content.slice(0, 180) + (note.content.length > 180 ? '…' : '');
  const dateStr = new Date(note.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: note.pinned ? 'rgba(129,140,248,0.07)' : 'rgba(30,41,59,0.4)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${note.pinned ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '20px', padding: '1.25rem',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}
      onClick={onEdit}
    >
      {/* Top shimmer for pinned */}
      {note.pinned && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #818cf8, transparent)' }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <h3 style={{
          fontSize: '15px', fontWeight: 800, color: '#fff',
          letterSpacing: '-0.01em', lineHeight: 1.3, flex: 1, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {note.title}
        </h3>

        {/* Actions — visible on hover */}
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
          <button
            onClick={e => { e.stopPropagation(); onTogglePin(); }}
            title={note.pinned ? 'Desafixar' : 'Fixar no topo'}
            style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: note.pinned ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.06)', color: note.pinned ? '#818cf8' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}
          >
            {note.pinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Excluir"
            style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Content preview */}
      {preview && (
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
          {preview}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {subjectName && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: subjectColor ?? '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', background: `${subjectColor ?? '#818cf8'}15`, border: `1px solid ${subjectColor ?? '#818cf8'}30`, borderRadius: '6px', padding: '2px 7px' }}>
              {subjectName}
            </span>
          )}
          {note.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{dateStr}</span>
      </div>
    </motion.div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function NotesView() {
  const { notes, addNote, updateNote, deleteNote, togglePin, searchNotes } = useNotes();
  const { subjects } = useSubjects();
  const { showToast } = useToastContext();
  const { notePreset, clearNotePreset } = useNavigation();

  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null | 'all'>('all');
  const [filterTag, setFilterTag] = useState<NoteTag | 'all'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Open editor automatically when arriving from a topic
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Note | null>(null);
  const [presetData, setPresetData] = useState<{ title: string; subjectId: string | null } | null>(null);

  useEffect(() => {
    if (notePreset) {
      setPresetData({ title: notePreset.title, subjectId: notePreset.subjectId });
      setEditTarget(null);
      setEditorOpen(true);
      clearNotePreset();
    }
  }, [notePreset, clearNotePreset]);

  const openNew = () => { setPresetData(null); setEditTarget(null); setEditorOpen(true); };
  const openEdit = (note: Note) => { setPresetData(null); setEditTarget(note); setEditorOpen(true); };
  const closeEditor = () => { setEditorOpen(false); setEditTarget(null); setPresetData(null); };

  const handleSave = (data: { title: string; content: string; subjectId: string | null; tags: NoteTag[] }) => {
    if (editTarget) {
      updateNote(editTarget.id, data);
      showToast('Anotação atualizada.', 'success');
    } else {
      addNote(data);
      showToast('Anotação criada!', 'success');
    }
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    setConfirmDelete(null);
    showToast('Anotação excluída.', 'info');
  };

  // Filter + search
  const filtered = useMemo(() => {
    let result = search ? searchNotes(search) : notes;
    if (filterSubject !== 'all') result = result.filter(n => n.subjectId === filterSubject);
    if (filterTag !== 'all') result = result.filter(n => n.tags.includes(filterTag));
    // Pinned first
    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search, filterSubject, filterTag, searchNotes]);

  const pinnedCount = notes.filter(n => n.pinned).length;

  return (
    <div style={{ padding: '3rem 3.5rem 8rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Anotações</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            {notes.length} nota{notes.length !== 1 ? 's' : ''}{pinnedCount > 0 ? ` · ${pinnedCount} fixada${pinnedCount !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button
          onClick={openNew}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer', background: '#818cf8', color: '#020617', fontSize: '14px', fontWeight: 800, fontFamily: 'Lexend, sans-serif', letterSpacing: '0.03em', boxShadow: '0 4px 20px rgba(129,140,248,0.4)', transition: 'all 0.2s', flexShrink: 0 }}
        >
          <Plus size={18} strokeWidth={3} /> Nova Anotação
        </button>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar anotações..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.625rem 1rem 0.625rem 2.25rem', color: '#fff', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Subject filter */}
        <div style={{ position: 'relative' }}>
          <select
            value={filterSubject ?? 'null'}
            onChange={e => setFilterSubject(e.target.value === 'all' ? 'all' : e.target.value === 'null' ? null : e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.625rem 2rem 0.625rem 0.875rem', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', cursor: 'pointer', appearance: 'none' }}
          >
            <option value="all" style={{ background: '#0f172a', color: '#fff' }}>Todas as matérias</option>
            <option value="null" style={{ background: '#0f172a', color: '#fff' }}>Geral</option>
            {subjects.map(s => <option key={s.id} value={s.id} style={{ background: '#0f172a', color: '#fff' }}>{s.name}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
        </div>

        {/* Tag filter */}
        <div style={{ position: 'relative' }}>
          <select
            value={filterTag}
            onChange={e => setFilterTag(e.target.value as NoteTag | 'all')}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.625rem 2rem 0.625rem 0.875rem', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'Lexend, sans-serif', outline: 'none', cursor: 'pointer', appearance: 'none' }}
          >
            <option value="all" style={{ background: '#0f172a', color: '#fff' }}>Todas as tags</option>
            {NOTE_TAGS.map(t => <option key={t.id} value={t.id} style={{ background: '#0f172a', color: '#fff' }}>{t.label}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '5rem 2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '18px', margin: '0 auto 1.25rem', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <FileText size={26} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
            {search || filterSubject !== 'all' || filterTag !== 'all' ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação ainda'}
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
            {search || filterSubject !== 'all' || filterTag !== 'all' ? 'Tente outros filtros' : 'Clique em "Nova Anotação" para começar'}
          </p>
        </div>
      ) : (
        <motion.div
          layout
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}
        >
          <AnimatePresence>
            {filtered.map(note => {
              const subject = subjects.find(s => s.id === note.subjectId);
              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  subjectName={subject?.name}
                  subjectColor={subject?.color}
                  onEdit={() => openEdit(note)}
                  onDelete={() => setConfirmDelete(note.id)}
                  onTogglePin={() => togglePin(note.id)}
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Editor modal */}
      <AnimatePresence>
        {editorOpen && (
          <NoteEditor
            note={editTarget}
            preset={presetData}
            onSave={handleSave}
            onClose={closeEditor}
            subjects={subjects}
          />
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        message="Excluir esta anotação? Esta ação não pode ser desfeita."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
