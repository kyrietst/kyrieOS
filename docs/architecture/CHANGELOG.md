# Changelog

All notable changes to the Kyrie OS project will be documented in this file.

## [Unreleased]

### [1.6.0] - 2026-02-14
### Fixed
- **Master Kanban Drag-and-Drop:** Resolved card snap-back by synchronizing `master_status` with `column_id` during movements.
- **Frontend ID Mismatch:** Corrected `SortableCard` ID resolution to support both `id` and `card_id`.

## [1.5.0] - 2026-02-13
### Added
- **Ultimate Kanban Schema:** Standardized 12 global columns across all organizations.
- **Replication Trigger:** Automatic syncing of global columns to existing and new tenants.
- **Hybrid Movement Logic:** New server actions to bridge Global Statuses and Local Columns.

## [1.4.0] - 2026-02-12
### Added
- **Card-based Time Tracking:** New dedicated time tracking system tied to Kanban cards.
- **Global Control Dock:** Floating dock to manage active timers from any screen.
- **Visual Cues:** Active cards now glow red and show a "Stop" button.
- **Database:** New `kanban_time_entries` table with strict consistency rules.

### Changed
- Refactored `KanbanCard` to handle timer logic directly.
- Deprecated legacy `GlobalTimer` manual input in favor of card-context timers.
- Updated `actions/time-tracking.ts` to enforce "Single Active Timer" rule server-side.

## [v1.2.0-beta] - 2026-02-101

### Changed
- **Kanban Card UX:** Refactored cards to match Trello experience (Hidden actions on hover, Quick Complete button).
- **Kanban Engine:** Replaced custom drag-and-drop with `@dnd-kit` for superior stability and touch support.

- **Kanban Events:** Fixed issue where clicking action buttons would accidentally open the card modal (Added `stopPropagation`).
- **Drag & Drop:** Fixed drag listeners preventing interaction with card buttons.

## [MVP 2.1 - Master Kanban Refactor] - 2026-02-12

### Added
- **Global Columns:** Implemented system-wide columns ('A Fazer', 'Em Progresso', 'Concluído') that apply to all organizations.
- **Master Kanban View:** Unified administrator view for managing tasks across all clients with high performance.
- **Database Security:** Full Row Level Security (RLS) implementation for Kanban tables.
- **Visuals:** Added "Global" badges to columns and Organization identifiers to cards in the master view.

### Changed
- **Kanban Architecture:** Shifted from client-side data aggregation to server-side SQL Views and RPCs.
- **Data Migration:** Consolidated disparate 'Todo'/'Doing'/'Done' columns from various organizations into the unified Global Columns.

## [MVP 2.0 - Alpha 1] - 2026-01-31

### Added

- **Approval System (Feature 1):**
  - **Admin:** New `/kyrie/approvals` for creating and managing approvals.
  - **Client:** New `/client/approvals` for reviewing, approving or rejecting
    items.
  - **Storage:** Integrated Supabase Storage `approvals` bucket for file
    uploads.
  - **Database:** Added `approvals` and `approval_history` tables with RLS.
- **Backend Infrastructure:**
  - Created `start-backend.ps1` helper script for easy startup.

### Changed

- **Backend Port:** Changed Python API port from `8000` to `8002` to resolve
  conflict with Django services.
- **Environment:** Updated `.env.local` to point to port `8002`.

## [MVP 1.2] - 2026-01-30

### Added

- **Groq Integration:** Replaced Gemini as the primary AI provider for report
  generation to resolve rate limiting issues.
- **Client Portal:**
  - New `/client/reports` page for viewing generated reports.
  - New `/client/reports/[id]` page for detailed report view.
- **Admin Dashboard:**
  - "Gerar Relatório v1.2" button now functional and connected to the backend.
- **Logout Route:** Added `app/auth/signout/route.ts` to handle server-side
  session cleanup.

### Changed

- **Backend Port:** Moved FastAPI backend to port `8001` to avoid conflicts.
- **Report Generator:** Refactored `api/graphs/report_generator.py` to use
  `groq` library with `llama-3.3-70b-versatile` model.
- **GlobalTimer:** Changed `.single()` to `.maybeSingle()` to fix
  `406 Not Acceptable` error when no timer is active.

### Fixed

- **Hydration Error:** Added `suppressHydrationWarning` to `layout.tsx` to
  handle browser extension mismatches.
- **Logout Redirect:** Fixed issue where logging out redirected to a 404 page
  and didn't clear the session.
