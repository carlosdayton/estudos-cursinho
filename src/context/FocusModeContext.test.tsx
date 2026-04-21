import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as React from 'react';
import * as fc from 'fast-check';
import { FocusModeProvider, useFocusMode, resolveActiveSubject } from './FocusModeContext';
import { AuthProvider } from './AuthContext';
import type { Subject, Topic } from '../utils/studyLogic';

// ─── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ─── Supabase mock ────────────────────────────────────────────────────────────

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({}),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      upsert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    }),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSubject(id: string, name = 'Matéria', color = '#818cf8'): Subject {
  return { id, name, color, topics: [] };
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null,
    React.createElement(FocusModeProvider, null, children)
  );

// ─── resolveActiveSubject ─────────────────────────────────────────────────────

describe('resolveActiveSubject', () => {
  it('retorna null quando subjectId é null', () => {
    const subjects = [makeSubject('a'), makeSubject('b')];
    expect(resolveActiveSubject(null, subjects)).toBeNull();
  });

  it('retorna null quando subjects está vazio', () => {
    expect(resolveActiveSubject('abc', [])).toBeNull();
  });

  it('retorna null quando id não existe em subjects', () => {
    const subjects = [makeSubject('a'), makeSubject('b')];
    expect(resolveActiveSubject('z', subjects)).toBeNull();
  });

  it('retorna o Subject correto quando id existe', () => {
    const s = makeSubject('x', 'Matemática');
    const subjects = [makeSubject('a'), s, makeSubject('b')];
    expect(resolveActiveSubject('x', subjects)).toBe(s);
  });

  // Property: para qualquer id não presente em subjects, sempre retorna null
  it('[PBT] id inválido sempre retorna null', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(fc.record({ id: fc.string(), name: fc.string(), color: fc.string(), topics: fc.constant([] as Topic[]) })),
        (id, subjects) => {
          const filtered = subjects.filter((s) => s.id !== id);
          const result = resolveActiveSubject(id, filtered as Subject[]);
          return result === null;
        }
      )
    );
  });

  // Property: para qualquer subject presente no array, resolveActiveSubject retorna esse subject
  it('[PBT] id válido sempre retorna o subject correto', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ id: fc.uuid(), name: fc.string(), color: fc.string(), topics: fc.constant([] as Topic[]) }), { minLength: 1 }),
        fc.integer({ min: 0, max: 9 }),
        (subjects, idx) => {
          const target = subjects[idx % subjects.length];
          const result = resolveActiveSubject(target.id, subjects as Subject[]);
          return result?.id === target.id;
        }
      )
    );
  });
});

// ─── FocusModeContext ─────────────────────────────────────────────────────────

describe('FocusModeContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('estado inicial: isFocusMode=false, activeSubjectId=null', () => {
    const { result } = renderHook(() => useFocusMode(), { wrapper });
    expect(result.current.isFocusMode).toBe(false);
    expect(result.current.activeSubjectId).toBeNull();
  });

  it('enterFocusMode() seta isFocusMode=true', () => {
    const { result } = renderHook(() => useFocusMode(), { wrapper });
    act(() => { result.current.enterFocusMode(); });
    expect(result.current.isFocusMode).toBe(true);
  });

  it('enterFocusMode(id) persiste activeSubjectId', () => {
    const { result } = renderHook(() => useFocusMode(), { wrapper });
    act(() => { result.current.enterFocusMode('mat-123'); });
    expect(result.current.activeSubjectId).toBe('mat-123');
  });

  it('enterFocusMode() sem argumento seta activeSubjectId=null', () => {
    const { result } = renderHook(() => useFocusMode(), { wrapper });
    act(() => { result.current.enterFocusMode('mat-123'); });
    act(() => { result.current.enterFocusMode(); });
    expect(result.current.activeSubjectId).toBeNull();
  });

  it('exitFocusMode() seta isFocusMode=false', () => {
    const { result } = renderHook(() => useFocusMode(), { wrapper });
    act(() => { result.current.enterFocusMode('mat-abc'); });
    act(() => { result.current.exitFocusMode(); });
    expect(result.current.isFocusMode).toBe(false);
  });

  it('exitFocusMode() preserva activeSubjectId', () => {
    const { result } = renderHook(() => useFocusMode(), { wrapper });
    act(() => { result.current.enterFocusMode('mat-abc'); });
    act(() => { result.current.exitFocusMode(); });
    expect(result.current.activeSubjectId).toBe('mat-abc');
  });

  it('exitFocusMode() é idempotente quando já está inativo', () => {
    const { result } = renderHook(() => useFocusMode(), { wrapper });
    act(() => { result.current.exitFocusMode(); });
    expect(result.current.isFocusMode).toBe(false);
  });

  // Property: após qualquer sequência de enter/exit, isFocusMode reflete a última operação
  it('[PBT] sequência de enter/exit sempre resulta em estado consistente', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
        (ops) => {
          const { result } = renderHook(() => useFocusMode(), { wrapper });
          let lastOp = false;
          for (const enter of ops) {
            if (enter) {
              act(() => { result.current.enterFocusMode(); });
              lastOp = true;
            } else {
              act(() => { result.current.exitFocusMode(); });
              lastOp = false;
            }
          }
          return result.current.isFocusMode === lastOp;
        }
      )
    );
  });
});
