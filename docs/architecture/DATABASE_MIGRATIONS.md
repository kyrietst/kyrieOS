# Database Migrations

> **Last Updated:** 2026-02-14

## Migration Registry

| Timestamp | File | Description | Status |
|-----------|------|-------------|--------|
| 20240129215000 | `create_time_entries.sql` | Legacy time entries table | Applied |
| 20260130000000 | `prd_2_0_schema.sql` | PRD 2.0 base schema | Applied |
| 20260130_002 | `create_tasks.sql` | Tasks table | Applied |
| 20260130_003 | `create_reports.sql` | Reports table | Applied |
| 20260130_004 | `create_business_metrics.sql` | Business metrics table | Applied |
| 20260130_005 | `create_client_health.sql` | Client health table | Applied |
| 20260130_006 | `create_activities.sql` | Activities table | Applied |
| 20260130_007 | `seed_data.sql` | Initial seed data | Applied |
| 20260130_008 | `update_organizations.sql` | Extended organizations fields | Applied |
| 20260207 | `add_ice_and_wip.sql` | ICE scoring + WIP limits | Applied |
| 20260207 | `add_labels_system.sql` | kanban_labels + junction table | Applied |
| 20260212 | `master_kanban_refactor.sql` | RLS policies, Master View, RPC | Applied |
| 20260212 | `global_columns.sql` | Global column seed + data migration | Applied |
| 20260212 | `create_kanban_time_entries.sql` | Card-based time tracking table | Applied |
| 20260212 | `fix_time_tracking_schema.sql` | Time tracking schema fixes | Applied |
| 20260213 | `setup_ultimate_kanban.sql` | 12 standard columns + replication trigger | Applied |
| 20260213 | `capacity_guard_schema.sql` | `estimated_minutes` column + capacity features | Applied |
| 20260214 | `create_card_covers_bucket.sql` | Supabase Storage bucket for card covers | Applied |
| 20260214 | `add_is_pinned_to_kanban_cards.sql` | `is_pinned` + `pinned_at` columns + index | Applied |
| 20260214 | `update_master_kanban_for_pin.sql` | Updated View + RPC with pin + cover fields | Applied |

## How to Apply Migrations

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Login
npx supabase login

# Link to project
npx supabase link --project-ref <project-id>

# Create a new migration
npx supabase migration new <migration_name>

# Push all pending migrations
npx supabase db push
```

## Key Migrations Detail

### Ultimate Kanban (2026-02-13)
`20260213_setup_ultimate_kanban.sql`:
- Created 12 standard global columns (`organization_id = NULL`)
- Backfilled all existing organizations with local copies
- Created trigger `sync_kanban_columns_to_all_orgs` for automatic replication

### Pin Feature (2026-02-14)
`20260214_add_is_pinned_to_kanban_cards.sql`:
- Added `is_pinned BOOLEAN DEFAULT false`
- Added `pinned_at TIMESTAMPTZ`
- Created index for query performance

`20260214_update_master_kanban_for_pin.sql`:
- Recreated `master_kanban_view` with pin + cover fields
- Updated `get_master_kanban` RPC to sort pinned cards first
