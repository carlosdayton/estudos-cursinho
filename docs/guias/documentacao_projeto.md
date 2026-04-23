# Documentação Técnica: Sistema de Estudos Foco ENEM

Este documento descreve a arquitetura e o funcionamento interno da aplicação, explicando como os dados fluem e como cada componente interage com o sistema.

---

## 1. Arquitetura Geral
A aplicação foi construída utilizando **React** com **TypeScript** e **Vite**. O design segue uma estética moderna (Glassmorphism/Neon) e a persistência de dados é feita inteiramente no navegador do usuário (**Client-side**).

---

## 2. Camada de Dados e Persistência

### [useLocalStorage.ts](file:///c:/Users/Carlos%20Dayton/Pictures/Estudos-Cursinho/src/hooks/useLocalStorage.ts)
Este é o "motor" de persistência da aplicação.
- **O que faz:** Sincroniza o estado do React com o `localStorage` do navegador.
- **Funcionamento:** Sempre que você adiciona uma matéria ou marca um tópico como concluído, este hook detecta a mudança e salva automaticamente os dados no navegador em formato JSON. Ao recarregar a página, ele recupera esses dados.

### [studyLogic.ts](file:///c:/Users/Carlos%20Dayton/Pictures/Estudos-Cursinho/src/utils/studyLogic.ts)
Contém a definição dos dados e as regras de cálculo.
- **Interfaces:** Define como é a estrutura de uma Matéria (`Subject`) e de um Tópico (`Topic`).
- **Regras de Revisão:** Inclui a lógica para calcular a data da próxima revisão (geralmente 15 dias após a conclusão) e verifica se uma revisão já está vencida.
- **Cálculo de Progresso:** Função matemática que calcula a porcentagem de conclusão baseada nos tópicos estudados e exercícios feitos.

---

## 3. Estrutura de Componentes (UI)

### [App.tsx](file:///c:/Users/Carlos%20Dayton/Pictures/Estudos-Cursinho/src/App.tsx)
O componente raiz da aplicação.
- **Responsabilidade:** Renderiza o `Dashboard` e o **Footer Fixo** (Sistema de Elite). 
- **Estilo:** Define a estrutura global e os filtros de fundo (blur) do sistema.

### [Dashboard.tsx](file:///c:/Users/Carlos%20Dayton/Pictures/Estudos-Cursinho/src/components/Dashboard.tsx)
O centro de controle da aplicação.
- **Estado Global:** É aqui que a lista de todas as matérias é carregada usando o `useLocalStorage`.
- **Cálculo de Desempenho:** Calcula a barra de progresso gigante que você vê no topo (a média de todas as matérias).
- **Gerenciamento:** Contém as funções para adicionar, atualizar e excluir matérias inteiras.

### [SubjectCard.tsx](file:///c:/Users/Carlos%20Dayton/Pictures/Estudos-Cursinho/src/components/SubjectCard.tsx)
Representa cada matéria individual (ex: Matemática, Biologia).
- **Lógica Local:** Gerencia a adição de novos tópicos dentro daquela matéria específica.
- **Progresso Individual:** Exibe a barra de progresso e as estatísticas exclusivas daquela matéria.

### [TopicItem.tsx](file:///c:/Users/Carlos%20Dayton/Pictures/Estudos-Cursinho/src/components/TopicItem.tsx)
O menor nível de interação.
- **Interatividade:** Onde o aluno marca se "Estudou a Teoria" e se "Fez Exercícios".
- **Visual:** Muda de cor dinamicamente (para verde) quando ambos os requisitos são cumpridos.

---

## 4. Fluxo de Dados (Data Flow)

1. **Ação do Usuário:** O usuário clica em "Teoria Concluída" no `TopicItem`.
2. **Propagação:** O `TopicItem` avisa o `SubjectCard` que um tópico mudou.
3. **Atualização do Estado:** O `SubjectCard` atualiza seu objeto de matéria e avisa o `Dashboard`.
4. **Sincronização:** O `Dashboard` atualiza a lista principal no estado do React.
5. **Persistência:** O hook `useLocalStorage` detecta que a lista de matérias mudou e salva a nova versão instantaneamente no disco (navegador).
6. **Feedback Visual:** As barras de progresso no `SubjectCard` e no `Dashboard` são recalculadas e animadas automaticamente.

---

## 5. Tecnologias de Design
- **Tailwind CSS:** Utilizado para o layout responsivo e estilização rápida.
- **Framer Motion:** Responsável pelas animações suaves de entrada, saída e barras de carregamento.
- **Lucide React:** Biblioteca de ícones (como o chapéu de graduação e as estrelas).
