# Tasks: Focus Mode (Modo Foco)

## Task List

- [x] 1. Criar FocusModeContext
  - [x] 1.1 Criar `src/context/FocusModeContext.tsx` com interface `FocusModeContextValue` (isFocusMode, activeSubjectId, enterFocusMode, exitFocusMode)
  - [x] 1.2 Implementar `enterFocusMode(subjectId?)` que seta `isFocusMode=true`, persiste `activeSubjectId` via `useLocalStorage('focus-mode-last-subject')`
  - [x] 1.3 Implementar `exitFocusMode()` que seta `isFocusMode=false` e restaura `document.body.style.overflow`
  - [x] 1.4 Implementar `resolveActiveSubject(subjectId, subjects)` como função utilitária exportada
  - [x] 1.5 Exportar `FocusModeProvider` e `useFocusMode` hook

- [x] 2. Criar SubjectSelectModal
  - [x] 2.1 Criar `src/components/SubjectSelectModal.tsx` com props `{ isOpen, subjects, onConfirm, onCancel }`
  - [x] 2.2 Renderizar lista de matérias como botões clicáveis com cor e nome de cada matéria
  - [x] 2.3 Adicionar opção "Livre (sem matéria específica)" como primeira opção
  - [x] 2.4 Pré-selecionar a última matéria usada (lida do localStorage `focus-mode-last-subject`)
  - [x] 2.5 Estilizar com Glassmorphism/Neon consistente com o restante do app (backdrop-filter, border rgba, Framer Motion)
  - [x] 2.6 Fechar ao clicar fora do modal (backdrop click)

- [x] 3. Criar ParticleBackground
  - [x] 3.1 Criar `src/components/ParticleBackground.tsx` com prop `accentColor?: string`
  - [x] 3.2 Gerar 25 partículas com posições/tamanhos/durações aleatórias usando `useMemo`
  - [x] 3.3 Animar partículas com Framer Motion (float up + fade in/out em loop)
  - [x] 3.4 Usar `accentColor` como cor base das partículas com opacidade reduzida

- [x] 4. Criar FocusModeOverlay
  - [x] 4.1 Criar `src/components/FocusModeOverlay.tsx` com props `{ activeSubject: Subject | null, onExit: () => void }`
  - [x] 4.2 Renderizar `ParticleBackground` como camada de fundo (position: fixed, inset: 0, z-index: 9998)
  - [x] 4.3 Renderizar `PomodoroTimer` centralizado (componente existente reutilizado sem modificações)
  - [x] 4.4 Exibir nome e cor da matéria ativa abaixo do timer (ou "Estudo Livre" se null)
  - [x] 4.5 Renderizar botão "Sair do Modo Foco" com ícone `X` do Lucide React
  - [x] 4.6 Adicionar listener de tecla `Escape` para chamar `onExit`
  - [x] 4.7 Aplicar animação de entrada/saída com `motion.div` (opacity + scale)
  - [x] 4.8 Adicionar `aria-live` region para anunciar estado do timer a leitores de tela

- [x] 5. Criar FocusModeButton
  - [x] 5.1 Criar `src/components/FocusModeButton.tsx` com prop `{ subjects: Subject[] }`
  - [x] 5.2 Renderizar botão fixo com ícone `Focus` do Lucide React e label "Modo Foco"
  - [x] 5.3 Ao clicar, abrir `SubjectSelectModal`
  - [x] 5.4 Ao confirmar no modal, chamar `enterFocusMode(subjectId)`
  - [x] 5.5 Adicionar `aria-label="Ativar Modo Foco"` e suporte a navegação por teclado
  - [x] 5.6 Estilizar com neon glow (cor `#818cf8`) e efeito hover com Framer Motion

- [x] 6. Integrar no App.tsx e Dashboard.tsx
  - [x] 6.1 Envolver `App.tsx` com `FocusModeProvider` (junto ao `ToastProvider` existente)
  - [x] 6.2 Em `App.tsx`, usar `useFocusMode` para controlar visibilidade: Dashboard com `display: isFocusMode ? 'none' : 'block'`
  - [x] 6.3 Renderizar `FocusModeOverlay` dentro de `AnimatePresence` em `App.tsx`
  - [x] 6.4 Adicionar `FocusModeButton` no `Dashboard.tsx` (posição: canto inferior direito, acima do footer)
  - [x] 6.5 Passar `subjects` do `useSubjects()` para `FocusModeButton`

- [x] 7. Testes
  - [x] 7.1 Escrever testes unitários para `resolveActiveSubject` (id válido, id inválido, null, array vazio)
  - [x] 7.2 Escrever testes para `FocusModeContext` (enterFocusMode, exitFocusMode, estado inicial)
  - [x] 7.3 Escrever teste de integração para o fluxo completo (botão → modal → overlay → Escape → Dashboard)
