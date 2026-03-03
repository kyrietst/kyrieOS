# Task: Diagnose Kanban Column Jump Bug

## 1. Analysis & Discovery
- [x] Read `supabase/migrations/20260212_master_kanban_refactor.sql` (or similar) <!-- id: 1 -->
- [x] Inspect `KanbanBoard.tsx` drag-end logic <!-- id: 2 -->
- [x] Inspect `kanban_columns` configuration (is_done_column, position) via SQL <!-- id: 3 -->
- [x] Inspect `master_kanban_view` definition via SQL <!-- id: 4 -->
- [x] Check for triggers on `kanban_cards` <!-- id: 5 -->

## 2. Diagnosis & Fix
- [x] Identify root cause (Frontend hardcoded pos 2 = done) <!-- id: 6 -->
- [x] Propose SQL fix (Not needed, Frontend fix applied) <!-- id: 7 -->
- [x] Verify fix (Code updated) <!-- id: 8 -->

## 3. Drag Failure Debugging (Ghost Card)
- [x] Wrap `handleDragEnd` in `try...finally` <!-- id: 9 -->
- [x] Add logging for `active` and `over` <!-- id: 10 -->
- [x] Ensure safe access to `over.data.current` <!-- id: 11 -->

## 4. Ghost Card Investigation
- [x] Check `KanbanColumn` usage of `useSortable`/`useDroppable` data <!-- id: 12 -->
- [x] Verify `handleDragEnd` logic if `over.data` is missing <!-- id: 13 -->
- [x] Add fallback: check if `overId` exists in `columns` list <!-- id: 14 -->
- [x] Check `actions/kanban.ts` permissions for global columns <!-- id: 15 -->
