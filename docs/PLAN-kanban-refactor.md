# 📉 Plan: Remove Master Kanban Logic & Unify Views

## Context
The current "Master Kanban" at `/kyrie/workspace/kanban` relies on an outdated architecture (`useMasterKanban`, `actions/master-kanban.ts`) that forces a 3-column layout (Todo/Doing/Done) via "fake" data transformation. The goal is to remove this restriction and the unused SQL views, making the Master Board a true "Unified Board" that displays all cards across the actual dynamic Global Columns.

## User Review Required
> [!IMPORTANT]
> This change will strictly replace the "3-column" view with the "Dynamic Global Columns" view in the Master Board.
> If the Global Columns are named differently or have different IDs, the board layout will change immediately to reflect the *real* database state.

## Proposed Changes

### 1. Database Cleanup
#### [DELETE] Views
- `master_kanban_view`
- `capacity_burn_down_view`
- Create a migration file `supabase/migrations/[timestamp]_drop_kanban_views.sql` to drop these views.

### 2. Backend (Server Actions)
#### [MODIFY] [actions/kanban.ts](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/actions/kanban.ts)
- Update `getKanbanCards` to accept `organizationId` as optional or `null`.
- If `organizationId` is not provided, fetch ALL cards (filtered by `is_archived: false`).
- Ensure it returns the necessary relations (labels, organization info) needed for the Master View (which shows card organization badges).

#### [DELETE] [actions/master-kanban.ts](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/actions/master-kanban.ts)
- File will be deleted as its logic is merging into `kanban.ts`.

### 3. Frontend (Workspace Page)
#### [MODIFY] [app/kyrie/workspace/kanban/page.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/app/kyrie/workspace/kanban/page.tsx)
- Remove `useMasterKanban` hook usage.
- Switch to fetching data via `actions/kanban.ts`.
- Implement a cleaner client-side wrapper (if needed) or fetch directly in the Server Component (preferred if possible, but the current page seems to be Client Component with `useMasterKanban`, so we might need a `useUnifiedKanban` or just standard `useEffect` with the new actions).
- Remove the "Status" filter that relied on the 3 fake columns if it doesn't make sense anymore (or update it to filter by real columns).

#### [DELETE] [hooks/useMasterKanban.ts](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/hooks/useMasterKanban.ts)
- Hook is no longer needed.

## Verification Plan

### Automated Tests
- Run `npm run type-check` to ensure no Typescript errors after deleting files.
- Run `npm run lint` to check for unused imports.

### Manual Verification
1.  **View Workspace Kanban**: Go to `/kyrie/workspace/kanban`.
    *   Verify it loads with *Dynamic Columns* (not just Todo/Doing/Done).
    *   Verify cards from *ALL* organizations appear.
    *   Verify cards show their Organization Badge (if implemented).
2.  **View Client Kanban**: Go to `/kyrie/clients/[slug]/kanban`.
    *   Verify it still works exactly as before (regression test).
3.  **Database**:
    *   Check Supabase Dashboard to confirm views are gone.
