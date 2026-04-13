# Requirements Document

## Introduction

Esta feature adiciona um módulo de **Organização e Planejamento de Estudos** ao aplicativo Foco ENEM. O objetivo é permitir que o aluno defina metas concretas (data do ENEM, horas diárias, prioridade por matéria) e receba um cronograma semanal gerado automaticamente, alinhando o ritmo de estudo ao tempo disponível até a prova.

O módulo se integra às estruturas já existentes (`Subject`, `Topic`, `AppSettings`) e persiste todos os dados via `localStorage`, seguindo o padrão do hook `useLocalStorage`.

---

## Glossary

- **Planner**: O módulo de planejamento de estudos desta feature.
- **WeeklySchedule**: Estrutura de dados que representa o cronograma semanal gerado pelo Planner.
- **DayPlan**: Registro de um único dia dentro do WeeklySchedule, contendo horas disponíveis e matérias alocadas.
- **SubjectPriority**: Configuração de peso e dificuldade pessoal atribuída pelo aluno a uma matéria.
- **StudyGoal**: Configuração da meta de data (data do ENEM ou outra data-alvo) e das horas diárias de estudo.
- **PaceIndicator**: Indicador calculado que mostra se o ritmo atual de estudo é suficiente para cobrir todos os tópicos antes da data-alvo.
- **System**: A aplicação Foco ENEM como um todo.
- **Planner_Engine**: O módulo de cálculo responsável por gerar o WeeklySchedule e o PaceIndicator.
- **Storage**: O mecanismo de persistência via `localStorage` usando o hook `useLocalStorage`.

---

## Requirements

### Requirement 1: Configuração de Meta de Data

**User Story:** Como aluno, quero definir uma data-alvo de prova (ex: data do ENEM), para que eu saiba exatamente quantos dias tenho disponíveis e possa planejar meu estudo com urgência real.

#### Acceptance Criteria

1. THE **Planner** SHALL permitir que o aluno configure uma data-alvo de prova com dia, mês e ano.
2. WHEN o aluno salva uma data-alvo, THE **Planner** SHALL calcular e exibir a contagem regressiva em dias inteiros a partir da data atual.
3. WHEN a data-alvo é anterior ou igual à data atual, THE **Planner** SHALL exibir uma mensagem indicando que a data já passou ou é hoje.
4. IF o aluno não configurar uma data-alvo, THEN THE **Planner** SHALL utilizar a data padrão do ENEM 2026 definida em `AppSettings.enemDate`.
5. WHEN a data-alvo é alterada, THE **Planner_Engine** SHALL recalcular o PaceIndicator imediatamente.
6. THE **Storage** SHALL persistir a data-alvo configurada no `localStorage` sob a chave `study-planning-goal`.

---

### Requirement 2: Configuração de Horas Diárias de Estudo

**User Story:** Como aluno, quero definir quantas horas por dia pretendo estudar em cada dia da semana, para que o cronograma respeite minha rotina real.

#### Acceptance Criteria

1. THE **Planner** SHALL permitir que o aluno configure um valor de horas de estudo para cada um dos 7 dias da semana (domingo a sábado), com valores entre 0 e 12 horas.
2. WHEN o aluno define 0 horas para um dia, THE **Planner** SHALL tratar aquele dia como folga e não alocar matérias nele.
3. WHEN o aluno altera as horas de qualquer dia, THE **Planner_Engine** SHALL recalcular o WeeklySchedule e o PaceIndicator.
4. THE **Planner** SHALL exibir o total de horas semanais configuradas como soma dos 7 dias.
5. IF o aluno configurar mais de 12 horas para um único dia, THEN THE **Planner** SHALL limitar o valor a 12 horas e exibir uma mensagem de aviso.
6. THE **Storage** SHALL persistir as horas diárias configuradas no `localStorage` sob a chave `study-planning-goal`.

---

### Requirement 3: Prioridade por Matéria

**User Story:** Como aluno, quero marcar quais matérias têm mais peso na prova ou mais dificuldade pessoal, para que o cronograma aloque mais tempo às matérias que mais precisam de atenção.

#### Acceptance Criteria

1. THE **Planner** SHALL exibir a lista de todas as matérias (`Subject`) cadastradas no sistema.
2. THE **Planner** SHALL permitir que o aluno atribua um nível de prioridade a cada matéria, com os valores: `baixa`, `média` ou `alta`.
3. THE **Planner** SHALL permitir que o aluno marque o nível de dificuldade pessoal de cada matéria, com os valores: `fácil`, `médio` ou `difícil`.
4. WHEN o aluno altera a prioridade ou dificuldade de uma matéria, THE **Planner_Engine** SHALL recalcular o WeeklySchedule para refletir a nova distribuição.
5. THE **Planner** SHALL exibir um indicador visual (ex: cor ou ícone) diferenciando os três níveis de prioridade na lista de matérias.
6. THE **Storage** SHALL persistir as configurações de SubjectPriority no `localStorage` sob a chave `study-planning-priorities`.

---

### Requirement 4: Geração do Cronograma Semanal

**User Story:** Como aluno, quero visualizar um cronograma semanal gerado automaticamente com base nas minhas configurações, para que eu saiba exatamente o que estudar em cada dia sem precisar planejar manualmente.

#### Acceptance Criteria

1. WHEN o aluno acessa o módulo de planejamento com pelo menos uma matéria cadastrada e horas diárias configuradas, THE **Planner_Engine** SHALL gerar um WeeklySchedule distribuindo as matérias pelos dias com horas disponíveis.
2. THE **Planner_Engine** SHALL alocar mais horas semanais às matérias com prioridade `alta` em comparação às matérias com prioridade `baixa`, na proporção de 3:2:1 (alta:média:baixa).
3. THE **Planner_Engine** SHALL incluir no WeeklySchedule apenas matérias que possuem tópicos não concluídos (onde `isStudied` ou `isExercisesDone` é `false`).
4. WHEN todas as matérias estão 100% concluídas, THE **Planner** SHALL exibir uma mensagem de parabéns indicando que todos os tópicos foram cobertos.
5. THE **Planner** SHALL exibir o WeeklySchedule em formato de grade semanal, com os dias da semana como colunas e as matérias alocadas como blocos dentro de cada dia.
6. WHEN o aluno não tem horas configuradas para nenhum dia, THE **Planner** SHALL exibir uma mensagem orientando o aluno a configurar as horas diárias.

---

### Requirement 5: PaceIndicator — Ritmo Necessário

**User Story:** Como aluno, quero saber se meu ritmo atual de estudo é suficiente para cobrir todos os tópicos antes da data-alvo, para que eu possa ajustar meu planejamento a tempo.

#### Acceptance Criteria

1. THE **Planner_Engine** SHALL calcular o PaceIndicator como a razão entre tópicos restantes e dias úteis de estudo disponíveis até a data-alvo.
2. THE **Planner** SHALL exibir o PaceIndicator indicando quantos tópicos por dia de estudo o aluno precisa concluir para atingir a meta.
3. WHEN o PaceIndicator indica que o ritmo atual é insuficiente (tópicos restantes por dia > capacidade diária estimada), THE **Planner** SHALL exibir um alerta visual em cor de destaque (vermelho/âmbar).
4. WHEN o PaceIndicator indica que o ritmo atual é suficiente, THE **Planner** SHALL exibir um indicador positivo em cor verde.
5. WHEN não há tópicos restantes, THE **Planner** SHALL exibir o PaceIndicator como concluído.
6. IF a data-alvo já passou, THEN THE **Planner** SHALL exibir o PaceIndicator como expirado, sem realizar cálculos de ritmo.

---

### Requirement 6: Persistência e Integridade dos Dados de Planejamento

**User Story:** Como aluno, quero que minhas configurações de planejamento sejam salvas automaticamente, para que eu não precise reconfigurar tudo ao reabrir o aplicativo.

#### Acceptance Criteria

1. THE **Storage** SHALL persistir todas as configurações do Planner (StudyGoal e SubjectPriority) no `localStorage` usando o hook `useLocalStorage` existente.
2. WHEN o aplicativo é recarregado, THE **Planner** SHALL restaurar todas as configurações salvas anteriormente sem perda de dados.
3. IF os dados persistidos estiverem corrompidos ou em formato inválido, THEN THE **Storage** SHALL utilizar os valores padrão e registrar o erro no console, seguindo o padrão já implementado em `useLocalStorage`.
4. THE **Planner** SHALL garantir que a remoção de uma matéria do sistema também remova as configurações de SubjectPriority correspondentes a essa matéria.
5. WHEN uma nova matéria é adicionada ao sistema, THE **Planner** SHALL inicializar a SubjectPriority dessa matéria com prioridade `média` e dificuldade `médio` como valores padrão.
