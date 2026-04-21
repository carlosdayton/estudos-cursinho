import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { advanceCycleState } from '../utils/cycleLogic';
import type { StudyCycle, ActiveCycleState } from '../utils/studyLogic';

interface DbActiveCycle {
  id: string;
  user_id: string;
  cycle_id: string;
  current_index: number;
  pomodoros_in_current_subject: number;
  is_completed: boolean;
  started_at: string;
  updated_at: string;
}

function toActiveState(db: DbActiveCycle): ActiveCycleState {
  return {
    cycleId: db.cycle_id,
    currentIndex: db.current_index,
    pomodorosInCurrentSubject: db.pomodoros_in_current_subject,
    isCompleted: db.is_completed,
    startedAt: db.started_at,
  };
}

export interface UseActiveCycleReturn {
  activeCycleState: ActiveCycleState | null;
  loading: boolean;
  startCycle: (cycle: StudyCycle) => Promise<void>;
  advanceToNextSubject: (cycle: StudyCycle) => Promise<{
    nextSubjectId: string | null;
    isCompleted: boolean;
    subjectChanged: boolean;
  }>;
  clearCycle: () => Promise<void>;
}

export function useActiveCycle(): UseActiveCycleReturn {
  const { user } = useAuth();
  const [activeCycleState, setActiveCycleState] = useState<ActiveCycleState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('active_cycle_states')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!error && data) {
      setActiveCycleState(toActiveState(data as DbActiveCycle));
    } else {
      setActiveCycleState(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const saveState = useCallback(async (state: ActiveCycleState | null) => {
    if (!user) return;
    if (state === null) {
      await supabase.from('active_cycle_states').delete().eq('user_id', user.id);
      setActiveCycleState(null);
      return;
    }
    const { data, error } = await supabase
      .from('active_cycle_states')
      .upsert({
        user_id: user.id,
        cycle_id: state.cycleId,
        current_index: state.currentIndex,
        pomodoros_in_current_subject: state.pomodorosInCurrentSubject,
        is_completed: state.isCompleted,
        started_at: state.startedAt,
      }, { onConflict: 'user_id' })
      .select()
      .single();
    if (!error && data) {
      setActiveCycleState(toActiveState(data as DbActiveCycle));
    }
  }, [user]);

  const startCycle = useCallback(
    async (cycle: StudyCycle) => {
      const state: ActiveCycleState = {
        cycleId: cycle.id,
        currentIndex: 0,
        pomodorosInCurrentSubject: 0,
        isCompleted: false,
        startedAt: new Date().toISOString(),
      };
      await saveState(state);
    },
    [saveState]
  );

  const advanceToNextSubject = useCallback(
    async (cycle: StudyCycle): Promise<{ nextSubjectId: string | null; isCompleted: boolean; subjectChanged: boolean }> => {
      if (!activeCycleState) return { nextSubjectId: null, isCompleted: false, subjectChanged: false };
      const result = advanceCycleState(activeCycleState, cycle);
      await saveState(result.nextState);
      return {
        nextSubjectId: result.nextSubjectId,
        isCompleted: result.isCompleted,
        subjectChanged: result.subjectChanged,
      };
    },
    [activeCycleState, saveState]
  );

  const clearCycle = useCallback(async () => {
    await saveState(null);
  }, [saveState]);

  return { activeCycleState, loading, startCycle, advanceToNextSubject, clearCycle };
}
