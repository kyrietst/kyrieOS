# Master Kanban Technical Audit

**Date:** 2026-02-12  
**Status:** Pre-Refactor Discovery  
**Project ID:** `hylymuflzllekxuloooe`

---

## 1. Code Analysis (Frontend & Hooks)

### Data Flow Mapping
1. **`app/kyrie/workspace/kanban/page.tsx`**: 
   - Consumes the `useMasterKanban` hook.
   - Renders a `Search` input and `Select` status filter.
   - Passes cards and columns to the `KanbanBoard` component with `organizationId="master"`.

2. **`hooks/useMasterKanban.ts`**:
   - Manages state for `cards`, `isLoading`, `page`, and `filters`.
   - **Discrepancy:** The `columns` array is hardcoded as virtual columns:
     ```typescript
     const columns = [
         { id: 'master-todo', title: 'A Fazer', status: 'todo' },
         { id: 'master-doing', title: 'Em Progresso', status: 'doing' },
         { id: 'master-done', title: 'Concluído', status: 'done' }
     ];
     ```
   - This prevents the UI from using the actual `Global Columns` defined in the database.

3. **`actions/master-kanban.ts`**:
   - Executes the `get_master_kanban` RPC.
   - Maps the flat response from the RPC back into the `MasterKanbanResponse` type.

---

## 2. Database Analysis (Supabase Kyrie)

### Table Schema Audit
- **`kanban_cards`**: Correctly updated with `ice_score`, `priority`, and `due_date`.
- **`kanban_columns`**: Current schema allows `organization_id` to be `NULL` (Global Columns).
- **`kanban_labels`**: Standardized structure for multi-tenant labels.

### RLS Policies (Row Level Security)
The audit confirmed that policies from `20260212_master_kanban_refactor.sql` are active:
- **`Kyrie Admins can view all cards`**: Active. Allows users with `role = 'KYRIE_ADMIN'` to bypass organization filters.
- **`Users can view own and global columns`**: Active. Allows fetching columns where `organization_id` matches user OR is `NULL`.

### RPC & Views
- **`view master_kanban_view`**: Exists. It correctly joins cards, organizations, and columns, computing `master_status` via a `CASE` statement.
- **`function get_master_kanban`**: Exists. It supports pagination, search text, and status filtering.

---

## 3. Discrepancies & Discovered Issues

### Code vs. Database Drift
| Element | Database State | Code State | Audit Veredict |
| :--- | :--- | :--- | :--- |
| **Columns** | Global Columns exist (NULL org) | Hardcoded Virtual IDs | **Drift**: Code is not using real global IDs. |
| **Data Types** | `labels` is JSONB in RPC/View | `labels` type exists in `MasterKanbanCard` | **Aligned**: Types are ready for refactor. |
| **Search** | Case-insensitive ILIKE in RPC | Debounced filter in hook | **Aligned**: Efficient backend search. |

### Critical Foundings
> [!IMPORTANT]
> **Virtual vs. Real IDs**: The `KanbanBoard` currently receives virtual IDs from the hook (`master-todo`), but the `cards.column_id` from the RPC reflects the **actual database UUID** of the original customer column or the new global column. This may cause drag-and-drop failures if not handled.

> [!WARNING]
> **RLS Bypass**: While `KYRIE_ADMIN` policies are correct, the `startTimer` and `stopTimer` actions in `time-tracking.ts` do not explicitly check for Admin context, relying strictly on `auth.uid()`, which is correct for personal logs but should be audited for "viewing others' logs" if needed in the future.

---

## Veredict: Ready for Refactor
The database layer is fully prepared with the necessary View and RPC. The next phase should focus on updating `useMasterKanban.ts` to fetch actual global columns and resolving the ID mapping between database UUIDs and master categories.
