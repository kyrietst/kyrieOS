# Kyrie OS Database Schema

This document outlines the database schema for the Kyrie OS application. It is the single source of truth for the database structure.

> **Last Updated:** 2026-02-14 — Reflects live production schema including Pin, Covers, Capacity Guard, and Archiving features.

## Tables

### `kanban_cards`
Cards for the Kanban board (Tasks, Tickets, Projects). This is the **central entity** of the system.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary Key |
| `organization_id` | `uuid` | NO | | FK → `organizations.id` |
| `column_id` | `uuid` | NO | | FK → `kanban_columns.id` |
| `title` | `text` | NO | | Card title |
| `description` | `text` | YES | | Card description (Markdown) |
| `position` | `integer` | NO | `0` | Sort order within column |
| `priority` | `text` | YES | `'medium'` | `low`, `medium`, `high`, `urgent` |
| `due_date` | `date` | YES | | Due date |
| `assigned_to` | `uuid` | YES | | FK → `auth.users` |
| `created_by` | `uuid` | YES | | Creator |
| `project_id` | `uuid` | YES | | FK → `projects.id` |
| **ICE Scoring** | | | | |
| `ice_impact` | `integer` | YES | | 0-10 |
| `ice_confidence` | `integer` | YES | | 0-10 |
| `ice_effort` | `integer` | YES | | 0-10 |
| `ice_ease` | `integer` | YES | `5` | 0-10 |
| `impact` | `integer` | YES | | Simplified impact |
| `confidence` | `integer` | YES | | Simplified confidence |
| `effort` | `integer` | YES | | Simplified effort |
| `ice_score` | `numeric` | YES | | Calculated ICE score |
| **Cover System** | | | | |
| `cover_type` | `text` | YES | | `'color'` or `'image'` |
| `cover_value` | `text` | YES | | Hex color or Storage URL |
| `cover_mode` | `text` | YES | `'header'` | `'header'` (banner) or `'full'` (full cover) |
| `cover_size` | `text` | YES | `'small'` | `'small'` or `'large'` |
| `cover_text_theme` | `text` | YES | `'dark'` | `'light'` or `'dark'` — text contrast on covers |
| `cover_color` | `text` | YES | | Legacy color field |
| **Pin Feature** | | | | |
| `is_pinned` | `boolean` | YES | `false` | Whether card is pinned to top of column |
| `pinned_at` | `timestamptz` | YES | | Timestamp of when pinned |
| **Capacity Guard** | | | | |
| `estimated_minutes` | `integer` | YES | `0` | Estimated effort in minutes |
| **Lifecycle** | | | | |
| `is_archived` | `boolean` | YES | `false` | Soft delete flag |
| `labels` | `text[]` | YES | `'{}'` | Legacy labels array |
| `trello_card_id` | `text` | YES | | External Trello ID (migration) |
| `created_at` | `timestamptz` | YES | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | YES | `now()` | Updated timestamp |
| `completed_at` | `timestamptz` | YES | | Completion timestamp |

---

### `kanban_columns`
Columns for the Kanban board. Supports both **Global** (system-wide) and **Local** (per-organization) columns.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | | Primary Key |
| `organization_id` | `uuid` | **YES** | | FK → `organizations.id`. **NULL = Global Column** |
| `name` | `text` | NO | | Column name |
| `color` | `text` | YES | | UI color |
| `icon` | `text` | YES | | UI icon |
| `position` | `integer` | NO | | Sort order |
| `is_default` | `boolean` | YES | | Default column for new cards |
| `is_done_column` | `boolean` | YES | | Cards here are considered "done" |
| `wip_limit` | `integer` | YES | | Work in Progress limit |
| `created_at` | `timestamptz` | YES | | Timestamp |
| `updated_at` | `timestamptz` | YES | | Timestamp |

> **Important:** `organization_id = NULL` defines a **Global Column** visible to all orgs. See [MASTER_KANBAN.md](MASTER_KANBAN.md) for details.

---

### `kanban_labels`
Custom labels for Kanban cards (junction table based).

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | FK → `organizations.id` |
| `name` | `text` | NO | Label text |
| `color` | `text` | NO | Label color |
| `created_at` | `timestamptz` | YES | Timestamp |

### `kanban_card_labels`
Junction table: Many-to-Many between `kanban_cards` and `kanban_labels`.

| Column | Type | Description |
| :--- | :--- | :--- |
| `card_id` | `uuid` | FK → `kanban_cards.id` |
| `label_id` | `uuid` | FK → `kanban_labels.id` |

---

### `kanban_time_entries`
Card-based time tracking.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `card_id` | `uuid` | NO | FK → `kanban_cards.id` |
| `user_id` | `uuid` | NO | FK → `auth.users` |
| `start_time` | `timestamptz` | NO | Timer start |
| `end_time` | `timestamptz` | YES | NULL = running |
| `duration` | `integer` | YES | Calculated seconds |

**Constraint:** `idx_one_active_timer_per_user` — Unique partial index (`WHERE end_time IS NULL`) ensures max 1 active timer per user.

---

### `organizations`
Represents Clients/Departments using the system.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `name` | `text` | NO | Organization Name |
| `slug` | `text` | NO | Unique URL slug |
| `logo_url` | `text` | YES | Logo Image URL |
| `metadata` | `jsonb` | YES | Arbitrary metadata |
| `status` | `text` | YES | `active`, `inactive`, `churned` |
| `monthly_fee` | `numeric` | YES | Revenue tracking |
| `contract_start` | `date` | YES | Contract date |
| `contract_end` | `date` | YES | Contract date |
| `industry` | `text` | YES | Industry segment |
| `created_at` | `timestamptz` | YES | Timestamp |
| `updated_at` | `timestamptz` | YES | Timestamp |

---

### `profiles`
User profiles linked to Supabase Auth.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | PK (Matches `auth.users.id`) |
| `full_name` | `text` | YES | Display Name |
| `avatar_url` | `text` | YES | Avatar |
| `role` | `text` | YES | `KYRIE_ADMIN`, `KYRIE_TEAM`, `CLIENT_OWNER`, `CLIENT_VIEWER` |
| `email` | `text` | YES | Email |
| `created_at` | `timestamptz` | YES | Timestamp |
| `updated_at` | `timestamptz` | YES | Timestamp |

---

### `projects`
Higher level grouping for tasks/cards.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | FK → `organizations.id` |
| `name` | `text` | NO | Project Name |
| `description` | `text` | YES | Description |
| `start_date` | `date` | YES | Start date |
| `target_date` | `date` | YES | Target completion |
| `status` | `text` | YES | `active`, `archived`, `completed` |
| `created_at` | `timestamptz` | YES | Timestamp |

---

### Supporting Tables

| Table | Purpose |
| :--- | :--- |
| `activities` | User activity feed events |
| `ai_conversations` | Chat sessions with AI agents |
| `ai_messages` | Individual messages in AI conversations |
| `approvals` | Multi-step approval workflows |
| `approval_history` | State change history for approvals |
| `business_metrics` | KPI snapshots for reporting |
| `client_health` | AI-generated health scores |
| `inbox_items` | Unified notification inbox |
| `notifications` | System notifications |
| `reports` | Generated reports (PDF/Excel) |
| `tasks` | Legacy simple tasks (deprecated) |
| `time_entries` | Legacy time entries (deprecated — use `kanban_time_entries`) |
| `wiki_pages` | Knowledge base articles |
| `wiki_embeddings` | Vector embeddings for RAG search |

---

## Views & RPCs

### `master_kanban_view`
Aggregates `kanban_cards` + `organizations` + `kanban_columns` + `kanban_card_labels` for the Admin Master View.

**Key computed field:** `master_status` → Normalizes to `'todo'`, `'doing'`, `'done'` based on column position and `is_done_column`.

### `get_master_kanban(page, page_size, status_filter, search_text)`
RPC function for paginated, filterable access to the Master View. Sorts by `is_pinned DESC`, then `updated_at DESC`.
