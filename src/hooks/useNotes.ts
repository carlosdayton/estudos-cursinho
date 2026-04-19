import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type NoteTag = 'importante' | 'dúvida' | 'resumo' | 'fórmula' | 'dica';

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string | null;   // null = nota geral
  tags: NoteTag[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UseNotesReturn {
  notes: Note[];
  addNote: (data: Pick<Note, 'title' | 'content' | 'subjectId' | 'tags'>) => Note;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'subjectId' | 'tags' | 'pinned'>>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
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

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useLocalStorage<Note[]>('enem-notes', []);

  const addNote = useCallback((data: Pick<Note, 'title' | 'content' | 'subjectId' | 'tags'>): Note => {
    const now = new Date().toISOString();
    const note: Note = {
      id: Math.random().toString(36).slice(2, 11),
      title: data.title.trim() || 'Sem título',
      content: data.content,
      subjectId: data.subjectId,
      tags: data.tags,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes(prev => [note, ...prev]);
    return note;
  }, [setNotes]);

  const updateNote = useCallback((id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'subjectId' | 'tags' | 'pinned'>>) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
    ));
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [setNotes]);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n
    ));
  }, [setNotes]);

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

  return { notes, addNote, updateNote, deleteNote, togglePin, getNotesBySubject, searchNotes, totalNotes };
}
