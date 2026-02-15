# Changelog

All notable changes to the Kyrie OS project will be documented in this file.

## [Unreleased]

### [1.9.0] - 2026-02-14
### Added
- **Kanban Label Manager:** Complete replacement of static tags with interactive LabelPicker.
  - **Features:** Real-time search, quick creation, glassy UI.
  - **Component:** `LabelPicker.tsx` refactored for "Pro Max" standards.
- **Label Styling:** Implemented "Glassy Pro Max" visual style for labels (translucent backgrounds, mapped colors).
- **Documentation:** Added `KANBAN_LABEL_MANAGER.md` and updated `MASTER_KANBAN_FEATURE.md`.

### [1.8.0] - 2026-02-14
### Added
- **Pin Card Feature:** Users can pin cards to the top of their column for visual priority.
  - Database: `is_pinned` (BOOLEAN) and `pinned_at` (TIMESTAMPTZ) columns on `kanban_cards`.
  - Backend: `toggleCardPin` server action + updated `master_kanban_view` and `get_master_kanban` RPC.
  - Frontend: Pin indicator icon, context menu action, optimistic updates with framer-motion animation.
- **Card Covers in Master View:** Cover fields (`cover_type`, `cover_value`, `cover_mode`, `cover_size`, `cover_text_theme`) now included in `master_kanban_view` and RPC.
- **Card Covers Storage Bucket:** Created `card-covers` Supabase Storage bucket.

### Fixed
- **Missing Covers in Master View:** Restored all cover fields in `master_kanban_view` after accidental omission during pin migration.
- **Pin Requiring Page Refresh:** Implemented optimistic local state updates + callback chain for instant reorder without F5.
- **Master View Card ID:** Fixed `handleTogglePin` to use `card.id || card.card_id` for Master View compatibility.

### Changed
- **Documentation Refresh:** Updated `db-schema.md`, `MASTER_KANBAN.md`, `KANBAN_DEVELOPER_GUIDE.md`, `MASTER_KANBAN_FEATURE.md`, `DATABASE_MIGRATIONS.md`, and `CHANGELOG.md` to reflect current state.

### [1.7.0] - 2026-02-13
### Added
- **UI Style Guide**: Created `docs/guides/UI_STYLE_GUIDE.md` defining the new "Borderless" Kanban aesthetic.
- **Documentation Refresh**: Organized implementation plans into `docs/plans/`.

### Changed
- **Kanban Visuals (High Fidelity)**:
    - **Borderless**: Removed physical borders (`border-0`) to eliminate artifacts.
    - **Ring Strategy**: Replaced border-hover with `ring-1` for smoother interaction.
    - **Corner Protection**: Fixed background bleed on rounded corners using `bg-transparent`.
    - **Density**: Standardized cover height to 150px and tighter typography.


### [1.7.1] - 2026-02-14
### Added
- **Glassmorphic Scrollbars:** Global utility `.glass-scrollbar` aiming for an "Apple-like" feel.
- **Documentation Refresh:**
    - Updated `MASTER_KANBAN_FEATURE.md` to v2.0 reflecting the 12-column infrastructure.
    - Created `UI_STYLE_GUIDE.md` to standardize the "Borderless" aesthetic.

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
- **Card-based Time Tracking:** New dedicated time tracking system tied- Master Kanban: Nova infraestrutura Ultimate com 12 colunas globais.
- Card Details: Novo modal de alta fidelidade (Trello-style).

## [1.2.5] - 2026-02-12
### Adicionado
- High-Fidelity Kanban Covers: Seleção de cores e imagens de banners.
- UI Cleanup: Remoção de botões redundantes e limpeza estética.

## [1.3.0] - 2026-02-13
### Adicionado
- **Real-time Sync**: Sincronização automática via Supabase Realtime e Root Revalidation.
- **Advanced Covers (Large mode)**: Título alinhado ao fundo com hover indicators.
- **Text Theme Toggle**: Suporte para texto claro/escuro em capas.
- **Documentação Pro Max**: Atualização de guias técnicos e criação do UI Style Guide.
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
