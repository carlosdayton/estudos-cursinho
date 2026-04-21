import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  daysUntil,
  clampHours,
  weeklyTotal,
  generateSchedule,
  calculatePace,
} from './plannerEngine';
import type { Subject, Topic } from './studyLogic';
import type { StudyGoal, SubjectPriorityMap } from './plannerTypes';
import { makeDefaultSubjectPriority } from './plannerTypes';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: Math.random().toString(36).slice(2),
    name: 'Tópico',
    isStudied: false,
    isExercisesDone: false,
    ...overrides,
  };
}

function makeSubject(overrides: Partial<Subject> = {}): Subject {
  return {
    id: Math.random().toString(36).slice(2),
    name: 'Matéria',
    color: '#818cf8',
    topics: [makeTopic()],
    ...overrides,
  };
}

function makeGoal(overrides: Partial<StudyGoal> = {}): StudyGoal {
  return {
    targetDate: '2030-01-01',
    dailyHours: [0, 2, 2, 2, 2, 2, 3],
    ...overrides,
  };
}

// Gera uma data futura no formato YYYY-MM-DD
const futureDateArb = fc.integer({ min: 1, max: 3650 }).map(days => {
  const d = new Date('2025-01-01T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().substring(0, 10);
});

// Gera uma data passada ou hoje
const pastOrTodayDateArb = fc.integer({ min: 0, max: 3650 }).map(days => {
  const d = new Date('2025-01-01T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().substring(0, 10);
});

const today = '2025-01-01';

// ─── P1: Countdown futuro ────────────────────────────────────────────────────

describe('daysUntil', () => {
  // Feature: study-planning, Property 1: For any future date, daysUntil returns a positive integer
  it('P1 — retorna valor positivo para datas futuras', () => {
    fc.assert(
      fc.property(futureDateArb, targetDate => {
        const result = daysUntil(targetDate, today);
        expect(result).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  // Feature: study-planning, Property 2: For any past or present date, daysUntil returns <= 0
  it('P2 — retorna valor <= 0 para datas passadas ou hoje', () => {
    fc.assert(
      fc.property(pastOrTodayDateArb, targetDate => {
        const result = daysUntil(targetDate, today);
        expect(result).toBeLessThanOrEqual(0);
      }),
      { numRuns: 200 },
    );
  });

  it('retorna 0 para hoje', () => {
    expect(daysUntil(today, today)).toBe(0);
  });

  it('retorna 1 para amanhã', () => {
    expect(daysUntil('2025-01-02', today)).toBe(1);
  });

  it('retorna -Infinity para data inválida', () => {
    expect(daysUntil('not-a-date', today)).toBe(-Infinity);
  });
});

// ─── P3: Clamping horas [0, 12] ──────────────────────────────────────────────

describe('clampHours', () => {
  // Feature: study-planning, Property 3: For any input, clampHours returns value in [0, 12]
  it('P3 — sempre retorna valor no intervalo [0, 12]', () => {
    fc.assert(
      fc.property(fc.float({ min: -100, max: 100 }), value => {
        const result = clampHours(value);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(12);
      }),
      { numRuns: 200 },
    );
  });

  it('clamp de valor acima de 12 retorna 12', () => {
    expect(clampHours(13)).toBe(12);
    expect(clampHours(100)).toBe(12);
  });

  it('clamp de valor negativo retorna 0', () => {
    expect(clampHours(-1)).toBe(0);
    expect(clampHours(-100)).toBe(0);
  });

  it('valores dentro do intervalo são preservados', () => {
    expect(clampHours(0)).toBe(0);
    expect(clampHours(6)).toBe(6);
    expect(clampHours(12)).toBe(12);
  });
});

// ─── P4: Total semanal = soma ────────────────────────────────────────────────

describe('weeklyTotal', () => {
  // Feature: study-planning, Property 4: weeklyTotal equals sum of all 7 values
  it('P4 — total semanal é igual à soma dos 7 valores', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 12 }), { minLength: 7, maxLength: 7 }),
        hours => {
          const expected = hours.reduce((a, b) => a + b, 0);
          expect(weeklyTotal(hours)).toBe(expected);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('retorna 0 para array de zeros', () => {
    expect(weeklyTotal([0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });

  it('retorna 84 para array de 12s', () => {
    expect(weeklyTotal([12, 12, 12, 12, 12, 12, 12])).toBe(84);
  });
});

// ─── P5: Dias com 0h não têm alocações ──────────────────────────────────────

describe('generateSchedule — dias com 0 horas', () => {
  // Feature: study-planning, Property 5: Days with 0 hours have no allocations
  it('P5 — dias com 0 horas têm allocations vazio', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 12 }), { minLength: 7, maxLength: 7 }),
        dailyHours => {
          const subjects = [makeSubject()];
          const goal = makeGoal({ dailyHours });
          const priorities: SubjectPriorityMap = {
            [subjects[0].id]: makeDefaultSubjectPriority(subjects[0].id),
          };
          const schedule = generateSchedule(subjects, goal, priorities);
          for (const day of schedule) {
            if (day.availableHours === 0) {
              expect(day.allocations).toHaveLength(0);
            }
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ─── P6: Matérias concluídas excluídas do schedule ──────────────────────────

describe('generateSchedule — matérias concluídas', () => {
  // Feature: study-planning, Property 6: Fully completed subjects are excluded from schedule
  it('P6 — matéria com todos os tópicos concluídos não aparece no schedule', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            isStudied: fc.boolean(),
            isExercisesDone: fc.boolean(),
          }),
          { minLength: 1, maxLength: 5 },
        ),
        topicStates => {
          const completedSubject = makeSubject({
            id: 'completed-sub',
            topics: topicStates.map(_s => makeTopic({ isStudied: true, isExercisesDone: true })),
          });
          const activeSubject = makeSubject({ id: 'active-sub' });
          const subjects = [completedSubject, activeSubject];
          const goal = makeGoal({ dailyHours: [2, 2, 2, 2, 2, 2, 2] });
          const priorities: SubjectPriorityMap = {
            'completed-sub': makeDefaultSubjectPriority('completed-sub'),
            'active-sub':    makeDefaultSubjectPriority('active-sub'),
          };
          const schedule = generateSchedule(subjects, goal, priorities);
          for (const day of schedule) {
            for (const alloc of day.allocations) {
              expect(alloc.subjectId).not.toBe('completed-sub');
            }
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ─── P7: Proporção 3:2:1 ────────────────────────────────────────────────────

describe('generateSchedule — proporção 3:2:1', () => {
  // Feature: study-planning, Property 7: Priority allocation ratio is approximately 3:2:1
  it('P7 — matéria alta recebe mais horas que média, que recebe mais que baixa', () => {
    const subjectAlta  = makeSubject({ id: 'alta',  name: 'Alta'  });
    const subjectMedia = makeSubject({ id: 'media', name: 'Média' });
    const subjectBaixa = makeSubject({ id: 'baixa', name: 'Baixa' });
    const subjects = [subjectAlta, subjectMedia, subjectBaixa];

    const priorities: SubjectPriorityMap = {
      alta:  { subjectId: 'alta',  priority: 'alta',  difficulty: 'médio' },
      media: { subjectId: 'media', priority: 'média', difficulty: 'médio' },
      baixa: { subjectId: 'baixa', priority: 'baixa', difficulty: 'médio' },
    };

    // Usa muitas horas para minimizar efeito de arredondamento
    const goal = makeGoal({ dailyHours: [6, 6, 6, 6, 6, 6, 6] });
    const schedule = generateSchedule(subjects, goal, priorities);

    let totalAlta = 0, totalMedia = 0, totalBaixa = 0;
    for (const day of schedule) {
      for (const alloc of day.allocations) {
        if (alloc.subjectId === 'alta')  totalAlta  += alloc.hours;
        if (alloc.subjectId === 'media') totalMedia += alloc.hours;
        if (alloc.subjectId === 'baixa') totalBaixa += alloc.hours;
      }
    }

    expect(totalAlta).toBeGreaterThan(totalMedia);
    expect(totalMedia).toBeGreaterThan(totalBaixa);
    expect(totalBaixa).toBeGreaterThan(0);
  });
});

// ─── P8: Fórmula PaceIndicator ───────────────────────────────────────────────

describe('calculatePace', () => {
  // Feature: study-planning, Property 8: PaceIndicator formula is correct
  it('P8 — topicsPerStudyDay = remainingTopics / studyDaysLeft (arredondado a 2 casas)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),  // remainingTopics
        fc.integer({ min: 1, max: 7 }),   // horas por dia (> 0 para ter dias de estudo)
        (topicCount, hoursPerDay) => {
          const topics = Array.from({ length: topicCount }, () => makeTopic());
          const subject = makeSubject({ topics });
          const goal = makeGoal({
            targetDate: '2030-01-01',
            dailyHours: Array(7).fill(hoursPerDay),
          });
          const pace = calculatePace([subject], goal, today);

          if (pace.status === 'expired' || pace.status === 'completed') return;

          const expected = Math.round((pace.remainingTopics / pace.studyDaysLeft) * 100) / 100;
          expect(pace.topicsPerStudyDay).toBe(expected);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('retorna status expired quando data já passou', () => {
    const subject = makeSubject();
    const goal = makeGoal({ targetDate: '2020-01-01' });
    const pace = calculatePace([subject], goal, today);
    expect(pace.status).toBe('expired');
  });

  it('retorna status completed quando não há tópicos restantes', () => {
    const subject = makeSubject({
      topics: [makeTopic({ isStudied: true, isExercisesDone: true })],
    });
    const goal = makeGoal();
    const pace = calculatePace([subject], goal, today);
    expect(pace.status).toBe('completed');
  });

  it('retorna status ok quando ritmo é baixo (≤ 3 tópicos/dia)', () => {
    // 3 tópicos, muitos dias de estudo → pace baixo
    const subject = makeSubject({ topics: [makeTopic(), makeTopic(), makeTopic()] });
    const goal = makeGoal({ targetDate: '2030-01-01', dailyHours: [2, 2, 2, 2, 2, 2, 2] });
    const pace = calculatePace([subject], goal, today);
    expect(pace.status).toBe('ok');
  });

  it('retorna status danger quando ritmo é alto (> 6 tópicos/dia)', () => {
    // 1000 tópicos, poucos dias → pace alto
    const topics = Array.from({ length: 1000 }, () => makeTopic());
    const subject = makeSubject({ topics });
    const goal = makeGoal({ targetDate: '2025-01-08', dailyHours: [2, 2, 2, 2, 2, 2, 2] });
    const pace = calculatePace([subject], goal, today);
    expect(pace.status).toBe('danger');
  });
});

// ─── P9: Round-trip StudyGoal ────────────────────────────────────────────────

describe('StudyGoal round-trip', () => {
  // Feature: study-planning, Property 9: StudyGoal serialization round-trip
  it('P9 — serializar e desserializar StudyGoal produz objeto equivalente', () => {
    fc.assert(
      fc.property(
        fc.record({
          targetDate: fc.integer({ min: new Date('2025-01-01').getTime(), max: new Date('2030-12-31').getTime() })
            .map(ts => new Date(ts).toISOString().substring(0, 10)),
          dailyHours: fc.array(fc.integer({ min: 0, max: 12 }), { minLength: 7, maxLength: 7 }),
        }),
        (goal: StudyGoal) => {
          const serialized = JSON.stringify(goal);
          const deserialized: StudyGoal = JSON.parse(serialized);
          expect(deserialized.targetDate).toBe(goal.targetDate);
          expect(deserialized.dailyHours).toEqual(goal.dailyHours);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ─── P10: Round-trip SubjectPriorityMap ──────────────────────────────────────

describe('SubjectPriorityMap round-trip', () => {
  // Feature: study-planning, Property 10: SubjectPriorityMap serialization round-trip
  it('P10 — serializar e desserializar SubjectPriorityMap produz mapa equivalente', () => {
    const priorityArb = fc.constantFrom('baixa', 'média', 'alta') as fc.Arbitrary<'baixa' | 'média' | 'alta'>;
    const difficultyArb = fc.constantFrom('fácil', 'médio', 'difícil') as fc.Arbitrary<'fácil' | 'médio' | 'difícil'>;

    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subjectId: fc.string({ minLength: 1, maxLength: 10 }),
            priority: priorityArb,
            difficulty: difficultyArb,
          }),
          { minLength: 0, maxLength: 10 },
        ),
        entries => {
          const map: SubjectPriorityMap = {};
          for (const e of entries) map[e.subjectId] = e;
          const serialized = JSON.stringify(map);
          const deserialized: SubjectPriorityMap = JSON.parse(serialized);
          expect(deserialized).toEqual(map);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ─── Edge cases ──────────────────────────────────────────────────────────────

describe('generateSchedule — edge cases', () => {
  it('retorna schedule vazio (sem alocações) quando subjects está vazio', () => {
    const goal = makeGoal({ dailyHours: [2, 2, 2, 2, 2, 2, 2] });
    const schedule = generateSchedule([], goal, {});
    expect(schedule).toHaveLength(7);
    for (const day of schedule) {
      expect(day.allocations).toHaveLength(0);
    }
  });

  it('retorna schedule sem alocações quando todas as horas são 0', () => {
    const subject = makeSubject();
    const goal = makeGoal({ dailyHours: [0, 0, 0, 0, 0, 0, 0] });
    const priorities: SubjectPriorityMap = { [subject.id]: makeDefaultSubjectPriority(subject.id) };
    const schedule = generateSchedule([subject], goal, priorities);
    for (const day of schedule) {
      expect(day.allocations).toHaveLength(0);
    }
  });

  it('retorna schedule sem alocações quando todos os tópicos estão concluídos', () => {
    const subject = makeSubject({
      topics: [makeTopic({ isStudied: true, isExercisesDone: true })],
    });
    const goal = makeGoal({ dailyHours: [2, 2, 2, 2, 2, 2, 2] });
    const priorities: SubjectPriorityMap = { [subject.id]: makeDefaultSubjectPriority(subject.id) };
    const schedule = generateSchedule([subject], goal, priorities);
    for (const day of schedule) {
      expect(day.allocations).toHaveLength(0);
    }
  });
});
