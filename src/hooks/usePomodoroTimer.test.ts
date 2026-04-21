import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as React from 'react';
import { usePomodoroTimer } from './usePomodoroTimer';
import { AuthProvider } from '../context/AuthContext';

// Mock localStorage
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

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: class {
    static permission = 'denied';
    static requestPermission = vi.fn().mockResolvedValue('denied');
    constructor(_title: string, _opts?: NotificationOptions) {}
  },
  writable: true,
});

// Mock Supabase auth
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({}),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
    }),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

describe('usePomodoroTimer', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inicia com valores padrão corretos', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    expect(result.current.minutes).toBe(25);
    expect(result.current.seconds).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(result.current.mode).toBe('work');
    expect(result.current.sessionsCompleted).toBe(0);
    expect(result.current.formattedTime).toBe('25:00');
    expect(result.current.progress).toBe(0);
  });

  it('start() ativa o timer', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.start(); });
    expect(result.current.isActive).toBe(true);
  });

  it('pause() pausa o timer', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.start(); });
    act(() => { result.current.pause(); });
    expect(result.current.isActive).toBe(false);
  });

  it('decrementa segundos a cada tick', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.seconds).toBe(59);
    expect(result.current.minutes).toBe(24);
  });

  it('decrementa minutos quando segundos chegam a zero', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.start(); });
    // Avança 60 segundos
    act(() => { vi.advanceTimersByTime(60000); });
    expect(result.current.minutes).toBe(24);
    expect(result.current.seconds).toBe(0);
  });

  it('reset() para o timer e restaura o tempo do modo atual', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(5000); });
    act(() => { result.current.reset(); });
    expect(result.current.isActive).toBe(false);
    expect(result.current.minutes).toBe(25);
    expect(result.current.seconds).toBe(0);
  });

  it('switchMode() alterna para break com 5 minutos', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.switchMode('break'); });
    expect(result.current.mode).toBe('break');
    expect(result.current.minutes).toBe(5);
    expect(result.current.seconds).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it('switchMode() alterna de volta para work com 25 minutos', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.switchMode('break'); });
    act(() => { result.current.switchMode('work'); });
    expect(result.current.mode).toBe('work');
    expect(result.current.minutes).toBe(25);
  });

  it('ao chegar a zero no modo work: incrementa sessionsCompleted, muda para break, isActive = false', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.start(); });
    // Precisa de totalSeconds + 1 ticks: os primeiros totalSeconds decrementam até 00:00,
    // o tick extra detecta 00:00 e faz a transição
    act(() => {
      for (let i = 0; i < 25 * 60 + 1; i++) {
        vi.advanceTimersByTime(1000);
      }
    });
    expect(result.current.isActive).toBe(false);
    expect(result.current.mode).toBe('break');
    expect(result.current.minutes).toBe(5);
    expect(result.current.seconds).toBe(0);
    expect(result.current.sessionsCompleted).toBe(1);
  });

  it('ao chegar a zero no modo break: muda para work, isActive = false, não incrementa sessões', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.switchMode('break'); });
    act(() => { result.current.start(); });
    act(() => {
      for (let i = 0; i < 5 * 60 + 1; i++) {
        vi.advanceTimersByTime(1000);
      }
    });
    expect(result.current.isActive).toBe(false);
    expect(result.current.mode).toBe('work');
    expect(result.current.minutes).toBe(25);
    expect(result.current.sessionsCompleted).toBe(0);
  });

  it('formattedTime retorna formato MM:SS com zero-padding', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    expect(result.current.formattedTime).toBe('25:00');
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.formattedTime).toBe('24:59');
  });

  it('progress começa em 0 e aumenta conforme o tempo passa', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    expect(result.current.progress).toBe(0);
    act(() => { result.current.start(); });
    // Avança metade do tempo de trabalho (12.5 min)
    act(() => { vi.advanceTimersByTime(12.5 * 60 * 1000); });
    expect(result.current.progress).toBeGreaterThan(49);
    expect(result.current.progress).toBeLessThan(51);
  });

  it('progress está sempre entre 0 e 100', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(30 * 60 * 1000); });
    expect(result.current.progress).toBeGreaterThanOrEqual(0);
    expect(result.current.progress).toBeLessThanOrEqual(100);
  });

  it('reset no modo break restaura 5 minutos', () => {
    const { result } = renderHook(() => usePomodoroTimer(), { wrapper });
    act(() => { result.current.switchMode('break'); });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { result.current.reset(); });
    expect(result.current.minutes).toBe(5);
    expect(result.current.seconds).toBe(0);
    expect(result.current.isActive).toBe(false);
  });
});
