# Relatório de Auditoria e Plano de Refatoração: Time Tracking

**Data:** 12/02/2026
**Autor:** Orchestrator (Antigravity Class)
**Objetivo:** Migrar o sistema de rastreamento de tempo de "Global/Solto" para "Estritamente por Card".

---

## 1. Análise de Situação Atual

### 1.1. Banco de Dados (`supabase/migrations`)
*   **Tabela Existente (`time_entries`):** Criada em `20240129...`. Suporta timers soltos (sem `card_id`).
*   **Tabela Fantasma (`kanban_time_entries`):** Referenciada no código de backend (`actions/time-tracking.ts`), mas **não encontrada** nos arquivos de migração.
    *   **Diagnóstico:** O código de backend parece estar preparado para uma tabela que ainda não foi formalmente versionada ou foi criada manualmente.
    *   **Ação Necessária:** Criar uma migração oficial para `kanban_time_entries` garantindo a integridade dos dados e Foreign Keys corretas.

### 1.2. Backend (`actions/time-tracking.ts`)
*   O código já implementa a lógica correta ("Per Card"):
    *   `startTimer(cardId)`: Inicia timer vinculado ao card e para anteriores.
    *   `stopTimer()`: Para o timer ativo do usuário.
    *   Referencia a tabela `kanban_time_entries`.
*   **Status:** O código parece correto conceitualmente, mas precisa ser validado contra a nova migração que criaremos.

### 1.3. Frontend (`components`)
*   **`components/timer/GlobalTimer.tsx` (LEGADO):**
    *   Usa a tabela antiga `time_entries`.
    *   Permite iniciar timers sem card (apenas descrição).
    *   **Ação:** Precisa ser refatorado para servir apenas como um "Monitor Global" do timer ativo do card. Não deve mais permitir criar timers "avulsos".
*   **`components/kanban/KanbanCard.tsx`:**
    *   Já possui integração com `startTimer` e exibe `TimerBadge`.
    *   Importa `TimerBadge` (encontrado em `components/kanban/TimerBadge.tsx`).
    *   UX atual: Botão "Play" no hover.

---

## 2. Plano de Correção (Refactoring Plan)

### Fase 1: Banco de Dados
1.  **Criar Migração `create_kanban_time_entries`:**
    *   Campos: `id`, `card_id` (FK Not Null), `user_id` (FK), `start_time`, `end_time`, `duration` (segundos), `description` (copiado do título do card ou nuill).
    *   Índices em `user_id` e `card_id`.
    *   Políticas RLS para leitura/escrita do próprio usuário.

### Fase 2: Backend
1.  **Validar `actions/time-tracking.ts`:**
    *   Garantir que os nomes das colunas batam com a nova migração.
    *   Adicionar validação extra: O usuário pode ter apenas UM timer rodando por vez (o código já faz isso, mas reforçar no banco via constraint ou function seria ideal, mas no código é aceitável para MVP).

### Fase 3: Frontend
1.  **Criar/Atualizar `TimerBadge.tsx` (`components/kanban/`):**
    *   Componente visual pequeno para mostrar "00:15:30" dentro do card.
    *   Deve pulsar ou ter cor de destaque (ex: vermelho/laranja) quando ativo.
2.  **Refatorar `KanbanCard.tsx`:**
    *   **UX de Ativação:** O botão de Play deve virar Pause/Stop se o timer estiver rodando NESTE card.
    *   **Destaque Visual:** Se `isTimerActive` for true, a borda do card deve ficar colorida (ex: `border-amber-500`) ou ter um "glow" sutil para fácil identificação no meio de 50 cards.
3.  **Refatorar `GlobalTimer.tsx`:**
    *   **Mudança de Papel:** De "Criador de Tarefa" para "Dock de Controle".
    *   Se existir um timer rodando (buscado via `getUserActiveTimer`), ele exibe: "Trabalhando em: [Nome do Card] - 00:45:10".
    *   Botão de "Stop" ou "Abrir Card".
    *   Se não houver timer, fica oculto ou mostra "Nenhuma tarefa ativa".

### Fase 4: Limpeza
1.  Depreciar a tabela `time_entries` antiga (ou mantê-la para histórico se houver dados legados importantes, mas remover o acesso de escrita).

---

## 3. Aprovação Necessária

Você, usuário, autoriza o início da implementação deste plano?

1.  Criar tabela `kanban_time_entries`.
2.  Refatorar `GlobalTimer` e `KanbanCard`.
3.  Criar componentes visuais de destaque.
