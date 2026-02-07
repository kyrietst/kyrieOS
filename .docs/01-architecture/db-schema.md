
# Kyrie OS Database Schema

This document outlines the database schema for the Kyrie OS application. It is the single source of truth for the database structure.

> **Auto-Generated:** This file was restored based on the live database schema on 2026-02-01.

## Tables

### `activities`
Tracks user activity and system events for the activity feed.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `user_id` | `uuid` | YES | User who performed the activity |
| `user_name` | `text` | YES | Cached name of the user |
| `organization_id` | `uuid` | YES | Organization context |
| `activity_type` | `USER-DEFINED` | NO | Type enum (e.g., created, updated, deleted) |
| `title` | `text` | NO | Short title of the activity |
| `description` | `text` | YES | Detailed description |
| `target_type` | `text` | YES | Entity type (e.g., task, ticket, client) |
| `target_id` | `uuid` | YES | ID of the target entity |
| `target_name` | `text` | YES | Human readable name of the target |
| `metadata` | `jsonb` | YES | Extra data (diffs, etc.) |
| `created_at` | `timestamptz` | NO | Timestamp |

### `ai_conversations`
Stores chat sessions with the AI agents.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `user_id` | `uuid` | NO | User owner |
| `title` | `text` | YES | Conversation title |
| `created_at` | `timestamptz` | YES | Timestamp |

### `ai_messages`
Stores individual messages within an AI conversation.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `conversation_id` | `uuid` | NO | Foreign Key -> `ai_conversations.id` |
| `role` | `text` | NO | 'user' or 'assistant' |
| `content` | `text` | NO | Message content |
| `created_at` | `timestamptz` | YES | Timestamp |

### `approval_history`
History of state changes for approval workflows (purchase orders, etc.).

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `approval_id` | `uuid` | YES | Foreign Key -> `approvals.id` |
| `actor_id` | `uuid` | YES | User who changed the state |
| `status` | `text` | NO | New status |
| `comment` | `text` | YES | Reason/Comment |
| `created_at` | `timestamptz` | YES | Timestamp |

### `approvals`
Manages approval requests for various system entities (Purchase Orders, etc.).

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `requester_id` | `uuid` | NO | User requesting approval |
| `entity_type` | `text` | NO | e.g., 'purchase_order' |
| `entity_id` | `uuid` | NO | ID of the entity |
| `status` | `text` | YES | pending, approved, rejected |
| `current_step` | `integer` | YES | Current step in multi-step workflows |
| `total_steps` | `integer` | YES | Total steps required |
| `created_at` | `timestamptz` | YES | Timestamp |
| `updated_at` | `timestamptz` | YES | Timestamp |

### `business_metrics`
Snapshots of key business metrics for reporting.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `metric_type` | `text` | NO | e.g., 'mrr', 'churn', 'revenue' |
| `value` | `numeric` | NO | Numeric value |
| `period_start` | `date` | NO | Start of the period |
| `period_end` | `date` | NO | End of the period |
| `created_at` | `timestamptz` | YES | Timestamp |

### `client_health`
AI-generated health scores for clients.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `score` | `integer` | NO | 0-100 score |
| `sentiment` | `text` | YES | positive, neutral, negative |
| `summary` | `text` | YES | AI summary of health |
| `risks` | `jsonb` | YES | Array of identified risks |
| `opportunities` | `jsonb` | YES | Array of opportunities |
| `calculated_at` | `timestamptz` | YES | Timestamp |

### `inbox_items`
Unified inbox for notifications and urgent tasks.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `user_id` | `uuid` | NO | Owner |
| `organization_id` | `uuid` | YES | Related Org |
| `title` | `text` | NO | Item title |
| `description` | `text` | YES | Details |
| `type` | `text` | NO | task, notification, mention |
| `status` | `text` | YES | unread, read, archived |
| `action_link` | `text` | YES | URL to take action |
| `created_at` | `timestamptz` | YES | Timestamp |

### `kanban_cards`
Cards for the Kanban board (Tasks, Tickets, Projects).

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `column_id` | `uuid` | NO | Foreign Key -> `kanban_columns.id` |
| `title` | `text` | NO | Card title |
| `description` | `text` | YES | Card description |
| `position` | `integer` | NO | Sort order within column |
| `ice_impact` | `integer` | YES | ICE Impact Score (0-10) |
| `ice_confidence` | `integer` | YES | ICE Confidence Score (0-10) |
| `ice_effort` | `integer` | YES | ICE Effort Score (0-10) |
| `ice_score` | `numeric` | YES | Calculated ICE Score |
| `labels` | `ARRAY` | YES | Array of tags labels |
| `due_date` | `date` | YES | Due date |
| `priority` | `text` | YES | low, medium, high, urgent |
| `project_id` | `uuid` | YES | Foreign Key -> `projects.id` |
| `created_by` | `uuid` | YES | Creator |
| `assigned_to` | `uuid` | YES | Assignee |
| `trello_card_id` | `text` | YES | External Trello ID (Unique) |
| `created_at` | `timestamptz` | YES | Timestamp |
| `updated_at` | `timestamptz` | YES | Timestamp |
| `completed_at` | `timestamptz` | YES | Timestamp |

### `kanban_columns`
Columns for the Kanban board.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `name` | `text` | NO | Column Name |
| `color` | `text` | YES | UI Color |
| `icon` | `text` | YES | UI Icon |
| `position` | `integer` | NO | Sort order on board |
| `is_default` | `boolean` | YES | Is default column for new items |
| `is_done_column` | `boolean` | YES | Items here are considered 'done' |
| `wip_limit` | `integer` | YES | Work in Progress limit |
| `created_at` | `timestamptz` | YES | Timestamp |
| `updated_at` | `timestamptz` | YES | Timestamp |

### `kanban_labels`
Custom labels for Kanban cards.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `name` | `text` | NO | Label text |
| `color` | `text` | NO | Label color |
| `created_at` | `timestamptz` | YES | Timestamp |

### `notifications`
System notifications.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `user_id` | `uuid` | NO | Recipient |
| `title` | `text` | NO | Notification title |
| `content` | `text` | YES | Notification body |
| `type` | `text` | YES | info, warning, error, success |
| `is_read` | `boolean` | YES | Read status |
| `link` | `text` | YES | Action link |
| `created_at` | `timestamptz` | YES | Timestamp |

### `organizations`
Represents Clients or Departments using the system.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `name` | `text` | NO | Organization Name |
| `slug` | `text` | NO | Unique URL slug |
| `logo_url` | `text` | YES | Logo Image |
| `metadata` | `jsonb` | YES | Arbitrary metadata (contract info, etc) |
| `created_at` | `timestamptz` | YES | Timestamp |
| `status` | `text` | YES | active, inactive, churned |
| `monthly_fee` | `numeric` | YES | Revenue tracking |
| `contract_start` | `date` | YES | Contract date |
| `contract_end` | `date` | YES | Contract date |
| `industry` | `text` | YES | Industry segment |
| `updated_at` | `timestamptz` | YES | Timestamp |

### `profiles`
User profiles linked to Auth.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key (Matches auth.users.id) |
| `full_name` | `text` | YES | Display Name |
| `avatar_url` | `text` | YES | Avatar |
| `role` | `text` | YES | admin, user, viewer |
| `email` | `text` | YES | Email |
| `created_at` | `timestamptz` | YES | Timestamp |
| `updated_at` | `timestamptz` | YES | Timestamp |

### `projects`
Higher level grouping for tasks/cards.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `name` | `text` | NO | Project Name |
| `description` | `text` | YES | Description |
| `start_date` | `date` | YES | Start |
| `target_date` | `date` | YES | Target completion |
| `status` | `text` | YES | active, archived, completed |
| `created_at` | `timestamptz` | YES | Timestamp |

### `reports`
Generated reports (PDFs, Excel).

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `title` | `text` | NO | Report Title |
| `file_url` | `text` | NO | Storage URL |
| `type` | `text` | YES | pdf, xlsx, etc. |
| `generated_by` | `uuid` | YES | User ID |
| `created_at` | `timestamptz` | YES | Timestamp |

### `tasks`
(Legacy/Simple) tasks not part of Kanban? Or subtasks?
*Note: Currently overlaps with kanban_cards functionality, check usage.*

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `title` | `text` | NO | Title |
| `description` | `text` | YES | Description |
| `status` | `text` | YES | todo, done |
| `created_at` | `timestamptz` | YES | Timestamp |

### `time_entries`
Time tracking for tasks/cards.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `user_id` | `uuid` | NO | User |
| `task_id` | `uuid` | YES | Related Card/Task |
| `project_id` | `uuid` | YES | Related Project |
| `start_time` | `timestamptz` | NO | Start |
| `end_time` | `timestamptz` | YES | End (null if running) |
| `duration` | `integer` | YES | Seconds |
| `description` | `text` | YES | Note |
| `created_at` | `timestamptz` | YES | Timestamp |

### `wiki_embeddings`
Vector embeddings for Wiki pages (for RAG).

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | NO | Primary Key |
| `page_id` | `uuid` | YES | Foreign Key -> `wiki_pages.id` |
| `chunk_content` | `text` | YES | Text chunk |
| `embedding` | `USER-DEFINED` | YES | Vector data |
| `created_at` | `timestamptz` | YES | Timestamp |

### `wiki_pages`
Knowledge base / Wiki for organizations.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | Primary Key |
| `organization_id` | `uuid` | NO | Organization context |
| `parent_id` | `uuid` | YES | Hierarchy |
| `title` | `text` | NO | Title |
| `slug` | `text` | NO | URL Slug |
| `content` | `text` | NO | Markdown content |
| `category` | `text` | YES | Category/Tag |
| `icon` | `text` | YES | UI Icon |
| `is_pinned` | `boolean` | YES | Pinned status |
| `version` | `integer` | YES | Document version |
| `embedding_updated_at` | `timestamptz` | YES | Sync status |
| `created_by` | `uuid` | YES | Author |
| `created_at` | `timestamptz` | YES | Timestamp |
| `updated_at` | `timestamptz` | YES | Timestamp |
