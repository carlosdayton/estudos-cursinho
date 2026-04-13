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
}

/**
 * Interface que define o conjunto de tópicos que compõem uma matéria.
 */
export interface Subject {
  id: string;          // Identificador único da matéria
  name: string;        // Nome da matéria (ex: "Matemática")
  color: string;       // Cor hexadecimal para identificação visual
  topics: Topic[];     // Lista de tópicos pertencentes a esta matéria
}

/**
 * Interface que define a estrutura de um Simulado realizado.
 */
export interface Simulado {
  id: string;
  date: string;
  scores: {
    linguagens: number;
    humanas: number;
    natureza: number;
    matematica: number;
    redacao: number;
  };
  total: number;
}

/**
 * Calcula a data da próxima revisão com base na data de conclusão.
 * Atualmente soma 15 dias à data fornecida.
 */
export const calculateReviewDate = (completionDate: string): string => {
  const date = new Date(completionDate);
  date.setDate(date.getDate() + 15);
  return date.toISOString();
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
