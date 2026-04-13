# Requirements: Study Cycles (Ciclos de Estudo)

## Introduction

Este documento define os requisitos funcionais e não-funcionais do módulo de Ciclos de Estudo para o Foco ENEM. O módulo permite ao aluno montar sequências ordenadas de matérias e executá-las em sessões Pomodoro contínuas, com avanço automático e exibição de progresso no Modo Foco.

---

## Requirements

### 1. Gerenciamento de Ciclos

#### 1.1 Criar Ciclo
**User Story**: Como aluno, quero criar um ciclo de estudos com nome e matérias ordenadas, para poder reutilizá-lo em sessões futuras.

**Acceptance Criteria**:
- O sistema deve exibir um modal de criação com campo de nome e lista de matérias disponíveis
- O aluno deve poder selecionar matérias via checkbox e reordená-las com botões ↑ / ↓
- O sistema deve validar que o nome não está vazio (máx 50 caracteres)
- O sistema deve validar que pelo menos 2 matérias foram selecionadas
- Ao salvar, o ciclo deve ser persistido no `localStorage` com um ID único gerado via `crypto.randomUUID()`
- O sistema deve exibir mensagem de erro inline se a validação falhar, sem fechar o modal

#### 1.2 Listar Ciclos Salvos
**User Story**: Como aluno, quero ver todos os meus ciclos salvos com suas matérias, para escolher qual iniciar.

**Acceptance Criteria**:
- O painel de ciclos deve listar todos os ciclos salvos com nome e quantidade de matérias
- Cada ciclo deve exibir os nomes das matérias na ordem definida
- O painel deve exibir estado vazio com mensagem orientativa quando não há ciclos

#### 1.3 Editar Ciclo
**User Story**: Como aluno, quero editar um ciclo existente para ajustar matérias ou ordem.

**Acceptance Criteria**:
- Cada ciclo listado deve ter botão de edição que abre o `CycleEditorModal` pré-preenchido
- As mesmas regras de validação do requisito 1.1 se aplicam
- Editar um ciclo não deve afetar um ciclo ativo em andamento

#### 1.4 Excluir Ciclo
**User Story**: Como aluno, quero excluir ciclos que não uso mais.

**Acceptance Criteria**:
- Cada ciclo listado deve ter botão de exclusão
- O sistema deve exibir confirmação antes de excluir (usando o `ConfirmModal` existente)
- Excluir um ciclo ativo deve encerrar o Modo Foco e limpar o estado ativo

#### 1.5 Opção de Loop
**User Story**: Como aluno, quero configurar um ciclo para repetir automaticamente ao terminar.

**Acceptance Criteria**:
- O `CycleEditorModal` deve ter toggle "Repetir ciclo ao terminar" (padrão: desativado)
- Quando loop está ativo e o ciclo completa, o sistema deve reiniciar do índice 0 sem exibir tela de conclusão
- O estado de loop deve ser persistido junto ao ciclo

---

### 2. Execução do Ciclo

#### 2.1 Iniciar Ciclo
**User Story**: Como aluno, quero iniciar um ciclo e entrar automaticamente no Modo Foco com a primeira matéria.

**Acceptance Criteria**:
- Cada ciclo listado deve ter botão "Iniciar"
- Ao clicar, o sistema deve entrar no Modo Foco com a primeira matéria do ciclo como matéria ativa
- O `FocusModeOverlay` deve exibir o badge de progresso: `"Matéria 1 de N — [Nome]"`
- O estado ativo do ciclo deve ser persistido no `localStorage` com chave `active-cycle-state`
- Se já houver um Modo Foco ativo sem ciclo, o sistema deve substituir pelo ciclo iniciado

#### 2.2 Avanço Automático por Sessão Pomodoro
**User Story**: Como aluno, quero que o sistema avance automaticamente para a próxima matéria a cada sessão de foco concluída.

**Acceptance Criteria**:
- O `usePomodoroTimer` deve aceitar um callback `onFocusSessionComplete` invocado ao final de cada sessão de modo `work`
- O callback deve ser invocado exatamente uma vez por sessão concluída
- O callback não deve ser invocado ao final de sessões de pausa (`break`)
- Ao avançar, `activeSubjectId` no `FocusModeContext` deve ser atualizado para a próxima matéria
- O badge de progresso no overlay deve atualizar imediatamente: `"Matéria N de Total — [Nome]"`
- A cor de acento do overlay deve mudar para a cor da nova matéria ativa

#### 2.3 Exibição de Progresso no Overlay
**User Story**: Como aluno, quero ver meu progresso no ciclo enquanto estudo, para saber quantas matérias faltam.

**Acceptance Criteria**:
- O `FocusModeOverlay` deve exibir o `CycleProgressBadge` quando há ciclo ativo
- O badge deve mostrar: `"Matéria [atual] de [total] — [nome da matéria]"`
- O badge deve ser visualmente distinto (estilo glassmorphism com cor de acento)
- Quando não há ciclo ativo (Modo Foco livre), o badge não deve ser exibido

#### 2.4 Conclusão do Ciclo
**User Story**: Como aluno, quero ver uma tela de conclusão ao terminar todas as matérias do ciclo.

**Acceptance Criteria**:
- Ao completar a última matéria (sem loop), o sistema deve exibir a `CycleCompletionScreen` dentro do overlay
- A tela deve mostrar o nome do ciclo e o total de matérias concluídas
- A tela deve oferecer dois botões: "Repetir Ciclo" e "Encerrar"
- "Repetir Ciclo" deve reiniciar o ciclo do índice 0 sem sair do Modo Foco
- "Encerrar" deve sair do Modo Foco e limpar o estado ativo do ciclo

#### 2.5 Sair do Ciclo Manualmente
**User Story**: Como aluno, quero poder sair do ciclo a qualquer momento pressionando Esc ou clicando em sair.

**Acceptance Criteria**:
- Pressionar `Esc` ou clicar no botão de saída do overlay deve encerrar o Modo Foco e limpar o estado ativo do ciclo
- O comportamento de saída existente do `FocusModeOverlay` deve ser preservado

---

### 3. Persistência e Estado

#### 3.1 Persistência de Ciclos
**User Story**: Como aluno, quero que meus ciclos sejam salvos entre sessões do navegador.

**Acceptance Criteria**:
- Ciclos devem ser persistidos em `localStorage` com chave `study-cycles`
- O formato de persistência deve ser um array de `StudyCycle` serializado como JSON
- Ciclos devem sobreviver a reloads da página

#### 3.2 Persistência do Estado Ativo
**User Story**: Como aluno, quero que o progresso do ciclo seja preservado se eu recarregar a página acidentalmente.

**Acceptance Criteria**:
- O `ActiveCycleState` deve ser persistido em `localStorage` com chave `active-cycle-state`
- Ao recarregar com ciclo ativo, o sistema deve restaurar o Modo Foco na matéria correta
- Ao encerrar o ciclo (conclusão ou saída manual), o `active-cycle-state` deve ser removido do `localStorage`

#### 3.3 Resiliência a Dados Inválidos
**User Story**: Como aluno, quero que o sistema funcione mesmo se dados do localStorage estiverem corrompidos.

**Acceptance Criteria**:
- Se `study-cycles` no localStorage contiver JSON inválido, o sistema deve inicializar com array vazio
- Se `active-cycle-state` referenciar um `cycleId` que não existe mais, o sistema deve limpar o estado ativo silenciosamente
- Se um `subjectId` no ciclo não existir mais na lista de matérias, o sistema deve pular para o próximo ID válido

---

### 4. Integração com Sistema Existente

#### 4.1 Extensão do usePomodoroTimer
**User Story**: Como desenvolvedor, preciso que o `usePomodoroTimer` exponha um callback de sessão concluída sem quebrar os consumidores existentes.

**Acceptance Criteria**:
- O hook deve aceitar um parâmetro opcional `options: { onFocusSessionComplete?: () => void }`
- A assinatura de retorno existente (`UsePomodoroTimerReturn`) não deve ser alterada
- `PomodoroTimer.tsx` e `FocusModeOverlay.tsx` existentes devem continuar funcionando sem modificação de chamada

#### 4.2 Extensão do FocusModeContext
**User Story**: Como desenvolvedor, preciso que o `FocusModeContext` suporte ciclo ativo sem quebrar os consumidores existentes.

**Acceptance Criteria**:
- Os campos `activeCycleId`, `cycleProgress`, `startCycle` e `clearCycle` devem ser adicionados ao contexto
- `activeCycleId` e `cycleProgress` devem ser `null` quando não há ciclo ativo
- `enterFocusMode` existente deve continuar funcionando para Modo Foco livre (sem ciclo)
- `FocusModeButton` existente deve continuar funcionando sem modificação

#### 4.3 Extensão do FocusModeOverlay
**User Story**: Como desenvolvedor, preciso que o `FocusModeOverlay` exiba informações de ciclo quando disponíveis.

**Acceptance Criteria**:
- O overlay deve renderizar `CycleProgressBadge` condicionalmente quando `cycleProgress !== null`
- O overlay deve renderizar `CycleCompletionScreen` condicionalmente quando `cycleProgress.isCompleted === true`
- O comportamento existente (timer, controles, saída por Esc) deve ser preservado integralmente

#### 4.4 Integração no Dashboard
**User Story**: Como aluno, quero acessar o módulo de ciclos diretamente no Dashboard.

**Acceptance Criteria**:
- O `StudyCyclesPanel` deve ser adicionado ao `Dashboard.tsx` como seção lazy (usando `React.lazy`)
- O painel deve receber a lista de `subjects` como prop
- O painel deve ser posicionado após o `PomodoroTimer` / antes das matérias, ou como seção separada com divisor visual

---

### 5. Interface e Experiência

#### 5.1 Estética Consistente
**User Story**: Como aluno, quero que o módulo de ciclos tenha a mesma estética do restante do app.

**Acceptance Criteria**:
- Todos os componentes novos devem usar glassmorphism (`rgba` backgrounds, `backdropFilter: blur`)
- Cores de acento devem seguir a paleta existente (`#818cf8` para primário, cores das matérias para contexto)
- Animações devem usar `framer-motion` com `motion.div` e transições suaves
- Tipografia deve usar `Lexend, sans-serif` com pesos e letter-spacing consistentes com o app

#### 5.2 Acessibilidade
**User Story**: Como aluno, quero que o módulo seja acessível via teclado e leitores de tela.

**Acceptance Criteria**:
- Botões devem ter `aria-label` descritivos
- O modal de edição deve ter `role="dialog"` e `aria-modal="true"`
- Mudanças de matéria no ciclo devem ser anunciadas via `aria-live="polite"`
- Ordem de foco via teclado deve ser lógica dentro do modal
