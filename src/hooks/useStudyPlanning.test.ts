import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { useStudyPlanning } from './useStudyPlanning';
import type { Subject, Topic } from '../utils/studyLogic';
import { makeDefaultSubjectPriority } from '../utils/plannerTypes';

// ─── localStorage mock ───────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (key: string) => store[key] ?? null,
    setItem:    (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear:      () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: Math.random().toString(36).slice(2),
    name: 'Tópico',
    isStudied: false,
    isExercisesDone: false,
    ...overrides,
  };
}

function makeSubject(id: string, overrides: Partial<Subject> = {}): Subject {
  return {
    id,
    name: `Matéria ${id}`,
    color: '#818cf8',
    topics: [makeTopic()],
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useStudyPlanning', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('inicializa com goal padrão', () => {
    const subjects = [makeSubject('s1')];
    const { result } = renderHook(() => useStudyPlanning(subjects));
    expect(result.current.goal.targetDate).toBe('2026-11-01');
    expect(result.current.goal.dailyHours).toHaveLength(7);
  });

  it('setTargetDate atualiza a data-alvo', () => {
    const subjects = [makeSubject('s1')];
    const { result } = renderHook(() => useStudyPlanning(subjects));
    act(() => { result.current.setTargetDate('2027-06-15'); });
    expect(result.current.goal.targetDate).toBe('2027-06-15');
  });

  it('setDailyHours aplica clamping automático', () => {
    const subjects = [makeSubject('s1')];
    const { result } = renderHook(() => useStudyPlanning(subjects));
    act(() => { result.current.setDailyHours(1, 20); });
    expect(result.current.goal.dailyHours[1]).toBe(12);
    act(() => { result.current.setDailyHours(2, -5); });
    expect(result.current.goal.dailyHours[2]).toBe(0);
  });

  it('setPriority atualiza a prioridade de uma matéria', () => {
    const subjects = [makeSubject('s1')];
    const { result } = renderHook(() => useStudyPlanning(subjects));
    act(() => { result.current.setPriority('s1', { priority: 'alta' }); });
    expect(result.current.priorities['s1']?.priority).toBe('alta');
  });

  it('schedule é gerado com 7 dias', () => {
    const subjects = [makeSubject('s1')];
    const { result } = renderHook(() => useStudyPlanning(subjects));
    expect(result.current.schedule).toHaveLength(7);
  });

  it('pace é calculado e tem status válido', () => {
    const subjects = [makeSubject('s1')];
    const { result } = renderHook(() => useStudyPlanning(subjects));
    const validStatuses = ['ok', 'warning', 'danger', 'completed', 'expired'];
    expect(validStatuses).toContain(result.current.pace.status);
  });

  // Feature: study-planning, Property 11: Deleted subject is removed from priorities
  it('P11 — matéria removida não aparece mais nas priorities', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 8 }).filter(s => /^[a-z0-9]+$/.test(s)),
          { minLength: 1, maxLength: 5 },
        ).map(ids => [...new Set(ids)]).filter(ids => ids.length >= 1),
        subjectIds => {
          localStorageMock.clear();
          const subjects = subjectIds.map(id => makeSubject(id));
          const { result } = renderHook(() => useStudyPlanning(subjects));

          // Remove a primeira matéria
          const removedId = subjectIds[0];
          const remaining = subjects.slice(1);
          const { result: result2 } = renderHook(() => useStudyPlanning(remaining));

          // A matéria removida não deve estar nas priorities
          expect(result2.current.priorities[removedId]).toBeUndefined();
          // Suprime warning de variável não usada
          void result;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: study-planning, Property 12: New subject gets default priority
  it('P12 — nova matéria é inicializada com prioridade média e dificuldade médio', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 8 }).filter(s => /^[a-z0-9]+$/.test(s)),
        newId => {
          localStorageMock.clear();
          const subjects = [makeSubject(newId)];
          const { result } = renderHook(() => useStudyPlanning(subjects));

          const expected = makeDefaultSubjectPriority(newId);
          expect(result.current.priorities[newId]?.priority).toBe(expected.priority);
          expect(result.current.priorities[newId]?.difficulty).toBe(expected.difficulty);
        },
      ),
      { numRuns: 100 },
    );
  });
});
