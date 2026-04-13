import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export interface UsePomodoroTimerReturn {
  minutes: number;
  seconds: number;
  isActive: boolean;
  mode: 'work' | 'break';
  sessionsCompleted: number;
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
export function usePomodoroTimer(): UsePomodoroTimerReturn {
  const [sessionsCompleted, setSessionsCompleted] = useLocalStorage<number>(
    'pomodoro-sessions-completed',
    0
  );

  // Estado React para re-render da UI
  const [minutes, setMinutes] = useState(WORK_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  // Refs para o estado interno — evitam closure stale dentro do setInterval
  const minutesRef = useRef(WORK_MINUTES);
  const secondsRef = useRef(0);
  const isActiveRef = useRef(false);
  const modeRef = useRef<'work' | 'break'>('work');
  const sessionsRef = useRef(sessionsCompleted);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sincronizar sessionsRef com o estado persistido
  useEffect(() => {
    sessionsRef.current = sessionsCompleted;
  }, [sessionsCompleted]);

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
      const newMinutes = newMode === 'work' ? WORK_MINUTES : BREAK_MINUTES;

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
    const resetMinutes = modeRef.current === 'work' ? WORK_MINUTES : BREAK_MINUTES;
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
    const newMinutes = newMode === 'work' ? WORK_MINUTES : BREAK_MINUTES;
    minutesRef.current = newMinutes;
    secondsRef.current = 0;
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMinutes);
    setSeconds(0);
  }, [clearTimer]);

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // progress: percentual do tempo decorrido (0 = início, 100 = fim)
  const totalSeconds = mode === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60;
  const elapsedSeconds = totalSeconds - (minutes * 60 + seconds);
  const progress = Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));

  return {
    minutes,
    seconds,
    isActive,
    mode,
    sessionsCompleted,
    start,
    pause,
    reset,
    switchMode,
    formattedTime,
    progress,
  };
}
