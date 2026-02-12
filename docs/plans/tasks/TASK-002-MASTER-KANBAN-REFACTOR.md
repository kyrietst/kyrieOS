# TASK-002: MASTER KANBAN REFACTOR (UUID ALIGNMENT)

## 1. Diagnóstico Rápido
**Problema:** O Master Kanban utiliza IDs virtuais hardcoded (`master-todo`, `master-doing`, `master-done`) no Frontend. No entanto, o banco de dados e as Server Actions esperam UUIDs reais de colunas que agora existem como "Global Columns" (onde `organization_id IS NULL`). Arrastar um card hoje gera um erro de integridade ou falha silenciosa pois o ID enviado não existe na tabela `kanban_columns`.

---

## 2. Plano de Ataque (Step-by-Step)

### Passo 1: Busca de Colunas Reais (`useMasterKanban.ts`)
Atualmente, o hook define um array estático. Devemos alterá-lo para:
1.  **Server Action**: Utilizar `getKanbanColumns('global')` (ajustando a action se necessário) ou uma nova action `getGlobalColumns()`.
2.  **Estado**: O hook deve carregar as colunas do banco do projeto `hylymuflzllekxuloooe` onde `organization_id IS NULL`.
3.  **Mapeamento**: Manter o campo `status` (ex: 'todo', 'doing', 'done') nas colunas retornadas para não quebrar a lógica de filtragem do `KanbanBoard`.

### Passo 2: Normalização de IDs no `KanbanBoard.tsx`
O `KanbanBoard` já possui lógica para diferenciar "Master View" (`organizationId === 'master'`).
1.  **Renderização**: Usar o `UUID` real da coluna global como a `id` do componente `SortableColumn`.
2.  **Filtro de Cards**: Ajustar o `cards.filter` para bater `c.master_status` com o `column.status` vindo do banco (ou computar o status baseado na posição/is_done_column se o status for nulo).

### Passo 3: Lógica de Drag-and-Drop (`onDragEnd`)
Quando o Admin move um card:
1.  **Identificação**: O `targetColumnId` será o UUID real da coluna global (ex: `97c1ed84...` para 'A Fazer').
2.  **Execução**: Chamar `moveCard(cardId, targetColumnId, position)`.
3.  **Persistência**: Como a coluna global é uma linha válida em `kanban_columns`, o banco aceitará o `UPDATE` sem erros de Foreign Key.

---

## 3. Checklist de Arquivos

- [ ] `actions/master-kanban.ts`: Criar ou exportar função para buscar colunas globais.
- [ ] `hooks/useMasterKanban.ts`: Substituir `columns` estático por `fetch` assíncrono.
- [ ] `components/kanban/KanbanBoard.tsx`: Garantir que a lógica de filtro aceite os novos objetos de coluna.

---

## 4. Critérios de Aceite (Definition of Done)

- [ ] As 3 colunas principais ("A Fazer", "Em Progresso", "Concluído") são carregadas dinamicamente do banco.
- [ ] Cada coluna possui a tag "Global" (lógica já existente no `KanbanBoard` para `org_id === null`).
- [ ] Um card arrastado entre colunas persiste a mudança no banco de dados.
- [ ] O `triggerConfetti()` continua funcionando ao soltar cards na coluna "Concluído" (UUID `171c4e37...`).

---

## 5. Referência: UUIDs Encontrados na Auditoria
- **A Fazer**: `97c1ed84-d712-4f32-a2d6-66990e2b77cd`
- **Em Progresso**: `1e125d14-d80a-4166-868e-15bc24b99e03`
- **Concluído**: `171c4e37-1490-4366-ad38-c7388273ecc6`
