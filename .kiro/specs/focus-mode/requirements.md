# Requirements: Focus Mode (Modo Foco)

## Introduction

O Modo Foco é uma funcionalidade de imersão total para o Foco ENEM. Ao ativá-lo, o aluno entra em uma sobreposição de tela cheia que oculta todo o Dashboard e exibe apenas o timer Pomodoro, a matéria sendo estudada e um botão de saída — eliminando distrações e criando um ambiente de estudo concentrado.

## Requirements

### Requirement 1: Ativação do Modo Foco

**User Story**: Como aluno, quero ativar o Modo Foco através de um botão visível na interface, para entrar em um ambiente de estudo sem distrações.

#### Acceptance Criteria

1.1 GIVEN o Dashboard está visível, WHEN o aluno clica no botão "Modo Foco", THEN um modal de seleção de matéria é exibido.

1.2 GIVEN o modal de seleção está aberto, WHEN o aluno seleciona uma matéria e confirma, THEN o Modo Foco é ativado com aquela matéria como ativa.

1.3 GIVEN o modal de seleção está aberto, WHEN o aluno escolhe "Livre (sem matéria específica)" e confirma, THEN o Modo Foco é ativado sem matéria associada.

1.4 GIVEN o modal de seleção está aberto, WHEN o aluno clica em "Cancelar", THEN o modal fecha e o Dashboard permanece visível sem ativar o Modo Foco.

1.5 GIVEN não há matérias cadastradas, WHEN o aluno abre o modal de seleção, THEN apenas a opção "Livre" é exibida.

---

### Requirement 2: Interface do Modo Foco

**User Story**: Como aluno, quero que o Modo Foco exiba apenas o essencial (timer, matéria e saída), para que eu possa me concentrar sem distrações visuais.

#### Acceptance Criteria

2.1 GIVEN o Modo Foco está ativo, THEN toda a interface do Dashboard (matérias, stats, simulados, planejamento, flashcards, footer) está oculta.

2.2 GIVEN o Modo Foco está ativo, THEN o timer Pomodoro está centralizado na tela.

2.3 GIVEN o Modo Foco está ativo com uma matéria selecionada, THEN o nome e a cor da matéria são exibidos abaixo do timer.

2.4 GIVEN o Modo Foco está ativo sem matéria selecionada, THEN o texto "Estudo Livre" é exibido no lugar do nome da matéria.

2.5 GIVEN o Modo Foco está ativo, THEN um botão "Sair do Modo Foco" está visível e acessível.

2.6 GIVEN o Modo Foco está ativo, THEN o fundo exibe um visual imersivo com gradiente escuro e partículas animadas.

---

### Requirement 3: Saída do Modo Foco

**User Story**: Como aluno, quero sair do Modo Foco facilmente e voltar ao Dashboard no estado em que estava, para retomar minha navegação normal.

#### Acceptance Criteria

3.1 GIVEN o Modo Foco está ativo, WHEN o aluno clica em "Sair do Modo Foco", THEN o overlay é fechado com animação e o Dashboard volta a ser visível.

3.2 GIVEN o Modo Foco está ativo, WHEN o aluno pressiona a tecla Escape, THEN o Modo Foco é desativado e o Dashboard volta a ser visível.

3.3 GIVEN o aluno sai do Modo Foco, THEN o estado do timer Pomodoro (tempo decorrido, modo, sessões) é preservado exatamente como estava.

3.4 GIVEN o aluno sai do Modo Foco, THEN o Dashboard é exibido no mesmo estado em que estava antes da ativação.

---

### Requirement 4: Persistência e Consistência de Estado

**User Story**: Como aluno, quero que o sistema lembre a última matéria que estudei no Modo Foco, para facilitar sessões consecutivas.

#### Acceptance Criteria

4.1 GIVEN o aluno ativa o Modo Foco com uma matéria, THEN o id da matéria é persistido no localStorage sob a chave `focus-mode-last-subject`.

4.2 GIVEN o aluno abre o modal de seleção novamente, THEN a última matéria usada aparece pré-selecionada.

4.3 GIVEN a matéria salva no localStorage foi deletada, WHEN o Modo Foco é ativado, THEN o sistema trata o id inválido como "Livre" sem lançar erros.

4.4 GIVEN o localStorage está indisponível, THEN o Modo Foco funciona normalmente em memória sem travar ou exibir erros ao usuário.

---

### Requirement 5: Acessibilidade e UX

**User Story**: Como aluno, quero que o Modo Foco seja acessível e responsivo, para que funcione bem em qualquer dispositivo.

#### Acceptance Criteria

5.1 GIVEN o Modo Foco está ativo, THEN o foco do teclado é capturado dentro do overlay (focus trap).

5.2 GIVEN o Modo Foco está ativo, THEN uma região `aria-live` anuncia o estado do timer para leitores de tela.

5.3 GIVEN o aluno está em um dispositivo móvel, THEN o layout do Modo Foco é responsivo e o timer é legível sem scroll horizontal.

5.4 GIVEN o botão "Modo Foco" está no Dashboard, THEN ele possui `aria-label` descritivo e é navegável por teclado.
