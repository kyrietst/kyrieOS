# Plan: Dynamic Editable Kanban Columns

## 1. Context & Diagnosis
We confirmed that the Kanban columns are **not hardcoded**. They are stored in the `kanban_columns` table in Supabase.
- **Master View (Global Columns)**: `organization_id` is `NULL`.
- **Client View**: `organization_id` is set to the specific organization.

The "static" feeling comes from the frontend (`KanbanBoard.tsx`) rendering the column name as a simple `<h3>` text element without any edit interface.

## 2. Objective
Enable "Click to Rename" functionality for Kanban columns, similar to Trello/Notion.

## 3. Implementation Plan

### 3.1. Database & Permissions (Existing)
Current RLS policies in `20260213_setup_ultimate_kanban.sql` already define:
- **Global Columns**: Only `KYRIE_ADMIN` / `KYRIE_TEAM` can update.
- **Client Columns**: Users can update their own organization columns (if they have permissions, though `20260213` migration might have restricted this to Admin/Team only. We need to verify if "Client Owner" should be able to rename their *local* columns. The migration says: `Kyrie staff can modify columns` policy uses `role IN ('KYRIE_ADMIN', 'KYRIE_TEAM')`. **This means currently Client Owners CANNOT rename their columns.**)

> **Decision**: We will respect current RLS. If the user is not Admin/Team, the update action will fail (or we disable the UI). **However**, for this task, we will focus on enabling the feature. If the user wants Clients to reuse standard columns, they shouldn't edit them. If they want Clients to have *custom* columns, we'd need to change RLS.
> **Assumption**: The user requesting this is likely testing as 'Master' or wants this for the Admin view. We will implement the UI.

### 3.2. Backend: Server Action
Create a new action in `actions/kanban.ts` (or `master-kanban.ts`):

```typescript
// actions/kanban.ts
export async function updateColumnName(columnId: string, newName: string) {
  // 1. Validate input
  // 2. Update 'kanban_columns'
  // 3. Revalidate path
}
```

### 3.3. Frontend: `KanbanColumnHeader` Component
Create `components/kanban/KanbanColumnHeader.tsx` to encapsulate the edit logic.

**Features:**
- Displays column name.
- Shows "Global" badge if applicable.
- On click: Swaps text for an `<input autoFocus />`.
- On `Blur` or `Enter`: Saves the new name.
- Optimistic update: UI updates immediately, reverts on error.

### 3.4. Frontend: Integration
Modify `components/kanban/KanbanBoard.tsx`:
- Import `KanbanColumnHeader`.
- Replace the existing `<h3>` content in `SortableColumn` with the new component.

## 4. Step-by-Step Execution

1.  **Create Server Action**:
    - Add `updateColumnName` to `actions/kanban.ts` ([x] Done).
2.  **Create Component**:
    - Build `components/kanban/KanbanColumnHeader.tsx`.
3.  **Refactor Board**:
    - Update `KanbanBoard.tsx` to use the new header.
4.  **Verification**:
    - Test renaming a Global Column (as Admin).
    - Test renaming a Client Column (verify permissions).

## 5. Files to Create/Modify
- `[NEW]`: `components/kanban/KanbanColumnHeader.tsx`
- `[MODIFY]`: `actions/kanban.ts`
- `[MODIFY]`: `components/kanban/KanbanBoard.tsx`
