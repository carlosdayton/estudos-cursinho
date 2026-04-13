import { describe, it, expect } from 'vitest'
import { getProgress, calculateStudyStreak } from '../utils/studyLogic'

describe('Sanity check — setup de testes', () => {
  it('getProgress retorna 0 para matéria sem tópicos', () => {
    const subject = { id: '1', name: 'Teste', color: '#fff', topics: [] }
    expect(getProgress(subject)).toBe(0)
  })

  it('calculateStudyStreak retorna 0 sem tópicos concluídos', () => {
    expect(calculateStudyStreak([])).toBe(0)
  })

  it('ambiente de testes está funcionando', () => {
    expect(1 + 1).toBe(2)
  })
})
