import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

export const WORK_DURATION_OPTIONS = [1, 5, 10, 15, 20, 25, 30, 45, 50, 60];
export const BREAK_DURATION_OPTIONS = [1, 3, 5, 10, 15, 20];

export interface UsePomodoroTimerOptions {
  onFocusSessionComplete?: () => void;
}

export interface UsePomodoroTimerReturn {
  minutes: number;
  seconds: number;
  isActive: boolean;
  mode: 'work' | 'break';
  sessionsCompleted: number;
  workMinutes: number;
  breakMinutes: number;
  setWorkMinutes: (m: number) => void;
  setBreakMinutes: (m: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  switchMode: (mode: 'work' | 'break') => void;
  formattedTime: string;
  progress: number;
}

function triggerNotification(completedMode: 'work' | 'break') {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const message =
    completedMode === 'work'
      ? 'Sessão de foco concluída! Hora de descansar.'
      : 'Pausa encerrada! Hora de focar.';

  new Notification('Foco ENEM — Pomodoro', { body: message });
}

/**
 * Hook para gerenciar o temporizador Pomodoro.
 * Usa useRef para o setInterval e para o estado interno, evitando closure stale.
 * Persiste sessionsCompleted no localStorage.
 */
export function usePomodoroTimer(options?: UsePomodoroTimerOptions): UsePomodoroTimerReturn {
  const onFocusSessionCompleteRef = useRef(options?.onFocusSessionComplete);
  const [sessionsCompleted, setSessionsCompleted] = useLocalStorage<number>(
    'pomodoro-sessions-completed',
    0
  );
  const [workMinutes, setWorkMinutesPersisted] = useLocalStorage<number>(
    'pomodoro-work-minutes',
    DEFAULT_WORK_MINUTES
  );
  const [breakMinutes, setBreakMinutesPersisted] = useLocalStorage<number>(
    'pomodoro-break-minutes',
    DEFAULT_BREAK_MINUTES
  );

  // Estado React para re-render da UI
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  // Refs para o estado interno — evitam closure stale dentro do setInterval
  const minutesRef = useRef(workMinutes);
  const secondsRef = useRef(0);
  const isActiveRef = useRef(false);
  const modeRef = useRef<'work' | 'break'>('work');
  const sessionsRef = useRef(sessionsCompleted);
  const workMinutesRef = useRef(workMinutes);
  const breakMinutesRef = useRef(breakMinutes);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sincronizar refs com estado persistido
  useEffect(() => { sessionsRef.current = sessionsCompleted; }, [sessionsCompleted]);
  useEffect(() => { workMinutesRef.current = workMinutes; }, [workMinutes]);
  useEffect(() => { breakMinutesRef.current = breakMinutes; }, [breakMinutes]);

  // Manter ref do callback atualizada sem re-criar o interval
  useEffect(() => {
    onFocusSessionCompleteRef.current = options?.onFocusSessionComplete;
  });

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      // Verificar via ref se ainda está ativo
      if (!isActiveRef.current) {
        clearTimer();
        return;
      }

      if (secondsRef.current > 0) {
        secondsRef.current -= 1;
        setSeconds(secondsRef.current);
        return;
      }

      if (minutesRef.current > 0) {
        minutesRef.current -= 1;
        secondsRef.current = 59;
        setMinutes(minutesRef.current);
        setSeconds(59);
        return;
      }

      // Timer chegou a zero — parar imediatamente
      clearTimer();
      isActiveRef.current = false;
      setIsActive(false);

      const completedMode = modeRef.current;
      const newMode: 'work' | 'break' = completedMode === 'work' ? 'break' : 'work';
      const newMinutes = newMode === 'work' ? workMinutesRef.current : breakMinutesRef.current;

      modeRef.current = newMode;
      minutesRef.current = newMinutes;
      secondsRef.current = 0;

      setMode(newMode);
      setMinutes(newMinutes);
      setSeconds(0);

      // Incrementar sessões se era modo work
      if (completedMode === 'work') {
        const newCount = sessionsRef.current + 1;
        sessionsRef.current = newCount;
        setSessionsCompleted(newCount);
        // Disparar callback de ciclo
        onFocusSessionCompleteRef.current?.();
      }

      // Disparar notificação
      triggerNotification(completedMode);
    }, 1000);
  }, [clearTimer, setSessionsCompleted]);

  // Solicitar permissão de notificação na montagem
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    return clearTimer;
  }, [clearTimer]);

  const start = useCallback(() => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    setIsActive(true);
    startInterval();
  }, [startInterval]);

  const pause = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    isActiveRef.current = false;
    const resetMinutes = modeRef.current === 'work' ? workMinutesRef.current : breakMinutesRef.current;
    minutesRef.current = resetMinutes;
    secondsRef.current = 0;
    setIsActive(false);
    setMinutes(resetMinutes);
    setSeconds(0);
  }, [clearTimer]);

  const switchMode = useCallback((newMode: 'work' | 'break') => {
    clearTimer();
    isActiveRef.current = false;
    modeRef.current = newMode;
    const newMinutes = newMode === 'work' ? workMinutesRef.current : breakMinutesRef.current;
    minutesRef.current = newMinutes;
    secondsRef.current = 0;
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMinutes);
    setSeconds(0);
  }, [clearTimer]);

  // Mudar duração do foco — para o timer e aplica imediatamente
  const setWorkMinutes = useCallback((m: number) => {
    const clamped = Math.max(1, Math.min(60, m));
    setWorkMinutesPersisted(clamped);
    workMinutesRef.current = clamped;
    if (modeRef.current === 'work') {
      clearTimer();
      isActiveRef.current = false;
      minutesRef.current = clamped;
      secondsRef.current = 0;
      setIsActive(false);
      setMinutes(clamped);
      setSeconds(0);
    }
  }, [clearTimer, setWorkMinutesPersisted]);

  // Mudar duração da pausa — para o timer e aplica imediatamente
  const setBreakMinutes = useCallback((m: number) => {
    const clamped = Math.max(1, Math.min(30, m));
    setBreakMinutesPersisted(clamped);
    breakMinutesRef.current = clamped;
    if (modeRef.current === 'break') {
      clearTimer();
      isActiveRef.current = false;
      minutesRef.current = clamped;
      secondsRef.current = 0;
      setIsActive(false);
      setMinutes(clamped);
      setSeconds(0);
    }
  }, [clearTimer, setBreakMinutesPersisted]);

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // progress: percentual do tempo decorrido (0 = início, 100 = fim)
  const totalSeconds = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const elapsedSeconds = totalSeconds - (minutes * 60 + seconds);
  const progress = Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));

  return {
    minutes,
    seconds,
    isActive,
    mode,
    sessionsCompleted,
    workMinutes,
    breakMinutes,
    setWorkMinutes,
    setBreakMinutes,
    start,
    pause,
    reset,
    switchMode,
    formattedTime,
    progress,
  };
}
