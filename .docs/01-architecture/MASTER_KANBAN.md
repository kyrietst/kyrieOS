# Master Kanban Architecture

> **Status:** Implemented (February 2026)
> **Scope:** Backend, Database, Frontend
> **Key Features:** Global Columns, RLS Security, Master View, Server Actions

## 1. Overview

The Master Kanban system provides a unified view of all tasks across different organizations for `KYRIE_ADMIN` users, while maintaining strict data isolation for standard users. The system was refactored in Feb 2026 to move from a client-side aggregation model to a secure, performant server-side model using Postgres features.

## 2. Core Concepts

### 2.1 Global Columns
Instead of each organization having its own set of "Todo", "Doing", and "Done" columns, the system now uses **Global Columns**.
- **Definition:** Records in `kanban_columns` where `organization_id` is `NULL`.
- **Purpose:** Standardize the card lifecycle across all tenants.
- **Migration:** Legacy columns were migrated to these global columns.
- **Custom Columns:** Organizations can still create custom columns (`organization_id` NOT NULL), which appear alongside global ones in their specific views.

### 2.2 Hybrid Column Visibility
- **Kyrie Admin:** Sees Global Columns + All Custom Columns (via Master View).
- **Client Owner/Viewer:** Sees Global Columns + Their Organization's Custom Columns.

## 3. Database Schema & Security

### 3.1 Row Level Security (RLS)
Security is enforced at the database layer, ensuring no data leaks regardless of the frontend implementation.

| Table | Policy | Description |
|-------|--------|-------------|
| `kanban_cards` | Select/Modify | Users access own org's data; Admins access all. |
| `kanban_columns` | Select | Users see own org's columns OR Global columns (`org_id IS NULL`). |
| `kanban_columns` | Modify | Users modify own columns; Admins modify all (Global requires Admin). |
| `kanban_labels` | Select/Modify | Isolated by organization. |

### 3.2 Master Kanban View (`master_kanban_view`)
A SQL View abstracts the complexity of joining cards, columns, and organizations.
- **Joins:** `kanban_cards` -> `organizations`, `kanban_columns`.
- **Computed Fields:** `master_status` (Normalizes status to 'todo', 'doing', 'done' based on column properties).
- **Usage:** Used by the Admin Dashboard to render the unified board.

### 3.3 RPC: `get_master_kanban`
A Postgres function for high-performance data retrieval.
- **Features:** Server-side pagination, Filtering (Status, Search), Ordering.
- **Security:** Inherits RLS policies context.

## 4. Application Layer

### 4.1 Server Actions (`actions/kanban.ts`)
- `getKanbanColumns(orgId)`: Fetches global columns AND org-specific columns using `.or()` query.
- `getMasterKanban(...)`: Calls the RPC function for the admin view.

### 4.2 Frontend Components
- **`KanbanBoard.tsx`**:
  - Distinguishes Global Columns via `organization_id === null`.
  - Renders visual indicators (Badges) for Global Columns.
  - Disables editing/deleting of Global Columns for non-admins.
- **`KanbanCard.tsx`**:
  - Displays Organization Badge (Logo/Name) in Master View.

## 5. Migration History
- **2026-02-12:** Refactor to RLS and Global Columns.
  - `20260212_master_kanban_refactor.sql`: RLS Policies, Master View, RPC.
  - `20260212_global_columns.sql`: Global Column Seed, Data Migration, Column Cleanup.
