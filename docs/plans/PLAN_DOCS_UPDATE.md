# Plan: Documentation Audit and Update (Ultimate Kanban)

This plan outlines the updates required to synchronize the project documentation with the current state of the "Ultimate Kanban" system and the recent drag-and-drop enhancements.

## Proposed Changes

### 1. Architecture Update
- **[MODIFY] [ARCHITECTURE.md](file:///D:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/docs/architecture/ARCHITECTURE.md)**: Add section on "Standardized Column Infrastructure" and updated RLS policies.
- **[MODIFY] [MASTER_KANBAN.md](file:///D:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/docs/architecture/01-architecture/MASTER_KANBAN.md)**: Detail the 12 standard columns, the `sync_kanban_columns_to_all_orgs()` trigger, and the `moveCardToMasterStatus` logic.

### 2. Feature Documentation
- **[MODIFY] [MASTER_KANBAN_FEATURE.md](file:///D:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/docs/features/MASTER_KANBAN_FEATURE.md)**: Update the feature scope to include the hybrid movement logic (Global Status -> Local Column).

### 3. Change Tracking
- **[MODIFY] [CHANGELOG.md](file:///D:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/docs/architecture/CHANGELOG.md)**: Add entries for Ultimate Kanban (v1.5) and Drag-and-Drop Fix (v1.6).
- **[MODIFY] [DATABASE_MIGRATIONS.md](file:///D:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/docs/architecture/DATABASE_MIGRATIONS.md)**: Reference migration `20260213_setup_ultimate_kanban.sql` and the RPC updates.

### 4. New Developer Guide
- **[NEW] [KANBAN_DEVELOPER_GUIDE.md](file:///D:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/docs/guides/KANBAN_DEVELOPER_GUIDE.md)**: A concise guide explaining the ID mismatch gotcha (`id` vs `card_id`), optimistic state updates, and how to use `moveCardToMasterStatus`.

## Execution Agents
- **@documentation-writer**: Will execute the file modifications and creations.
- **@frontend-specialist**: Will review the developer guide for technical accuracy.
- **@test-engineer**: Will verify the documentation after update.

## Verification Plan
- [ ] Verify all internal documentation links.
- [ ] Review by USER.
