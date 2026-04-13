# Tasks: Flashcards

## Task List

- [x] 1. Criar tipos e lógica de negócio (`flashcardLogic.ts`)
  - [x] 1.1 Definir interfaces `Flashcard`, `FlashcardDraft`, `ReviewResult`, `FlashcardsState` em `src/utils/flashcardLogic.ts`
  - [x] 1.2 Implementar `computeNextReview(card, result)` com algoritmo SM-2 simplificado
  - [x] 1.3 Implementar `getDueCards(cards)` com filtro e ordenação por `nextReviewAt`
  - [x] 1.4 Implementar `getDueCount(cards)` retornando contagem de cards pendentes

- [x] 2. Criar hook `useFlashcards`
  - [x] 2.1 Criar `src/hooks/useFlashcards.ts` usando `useLocalStorage` com chave `flashcards-data`
  - [x] 2.2 Implementar `addFlashcard(draft)` com validação e inicialização de campos
  - [x] 2.3 Implementar `recordResult(id, result)` chamando `computeNextReview`
  - [x] 2.4 Implementar `deleteFlashcard(id)` com operação idempotente
  - [x] 2.5 Implementar `updateFlashcard(id, patch)` preservando estado de revisão
  - [x] 2.6 Expor `dueCards` via `useMemo`

- [x] 3. Criar componente `PendingBadge`
  - [x] 3.1 Criar `src/components/flashcards/PendingBadge.tsx` com animação de pulso quando `count > 0`
  - [x] 3.2 Retornar `null` quando `count === 0`

- [x] 4. Criar componente `FlashcardFlip`
  - [x] 4.1 Criar `src/components/flashcards/FlashcardFlip.tsx` com animação 3D via Framer Motion
  - [x] 4.2 Exibir frente quando `isFlipped=false`, verso quando `isFlipped=true`
  - [x] 4.3 Aplicar `subjectColor` como borda e glow neon

- [x] 5. Criar componente `FlashcardEditor`
  - [x] 5.1 Criar `src/components/flashcards/FlashcardEditor.tsx` com campos front, back, matéria e tópico
  - [x] 5.2 Implementar validação inline (campos vazios, máximo 500 caracteres, subjectId válido)
  - [x] 5.3 Suportar modo de edição via prop `initialCard`

- [x] 6. Criar componente `ReviewSession`
  - [x] 6.1 Criar `src/components/flashcards/ReviewSession.tsx` iterando sobre DueCards por urgência
  - [x] 6.2 Exibir progresso "N / Total" durante a sessão
  - [x] 6.3 Exibir tela de conclusão ao terminar todos os cards
  - [x] 6.4 Exibir estado vazio com próxima data de revisão quando não há DueCards

- [x] 7. Criar componente `FlashcardsPanel`
  - [x] 7.1 Criar `src/components/flashcards/FlashcardsPanel.tsx` como ponto de entrada do módulo
  - [x] 7.2 Integrar `useFlashcards`, `FlashcardEditor`, `ReviewSession`, `PendingBadge`
  - [x] 7.3 Implementar alternância entre visualização de lista, editor e sessão de revisão
  - [x] 7.4 Exibir lista de flashcards existentes com opções de editar e excluir

- [x] 8. Integrar `FlashcardsPanel` no `Dashboard`
  - [x] 8.1 Adicionar import lazy de `FlashcardsPanel` no `Dashboard.tsx`
  - [x] 8.2 Adicionar seção `<FlashcardsPanel subjects={subjects} />` com `<Suspense>` e `SectionSkeleton`
