/**
 * Interface que define a estrutura de um tópico de estudo dentro de uma matéria.
 */
export interface Topic {
  id: string;          // Identificador único do tópico
  name: string;        // Nome do tópico (ex: "Equações do 2º Grau")
  isStudied: boolean;  // Indica se a teoria já foi lida/estudada
  isExercisesDone: boolean; // Indica se os exercícios foram realizados
  completedAt?: string; // Data (formato ISO) em que o tópico foi concluído
  reviewDate?: string;   // Data sugerida para a próxima revisão
  notes?: string;        // Notas de estudo sobre o tópico
  difficulty?: 'easy' | 'medium' | 'hard'; // Dificuldade percebida pelo aluno
  reviewCount?: number;  // Número de revisões realizadas
  lastReviewedAt?: string; // Última data de revisão efetiva (formato ISO)
}

/**
 * Interface que define o conjunto de tópicos que compõem uma matéria.
 */
export interface Subject {
  id: string;          // Identificador único da matéria
  name: string;        // Nome da matéria (ex: "Matemática")
  color: string;       // Cor hexadecimal para identificação visual
  topics: Topic[];     // Lista de tópicos pertencentes a esta matéria
  icon?: string;       // Nome do ícone Lucide customizável
  order?: number;      // Ordem de exibição
  targetTopics?: number; // Meta de tópicos a concluir
}

/**
 * Interface que define os scores por área de conhecimento de um Simulado.
 */
export interface SimuladoScores {
  linguagens: number;
  humanas: number;
  natureza: number;
  matematica: number;
  redacao: number;
}

/**
 * Interface que define a estrutura de um Simulado realizado.
 */
export interface Simulado {
  id: string;
  date: string;
  scores: SimuladoScores;
  total: number;
  label?: string; // Nome/identificação do simulado
  notes?: string; // Notas sobre o simulado
}

/**
 * Interface de configurações globais da aplicação.
 */
export interface AppSettings {
  pomodoroWorkMinutes: number;    // Duração da sessão de trabalho (padrão: 25)
  pomodoroBreakMinutes: number;   // Duração da pausa (padrão: 5)
  reviewIntervalDays: number;     // Intervalo base de revisão em dias (padrão: 15)
  notificationsEnabled: boolean;  // Notificações habilitadas (padrão: false)
  theme: 'dark';                  // Tema da aplicação (extensível no futuro)
  enemDate: string;               // Data do ENEM (padrão: ENEM_2026_DATE)
}

/**
 * Calcula a data da próxima revisão com base na data de conclusão.
 * @deprecated Use `calculateSpacedRepetitionDate` para repetição espaçada adaptativa.
 */
export const calculateReviewDate = (completionDate: string): string => {
  const date = new Date(completionDate);
  date.setDate(date.getDate() + 15);
  return date.toISOString();
};

/**
 * Calcula a próxima data de revisão usando repetição espaçada adaptativa.
 * O intervalo é ajustado pela dificuldade do tópico e pelo número de revisões realizadas.
 *
 * - difficulty 'easy'  → multiplicador 1.5
 * - difficulty 'hard'  → multiplicador 0.7
 * - difficulty 'medium' ou undefined → multiplicador 1.0
 * - repetitionFactor = 1.0 + (reviewCount * 0.3)
 * - interval = ROUND(15 * difficultyMultiplier * repetitionFactor), clamp [3, 60]
 *
 * @throws {Error} Se `completionDate` não for uma string ISO válida.
 */
export const calculateSpacedRepetitionDate = (topic: Topic, completionDate: string): string => {
  const parsedDate = new Date(completionDate);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(
      `calculateSpacedRepetitionDate: "completionDate" deve ser uma string ISO válida, mas recebeu: "${completionDate}"`
    );
  }

  const baseInterval = 15;

  let difficultyMultiplier: number;
  if (topic.difficulty === 'easy') {
    difficultyMultiplier = 1.5;
  } else if (topic.difficulty === 'hard') {
    difficultyMultiplier = 0.7;
  } else {
    difficultyMultiplier = 1.0;
  }

  const reviewCount = topic.reviewCount ?? 0;
  const repetitionFactor = 1.0 + reviewCount * 0.3;

  let interval = Math.round(baseInterval * difficultyMultiplier * repetitionFactor);
  interval = Math.max(3, Math.min(interval, 60));

  parsedDate.setDate(parsedDate.getDate() + interval);
  return parsedDate.toISOString();
};

/**
 * Calcula a sequência de dias consecutivos de estudo (streak).
 * Coleta todas as datas únicas (YYYY-MM-DD) em que pelo menos um tópico foi concluído,
 * e conta os dias consecutivos retroativamente a partir de hoje ou ontem.
 *
 * Retorna 0 se não houver atividade hoje ou ontem, ou se não houver tópicos concluídos.
 */
export const calculateStudyStreak = (subjects: Subject[]): number => {
  const uniqueDates = new Set<string>();

  for (const subject of subjects) {
    for (const topic of subject.topics) {
      if (topic.completedAt) {
        const dayKey = topic.completedAt.substring(0, 10); // "YYYY-MM-DD"
        uniqueDates.add(dayKey);
      }
    }
  }

  if (uniqueDates.size === 0) return 0;

  const sortedDates = Array.from(uniqueDates).sort((a, b) => (a > b ? -1 : 1)); // descending

  const now = new Date();
  const today = now.toISOString().substring(0, 10);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().substring(0, 10);

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

  let streak = 1;
  let current = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(current + 'T00:00:00Z');
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    const expected = currentDate.toISOString().substring(0, 10);

    if (sortedDates[i] === expected) {
      streak++;
      current = sortedDates[i];
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Verifica se um tópico já precisa ser revisado.
 * Retorna verdadeiro se a data atual for maior ou igual à data de revisão.
 */
export const isReviewDue = (reviewDate?: string): boolean => {
  if (!reviewDate) return false;
  return new Date() >= new Date(reviewDate);
};

/**
 * Calcula a porcentagem de progresso de uma matéria.
 * O progresso é baseado em tópicos que tiveram tanto a teoria quanto os exercícios concluídos.
 */
export const getProgress = (subject: Subject): number => {
  // Se não houver tópicos, o progresso é zero para evitar divisão por zero
  if (subject.topics.length === 0) return 0;
  
  // Filtra apenas os tópicos onde ambos os requisitos de conclusão foram atingidos
  const completed = subject.topics.filter(t => t.isStudied && t.isExercisesDone).length;
  
  // Retorna o valor arredondado da porcentagem
  return Math.round((completed / subject.topics.length) * 100);
};

/**
 * Data do ENEM 2026 (Estimada: Primeiro domingo de Novembro)
 */
export const ENEM_2026_DATE = '2026-11-01T13:00:00Z';

/**
 * Calcula os dias restantes para o ENEM.
 */
export const getDaysUntilEnem = (): number => {
  const diff = new Date(ENEM_2026_DATE).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ─── Study Cycles ─────────────────────────────────────────────────────────────

/**
 * Representa um ciclo de estudos: sequência ordenada de matérias.
 */
export interface StudyCycle {
  id: string;           // UUID gerado no cliente
  name: string;         // Ex: "Ciclo Exatas"
  subjectIds: string[]; // IDs ordenados das matérias
  pomodorosPerSubject: number; // Quantos Pomodoros por matéria (padrão: 1, range: 1-5)
  createdAt: string;    // ISO date string
  loop?: boolean;       // Se true, reinicia ao completar (padrão: false)
}

/**
 * Estado de execução de um ciclo ativo.
 * Persistido em localStorage['active-cycle-state'].
 */
export interface ActiveCycleState {
  cycleId: string;
  currentIndex: number;       // índice atual dentro de subjectIds (0-based)
  pomodorosInCurrentSubject: number; // Pomodoros completados na matéria atual
  isCompleted: boolean;
  startedAt: string;          // ISO date string
}

/**
 * Progresso derivado do ciclo ativo — passado para o overlay.
 */
export interface CycleProgress {
  currentIndex: number;  // 0-based
  total: number;
  cycleName: string;
  isCompleted: boolean;
}
