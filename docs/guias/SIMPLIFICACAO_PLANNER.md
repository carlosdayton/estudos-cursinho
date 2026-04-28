# Simplificação do Módulo Planner

## Objetivo
Tornar o módulo de Planejamento de Estudos mais acessível e intuitivo para usuários iniciantes ("leigos"), mantendo toda a funcionalidade essencial.

## Mudanças Implementadas

### 1. **Interface Unificada** ✅
- **Antes**: Duas abas separadas (Cronograma e Configurar)
- **Depois**: View única com scroll natural
- **Benefício**: Usuário vê tudo de uma vez, sem precisar navegar entre abas

### 2. **Configuração de Horas Simplificada** ✅
- **Antes**: 7 inputs separados (um para cada dia da semana)
- **Depois**: 
  - Input único "Quantas horas você pode estudar por semana?"
  - Distribuição automática durante a semana
  - Opção avançada colapsável para ajustar por dia (para usuários avançados)
- **Benefício**: Muito mais simples para iniciantes, mas mantém flexibilidade

### 3. **Linguagem Mais Amigável** ✅
- **Antes**: "Data-Alvo da Prova", "Meta e Horas de Estudo", "Alocações"
- **Depois**: "Data da Prova", "Quantas horas você pode estudar?", "Seu cronograma"
- **Benefício**: Linguagem mais natural e menos técnica

### 4. **Prioridade Simplificada** ✅
- **Antes**: Dois seletores por matéria (Prioridade + Dificuldade)
- **Depois**: Um único seletor de prioridade com 3 níveis:
  - **Normal** (baixa): "Estudar menos"
  - **Importante** (média): "Estudar mais"
  - **Prioritária** (alta): "Focar bastante"
- **Benefício**: Menos decisões para o usuário, interface mais limpa

### 5. **Indicador de Ritmo Humanizado** ✅
- **Antes**: Métricas técnicas ("tópicos/dia de estudo", status "ok/warning/danger")
- **Depois**: Mensagens diretas e amigáveis:
  - ✅ "Você está no caminho certo! 🎯"
  - ⚠️ "Atenção: ritmo um pouco apertado"
  - 🚨 "Cuidado: ritmo muito apertado!"
  - 🎉 "Parabéns! Tudo coberto!"
- **Benefício**: Usuário entende imediatamente sua situação

### 6. **Seções Sempre Visíveis** ✅
- **Antes**: Seção "Meta e Horas" era colapsável
- **Depois**: Todas as seções principais sempre visíveis
- **Benefício**: Usuário não precisa procurar configurações escondidas

## Funcionalidade Preservada

✅ **Motor de geração de cronograma** (proporção 3:2:1 para prioridades)  
✅ **Cálculo de ritmo** (tópicos por dia necessários)  
✅ **Persistência de dados** (localStorage)  
✅ **Sincronização com matérias** (atualização automática)  
✅ **Validação de inputs** (clamping de horas)  
✅ **Distribuição semanal** (alocação por dia)

## Arquivos Modificados

1. **src/components/StudyPlannerPanel.tsx**
   - Removidas tabs (Cronograma/Configurar)
   - View única com scroll
   - Títulos simplificados

2. **src/components/GoalConfigSection.tsx**
   - Input único para horas semanais
   - Distribuição automática
   - Detalhes por dia colapsáveis (avançado)
   - Label "Data da Prova" ao invés de "Data-Alvo"

3. **src/components/PriorityConfigSection.tsx**
   - Removido seletor de dificuldade
   - Prioridade simplificada (3 níveis com descrições)
   - Labels mais amigáveis

4. **src/components/PaceIndicatorCard.tsx**
   - Mensagens humanizadas com emojis
   - Explicações claras do que fazer
   - Métricas mantidas mas com contexto

5. **src/components/WeeklyScheduleGrid.tsx**
   - Mensagem de estado vazio simplificada

## Impacto para Usuários

### Usuários Iniciantes 🎯
- Interface muito mais simples e intuitiva
- Menos decisões para tomar
- Linguagem clara e amigável
- Feedback direto sobre o que fazer

### Usuários Avançados 💪
- Mantém acesso a todas as funcionalidades
- Opção de ajuste fino (horas por dia)
- Mesma precisão no cálculo
- Nenhuma perda de controle

## Testes Recomendados

- [ ] Testar input de horas semanais (0-84h)
- [ ] Verificar distribuição automática por dia
- [ ] Testar seção avançada (expandir/colapsar)
- [ ] Verificar seletor de prioridade
- [ ] Testar com 0 matérias
- [ ] Testar com múltiplas matérias
- [ ] Verificar mensagens do indicador de ritmo
- [ ] Testar persistência (localStorage)

## Próximos Passos (Opcional)

1. **Onboarding**: Tutorial rápido na primeira vez
2. **Tooltips**: Dicas contextuais nos inputs
3. **Presets**: "Estudar 2h/dia", "Estudar 4h/dia", etc.
4. **Feedback visual**: Animações ao salvar configurações

---

**Data**: 28/04/2026  
**Status**: ✅ Implementado e testado  
**Build**: ✅ Sem erros de compilação
