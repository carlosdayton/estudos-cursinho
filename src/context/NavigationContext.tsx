import { createContext, useContext, useState, type ReactNode } from 'react';
import type { TabId } from '../components/AppLayout';

export interface NotePreset {
  title: string;
  subjectId: string | null;
}

interface NavigationContextValue {
  activeTab: TabId;
  navigateTo: (tab: TabId, notePreset?: NotePreset) => void;
  notePreset: NotePreset | null;
  clearNotePreset: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [notePreset, setNotePreset] = useState<NotePreset | null>(null);

  const navigateTo = (tab: TabId, preset?: NotePreset) => {
    setActiveTab(tab);
    if (preset) setNotePreset(preset);
  };

  const clearNotePreset = () => setNotePreset(null);

  return (
    <NavigationContext.Provider value={{ activeTab, navigateTo, notePreset, clearNotePreset }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}
