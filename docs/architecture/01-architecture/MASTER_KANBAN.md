# Master Kanban Architecture

> **Status:** Implemented (February 2026)
> **Last Updated:** 2026-02-14
> **Scope:** Backend, Database, Frontend

## 1. Overview

The Master Kanban system provides a unified view of all tasks across different organizations for `KYRIE_ADMIN` users, while maintaining strict data isolation for standard users. The system uses Postgres Views, RPCs, and RLS for security and performance.

## 2. Core Concepts

### 2.1 Global Columns (12 Standard)
Records in `kanban_columns` where `organization_id IS NULL`.

| # | Column | Purpose |
|---|--------|---------|
| 1 | INFO / CLIENTES | Client onboarding info |
| 2 | IDEIAS / BACKLOG | Ideas and future tasks |
| 3 | AGENDADO | Scheduled tasks |
| 4 | REUNIÃO | Meetings and calls |
| 5 | EM ANDAMENTO | Active work |
| 6 | EM PAUSA / BLOCK | Blocked tasks |
| 7 | REVISÃO INTERNA | Internal QA |
| 8 | APROVAÇÃO CLIENTE | Client approval pending |
| 9 | ALTERAÇÕES | Change requests |
| 10 | APROVADO / AG. POST | Ready for delivery |
| 11 | CONCLUÍDO | Done |
| 12 | CANCELADO / ARQUIVADO | Cancelled/Archived |

**Sync Trigger:** `sync_kanban_columns_to_all_orgs` replicates global column changes to all organizations.

### 2.2 Visibility Rules
- **Kyrie Admin:** Global Columns + All Custom Columns (Master View)
- **Client Owner:** Global Columns + Their Organization's Custom Columns

## 3. Database Layer

### 3.1 Row Level Security (RLS)

| Table | Policy | Description |
|-------|--------|-------------|
| `kanban_cards` | Select/Modify | Users access own org; Admins access all |
| `kanban_columns` | Select | Users see own org + Global (`org_id IS NULL`) |
| `kanban_columns` | Modify | Users modify own; Admins modify all |
| `kanban_labels` | Select/Modify | Isolated by organization |

### 3.2 Master Kanban View (`master_kanban_view`)
SQL View joining `kanban_cards` → `organizations`, `kanban_columns`, `kanban_card_labels`.

**Returns:**
- All card fields (title, description, position, priority, due_date)
- Cover fields (`cover_type`, `cover_value`, `cover_mode`, `cover_size`, `cover_text_theme`)
- Pin fields (`is_pinned`, `pinned_at`)
- Capacity fields (`estimated_minutes`, `assigned_to`)
- Organization data (`organization_name`, `organization_slug`, `organization_logo`)
- Column data (`original_column_name`, `is_done_column`)
- Computed `master_status` (`'todo'`, `'doing'`, `'done'`)
- Aggregated `labels` (JSONB array of `{name, color}`)

**Filter:** `WHERE c.is_archived = false`

### 3.3 RPC: `get_master_kanban`
```sql
get_master_kanban(
  page INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50,
  status_filter TEXT DEFAULT NULL,  -- 'todo', 'doing', 'done'
  search_text TEXT DEFAULT NULL
)
```

**Sorting:** `is_pinned DESC NULLS LAST` → `updated_at DESC`

## 4. Application Layer

### 4.1 Server Actions

| Action | File | Purpose |
|--------|------|---------|
| `getKanbanColumns(orgId)` | `kanban.ts` | Client = local columns, Master = global columns |
| `getMasterKanban(...)` | `master-kanban.ts` | Calls RPC for paginated admin view |
| `moveCardToMasterStatus(cardId, targetGlobalColumnId)` | `kanban.ts` | Translates global moves to local persistence |
| `toggleCardPin(cardId, isPinned)` | `kanban.ts` | Updates `is_pinned` + `pinned_at` |

### 4.2 Frontend Components

| Component | Responsibility |
|-----------|---------------|
| `KanbanBoard.tsx` | DnD orchestrator, optimistic state, pin toggle handler |
| `KanbanCard.tsx` | Card rendering, cover display, pin indicator |
| `KanbanCardMenu.tsx` | Context menu: pin, duplicate, archive, cover |
| `KanbanCardDetails.tsx` | Full card modal (Notion-like) |
| `CardCoverSelector.tsx` | Cover image/color picker |

### 4.3 Card Features

#### Pin System
- **Purpose:** Fix important cards at the top of their column
- **Visual:** Sky-blue Pin icon (rotated 45°) next to title
- **Optimistic:** Local state updates immediately, framer-motion animates reorder
- **Callback chain:** `KanbanBoard.handlePinToggle` → `SortableColumn` → `SortableCard` → `KanbanCard` → `KanbanCardMenu`

#### Cover System
- **Types:** Color (hex/Tailwind class) or Image (Supabase Storage URL)
- **Modes:** `header` (banner at top) or `full` (image fills entire card)
- **Sizes:** `small` (80px) or `large` (160px)
- **Text Theme:** `light` or `dark` for contrast control on full covers

#### Realtime Sync
- Supabase Realtime listener on `kanban_cards` table
- On any change → `router.refresh()` triggers server revalidation
- Combined with React Prop Sync pattern (`useEffect` on initialCards)

## 5. Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2026-02-12 | `20260212_master_kanban_refactor.sql` | RLS Policies, Master View, RPC |
| 2026-02-12 | `20260212_global_columns.sql` | Global Column Seed, Data Migration |
| 2026-02-13 | `20260213_setup_ultimate_kanban.sql` | 12 standard columns, replication trigger |
| 2026-02-14 | `20260214000000_create_card_covers_bucket.sql` | Supabase Storage bucket for covers |
| 2026-02-14 | `20260214_add_is_pinned_to_kanban_cards.sql` | `is_pinned`, `pinned_at` columns + index |
| 2026-02-14 | `20260214_update_master_kanban_for_pin.sql` | Updated View + RPC with pin + cover fields |
