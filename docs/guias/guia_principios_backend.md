# 🚀 Roteiro de Estudos: De Frontend para Master do Backend

Para o nosso próximo projeto, onde vamos implementar um backend real, aqui estão os conceitos chave que vamos aplicar:

## 1. O que é SOLID?
É um acrônimo para cinco princípios que tornam o código mais compreensível e flexível:

*   **S (Single Responsibility):** Uma classe/função deve ter apenas um motivo para mudar. (Ex: O arquivo que salva no banco não deve formatar o PDF).
*   **O (Open/Closed):** Aberto para extensão, fechado para modificação. (Adicionamos novos recursos sem quebrar o que já existe).
*   **L (Liskov Substitution):** Objetos de uma subclasse devem poder substituir objetos da classe pai sem erros.
*   **I (Interface Segregation):** É melhor ter várias interfaces específicas do que uma "generosa" demais que ninguém consegue usar direito.
*   **D (Dependency Inversion):** Dependa de abstrações, não de implementações concretas (o famoso "desacoplamento").

## 2. Design Patterns (Padrões de Projeto)
São "receitas" prontas para problemas comuns. Alguns que o backend usa muito:

*   **Repository Pattern:** Para isolar a lógica de acesso aos dados (banco de dados) do restante da aplicação.
*   **Dependency Injection (DI):** Como passamos as ferramentas que uma classe precisa para dentro dela, em vez de a classe criá-las sozinha.
*   **Singleton:** Garantir que uma classe tenha apenas uma instância (comum em conexões com banco de dados).

## 3. Arquitetura de Software
Quando formos para o backend, vamos sair do "salvar no navegador" (`localStorage`) e precisaremos de:
*   **API REST:** A ponte de comunicação entre o seu React e o Servidor.
*   **Node.js / Express:** O ambiente e o framework para rodar o código no servidor.
*   **PostgreSQL / MongoDB:** Onde os dados realmente "moram" permanentemente.

---

**Dica de Ouro:** Não tente decorar tudo agora. No nosso próximo projeto, eu vou te mostrando na prática: *"Olha, aqui estamos usando o 'D' do SOLID para que possamos trocar de banco de dados no futuro sem sofrer"*.
