import { useCallback, useMemo } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';

export type NoteTag = 'importante' | 'dúvida' | 'resumo' | 'fórmula' | 'dica';

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string | null;
  tags: NoteTag[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  subject_id: string | null;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  addNote: (data: Pick<Note, 'title' | 'content' | 'subjectId' | 'tags'>) => Promise<Note | null>;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'subjectId' | 'tags' | 'pinned'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  getNotesBySubject: (subjectId: string | null) => Note[];
  searchNotes: (query: string) => Note[];
  totalNotes: number;
}

export const NOTE_TAGS: { id: NoteTag; label: string; color: string }[] = [
  { id: 'importante', label: 'Importante', color: '#f87171' },
  { id: 'dúvida',     label: 'Dúvida',     color: '#fbbf24' },
  { id: 'resumo',     label: 'Resumo',     color: '#34d399' },
  { id: 'fórmula',    label: 'Fórmula',    color: '#818cf8' },
  { id: 'dica',       label: 'Dica',       color: '#60a5fa' },
];

function toNote(db: DbNote): Note {
  return {
    id: db.id,
    title: db.title,
    content: db.content,
    subjectId: db.subject_id,
    tags: db.tags as NoteTag[],
    pinned: db.pinned,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function useNotes(): UseNotesReturn {
  const { data, loading, insert, update, remove } = useSupabaseQuery<DbNote>(
    'notes',
    [],
    { orderBy: { column: 'pinned', ascending: false } }
  );

  const notes = useMemo(() => data.map(toNote), [data]);

  const addNote = useCallback(async (data: Pick<Note, 'title' | 'content' | 'subjectId' | 'tags'>): Promise<Note | null> => {
    const now = new Date().toISOString();
    const created = await insert({
      title: data.title.trim() || 'Sem título',
      content: data.content,
      subject_id: data.subjectId,
      tags: data.tags,
      pinned: false,
      created_at: now,
      updated_at: now,
    } as Omit<DbNote, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
    return created ? toNote(created) : null;
  }, [insert]);

  const updateNote = useCallback(async (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'subjectId' | 'tags' | 'pinned'>>) => {
    await update(id, {
      ...patch,
      subject_id: patch.subjectId,
      updated_at: new Date().toISOString(),
    } as Partial<DbNote>);
  }, [update]);

  const deleteNote = useCallback(async (id: string) => {
    await remove(id);
  }, [remove]);

  const togglePin = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    await update(id, {
      pinned: !note.pinned,
      updated_at: new Date().toISOString(),
    } as Partial<DbNote>);
  }, [notes, update]);

  const getNotesBySubject = useCallback((subjectId: string | null) => {
    return notes.filter(n => n.subjectId === subjectId);
  }, [notes]);

  const searchNotes = useCallback((query: string) => {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.includes(q))
    );
  }, [notes]);

  const totalNotes = useMemo(() => notes.length, [notes]);

  return { notes, loading, addNote, updateNote, deleteNote, togglePin, getNotesBySubject, searchNotes, totalNotes };
}
