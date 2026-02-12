# PLAN - Fix Time Tracking Database Schema

Coordinate database-architect, backend-specialist, and test-engineer to fix the 500 error in Kanban time tracking.

## Investigation Summary
1.  **Table Presence**: `kanban_time_entries` exists but has 14 records and duplicate RLS policies.
2.  **Root Cause**: Missing Foreign Key from `kanban_time_entries.user_id` to `profiles.id`. This causes the join `profiles:user_id` in `actions/time-tracking.ts` to fail at the PostgREST layer.
3.  **Conflict**: Duplicate RLS policies on the table.

## Proposed Strategy
1.  **Phase 1 (Planning)**: Get user approval for table recreation (data loss warning for 14 records).
2.  **Phase 2 (Implementation)**:
    - [database-architect]: Execute migration to DROP and CREATE `kanban_time_entries` with:
        - `user_id` referencing `profiles(id)`.
        - Unique constraint for active timers.
        - Simplified RLS policies.
    - [backend-specialist]: Verify `actions/time-tracking.ts` logic alignment.
3.  **Phase 3 (Verification)**:
    - [test-engineer]: Run verification SQL and test UI.

## Critical Warnings
> [!CAUTION]
> Recreating the table will delete 14 existing time logs. If these are productive data, we should migrate the data instead of dropping.

> [!IMPORTANT]
> Join mapping in code expects a relationship with `profiles`. The new schema MUST ensure this relationship is discoverable.
