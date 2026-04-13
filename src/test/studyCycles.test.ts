import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { advanceCycleState, validateCycle } from '../utils/cycleLogic';
import type { ActiveCycleState, StudyCycle } from '../utils/studyLogic';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCycle(subjectIds: string[], loop = false, pomodorosPerSubject = 1): StudyCycle {
  return {
    id: 'cycle-1',
    name: 'Ciclo Teste',
    subjectIds,
    loop,
    pomodorosPerSubject,
    createdAt: new Date().toISOString(),
  };
}

function makeState(currentIndex: number, isCompleted = false, pomodorosInCurrentSubject = 0): ActiveCycleState {
  return {
    cycleId: 'cycle-1',
    currentIndex,
    pomodorosInCurrentSubject,
    isCompleted,
    startedAt: new Date().toISOString(),
  };
}

// ─── advanceCycleState ────────────────────────────────────────────────────────

describe('advanceCycleState', () => {
  it('avança para o próximo índice quando há matérias restantes', () => {
    const cycle = makeCycle(['a', 'b', 'c']);
    const state = makeState(0);
    const result = advanceCycleState(state, cycle);

    expect(result.nextState.currentIndex).toBe(1);
    expect(result.nextSubjectId).toBe('b');
    expect(result.isCompleted).toBe(false);
  });

  it('avança do meio para o fim sem completar', () => {
    const cycle = makeCycle(['a', 'b', 'c']);
    const state = makeState(1);
    const result = advanceCycleState(state, cycle);

    expect(result.nextState.currentIndex).toBe(2);
    expect(result.nextSubjectId).toBe('c');
    expect(result.isCompleted).toBe(false);
  });

  it('marca como concluído ao passar do último item sem loop', () => {
    const cycle = makeCycle(['a', 'b', 'c'], false);
    const state = makeState(2); // último índice
    const result = advanceCycleState(state, cycle);

    expect(result.isCompleted).toBe(true);
    expect(result.nextSubjectId).toBeNull();
    expect(result.nextState.isCompleted).toBe(true);
  });

  it('reinicia do índice 0 ao passar do último item com loop', () => {
    const cycle = makeCycle(['a', 'b', 'c'], true);
    const state = makeState(2); // último índice
    const result = advanceCycleState(state, cycle);

    expect(result.isCompleted).toBe(false);
    expect(result.nextState.currentIndex).toBe(0);
    expect(result.nextSubjectId).toBe('a');
  });

  it('ciclo com 2 matérias: avança de 0 para 1', () => {
    const cycle = makeCycle(['x', 'y']);
    const state = makeState(0);
    const result = advanceCycleState(state, cycle);

    expect(result.nextState.currentIndex).toBe(1);
    expect(result.nextSubjectId).toBe('y');
    expect(result.isCompleted).toBe(false);
  });

  it('ciclo com 2 matérias: completa ao avançar do índice 1 sem loop', () => {
    const cycle = makeCycle(['x', 'y'], false);
    const state = makeState(1);
    const result = advanceCycleState(state, cycle);

    expect(result.isCompleted).toBe(true);
  });

  it('não muta o estado original', () => {
    const cycle = makeCycle(['a', 'b', 'c']);
    const state = makeState(0);
    const originalIndex = state.currentIndex;
    advanceCycleState(state, cycle);

    expect(state.currentIndex).toBe(originalIndex);
  });
});

// ─── validateCycle ────────────────────────────────────────────────────────────

describe('validateCycle', () => {
  it('retorna null para ciclo válido', () => {
    expect(validateCycle('Ciclo Exatas', ['a', 'b'])).toBeNull();
  });

  it('retorna erro para nome vazio', () => {
    expect(validateCycle('', ['a', 'b'])).toBeTruthy();
  });

  it('retorna erro para nome só com espaços', () => {
    expect(validateCycle('   ', ['a', 'b'])).toBeTruthy();
  });

  it('retorna erro para nome com mais de 50 caracteres', () => {
    expect(validateCycle('a'.repeat(51), ['a', 'b'])).toBeTruthy();
  });

  it('retorna erro para menos de 2 matérias', () => {
    expect(validateCycle('Ciclo', ['a'])).toBeTruthy();
    expect(validateCycle('Ciclo', [])).toBeTruthy();
  });

  it('retorna erro para matérias duplicadas', () => {
    expect(validateCycle('Ciclo', ['a', 'a', 'b'])).toBeTruthy();
  });

  it('aceita exatamente 2 matérias', () => {
    expect(validateCycle('Ciclo', ['a', 'b'])).toBeNull();
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe('advanceCycleState — propriedades', () => {
  it('após N avanços sem loop, ciclo está concluído (N = total de matérias)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 8 }),
        (ids) => {
          // Remover duplicatas para garantir IDs únicos
          const uniqueIds = [...new Set(ids)];
          if (uniqueIds.length < 2) return true; // skip

          const cycle = makeCycle(uniqueIds, false);
          let state = makeState(0);

          for (let i = 0; i < uniqueIds.length; i++) {
            const result = advanceCycleState(state, cycle);
            state = result.nextState;
          }

          return state.isCompleted === true;
        }
      )
    );
  });

  it('com loop, currentIndex sempre está em [0, N-1] após qualquer número de avanços', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 6 }),
        fc.integer({ min: 1, max: 20 }),
        (ids, advances) => {
          const uniqueIds = [...new Set(ids)];
          if (uniqueIds.length < 2) return true;

          const cycle = makeCycle(uniqueIds, true);
          let state = makeState(0);

          for (let i = 0; i < advances; i++) {
            const result = advanceCycleState(state, cycle);
            state = result.nextState;
          }

          return state.currentIndex >= 0 && state.currentIndex < uniqueIds.length;
        }
      )
    );
  });

  it('nextSubjectId sempre corresponde a subjectIds[nextState.currentIndex] quando não concluído', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 8 }),
        fc.boolean(),
        (ids, loop) => {
          const uniqueIds = [...new Set(ids)];
          if (uniqueIds.length < 2) return true;

          const cycle = makeCycle(uniqueIds, loop);
          const state = makeState(0);
          const result = advanceCycleState(state, cycle);

          if (result.isCompleted) return true;
          return result.nextSubjectId === uniqueIds[result.nextState.currentIndex];
        }
      )
    );
  });
});
