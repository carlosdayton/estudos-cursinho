# Requirements Document

## Introduction

O módulo de Flashcards adiciona ao Foco ENEM um sistema de estudo ativo baseado em repetição espaçada adaptativa (algoritmo SM-2 simplificado). O aluno cria cards com frente (pergunta) e verso (resposta), vinculados a matérias e tópicos existentes, realiza sessões de revisão com animação de flip 3D e recebe agendamento automático de próximas revisões com base no desempenho (acerto/erro). Todos os dados são persistidos via `useLocalStorage` sob a chave `flashcards-data`, seguindo a estética Glassmorphism/Neon do projeto.

## Glossary

- **Flashcard**: Cartão de estudo com frente (pergunta) e verso (resposta), vinculado a uma matéria.
- **FlashcardDraft**: Dados mínimos necessários para criar um novo Flashcard (front, back, subjectId, topicId opcional).
- **ReviewResult**: Resultado de uma revisão — `'correct'` (acertou) ou `'incorrect'` (errou).
- **FlashcardsState**: Estado global do módulo, contendo o array de Flashcards, persistido no localStorage.
- **DueCards**: Subconjunto de Flashcards cujo `nextReviewAt` é menor ou igual ao momento atual.
- **EaseFactor**: Fator de facilidade SM-2, valor numérico entre 1.3 e 2.5 que controla o crescimento do intervalo.
- **Interval**: Número de dias até a próxima revisão de um Flashcard.
- **Repetitions**: Contador de revisões bem-sucedidas consecutivas de um Flashcard.
- **FlashcardsPanel**: Componente principal do módulo, ponto de entrada na Dashboard.
- **FlashcardEditor**: Formulário de criação e edição de Flashcards.
- **ReviewSession**: Componente que conduz a sessão de revisão dos DueCards.
- **FlashcardFlip**: Componente de card individual com animação de flip 3D.
- **PendingBadge**: Contador visual de DueCards.
- **Subject**: Matéria existente no sistema (definida em `studyLogic.ts`).
- **Topic**: Tópico existente dentro de uma Subject (definido em `studyLogic.ts`).

## Requirements

### Requirement 1: Criação de Flashcards

**User Story:** Como aluno, quero criar flashcards com pergunta e resposta vinculados a uma matéria, para que eu possa estudar ativamente os conteúdos do ENEM.

#### Acceptance Criteria

1. WHEN um usuário preenche os campos de frente e verso e clica em "Salvar", THE FlashcardEditor SHALL criar um novo Flashcard e adicioná-lo ao FlashcardsState.
2. WHEN um usuário tenta criar um Flashcard com frente ou verso vazio (incluindo strings compostas apenas de espaços em branco), THE FlashcardEditor SHALL rejeitar a operação e manter o estado atual inalterado.
3. WHEN um Flashcard é criado, THE FlashcardsPanel SHALL definir `nextReviewAt` como o momento atual (disponível imediatamente para revisão).
4. WHEN um Flashcard é criado, THE FlashcardsPanel SHALL inicializar `easeFactor = 2.5`, `interval = 1` e `repetitions = 0`.
5. WHEN um Flashcard é criado, THE FlashcardsPanel SHALL persistir o estado atualizado no localStorage sob a chave `flashcards-data`.
6. IF o campo `front` ou `back` exceder 500 caracteres, THEN THE FlashcardEditor SHALL rejeitar a operação e exibir mensagem de validação inline.
7. IF o `subjectId` fornecido não corresponder a nenhuma Subject existente, THEN THE FlashcardEditor SHALL rejeitar a operação e exibir mensagem de validação inline.

---

### Requirement 2: Algoritmo de Repetição Espaçada (SM-2)

**User Story:** Como aluno, quero que o sistema calcule automaticamente quando devo revisar cada flashcard com base no meu desempenho, para que eu otimize meu tempo de estudo.

#### Acceptance Criteria

1. WHEN um usuário marca um Flashcard como `'correct'` e `repetitions > 1`, THE FlashcardsPanel SHALL calcular o novo intervalo como `round(interval * easeFactor)`, garantindo que o intervalo não diminua.
2. WHEN um usuário marca um Flashcard como `'correct'` e `repetitions === 0`, THE FlashcardsPanel SHALL definir o novo intervalo como 1 dia.
3. WHEN um usuário marca um Flashcard como `'correct'` e `repetitions === 1`, THE FlashcardsPanel SHALL definir o novo intervalo como 6 dias.
4. WHEN um usuário marca um Flashcard como `'incorrect'`, THE FlashcardsPanel SHALL resetar `repetitions` para 0, `interval` para 1 e reduzir `easeFactor` em 0.2.
5. WHILE o EaseFactor está sendo atualizado, THE FlashcardsPanel SHALL manter o valor dentro do intervalo `[1.3, 2.5]` (clamp).
6. WHEN um resultado de revisão é registrado, THE FlashcardsPanel SHALL definir `nextReviewAt` como uma data futura calculada com base no novo `interval`.
7. WHEN um resultado de revisão é registrado, THE FlashcardsPanel SHALL atualizar `lastReviewedAt` para o momento atual.
8. WHEN um resultado de revisão é registrado, THE FlashcardsPanel SHALL persistir o estado atualizado no localStorage.

---

### Requirement 3: Seleção e Ordenação de Cards Pendentes

**User Story:** Como aluno, quero que o sistema me apresente os flashcards mais urgentes primeiro durante a revisão, para que eu não perca revisões atrasadas.

#### Acceptance Criteria

1. WHEN `getDueCards` é chamado, THE FlashcardsPanel SHALL retornar apenas Flashcards onde `nextReviewAt <= now`.
2. WHEN `getDueCards` é chamado, THE FlashcardsPanel SHALL retornar os DueCards ordenados por `nextReviewAt` ascendente (mais atrasado primeiro).
3. WHEN uma sessão de revisão é iniciada sem DueCards, THE ReviewSession SHALL exibir um estado vazio com a data da próxima revisão disponível.
4. WHEN todos os cards de uma sessão de revisão são concluídos, THE ReviewSession SHALL exibir uma tela de conclusão.

---

### Requirement 4: Animação de Flip 3D

**User Story:** Como aluno, quero ver uma animação de flip 3D ao revelar a resposta de um flashcard, para que a experiência de revisão seja visualmente envolvente.

#### Acceptance Criteria

1. WHEN `isFlipped` é `false`, THE FlashcardFlip SHALL exibir o conteúdo da frente do card.
2. WHEN `isFlipped` é `true`, THE FlashcardFlip SHALL exibir o conteúdo do verso do card.
3. WHEN um usuário clica no FlashcardFlip, THE FlashcardFlip SHALL acionar a animação de rotação 3D via Framer Motion (`rotateY: 0 → 180`).
4. WHEN a cor da matéria é fornecida via `subjectColor`, THE FlashcardFlip SHALL aplicar a cor como borda e glow neon do card.

---

### Requirement 5: Badge de Cards Pendentes

**User Story:** Como aluno, quero ver quantos flashcards estão pendentes de revisão na dashboard, para que eu saiba quando preciso estudar.

#### Acceptance Criteria

1. WHEN `count > 0`, THE PendingBadge SHALL exibir o número de DueCards com animação de pulso.
2. WHEN `count === 0`, THE PendingBadge SHALL retornar `null` e não renderizar nenhum elemento visual.

---

### Requirement 6: Exclusão de Flashcards

**User Story:** Como aluno, quero excluir flashcards que não são mais relevantes, para que minha lista de estudo permaneça organizada.

#### Acceptance Criteria

1. WHEN `deleteFlashcard` é chamado com um `id` existente, THE FlashcardsPanel SHALL remover o Flashcard correspondente do FlashcardsState.
2. WHEN `deleteFlashcard` é chamado com um `id` inexistente, THE FlashcardsPanel SHALL manter o FlashcardsState inalterado (operação idempotente).
3. WHEN um Flashcard é excluído, THE FlashcardsPanel SHALL persistir o estado atualizado no localStorage.

---

### Requirement 7: Edição de Flashcards

**User Story:** Como aluno, quero editar o conteúdo de um flashcard existente, para que eu possa corrigir erros ou melhorar as perguntas e respostas.

#### Acceptance Criteria

1. WHEN um usuário edita os campos `front` ou `back` de um Flashcard existente e salva, THE FlashcardEditor SHALL atualizar o conteúdo do card preservando `easeFactor`, `interval`, `repetitions` e `nextReviewAt`.
2. WHEN um usuário edita um Flashcard, THE FlashcardEditor SHALL aplicar as mesmas regras de validação da criação (campos não vazios, máximo 500 caracteres).
3. WHEN um Flashcard é editado, THE FlashcardsPanel SHALL persistir o estado atualizado no localStorage.

---

### Requirement 8: Integração com Dashboard

**User Story:** Como aluno, quero acessar o módulo de Flashcards diretamente na dashboard do Foco ENEM, para que eu tenha acesso rápido ao estudo ativo.

#### Acceptance Criteria

1. THE Dashboard SHALL carregar o FlashcardsPanel via `React.lazy` (lazy loading) para não impactar o tempo de carregamento inicial.
2. WHEN o FlashcardsPanel está carregando, THE Dashboard SHALL exibir um skeleton de carregamento (`SectionSkeleton`).
3. THE FlashcardsPanel SHALL receber a lista de `subjects` existentes como prop para vincular cards a matérias.

---

### Requirement 9: Tratamento de Erros de Persistência

**User Story:** Como aluno, quero que o sistema lide graciosamente com erros de armazenamento, para que eu não perca meu progresso de estudo.

#### Acceptance Criteria

1. IF o localStorage estiver cheio (QuotaExceededError), THEN THE FlashcardsPanel SHALL manter o estado em memória e registrar o erro no console, seguindo o padrão de `useLocalStorage.ts`.
2. IF os dados na chave `flashcards-data` estiverem corrompidos (JSON inválido), THEN THE FlashcardsPanel SHALL usar `{ cards: [] }` como valor inicial de fallback.
