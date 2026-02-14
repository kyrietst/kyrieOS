# PLAN: Kanban Covers Refactor (Trello Style)

🤖 **Applying knowledge of @project-planner & @frontend-specialist...**

## deliverable: docs/PLAN-kanban-covers-refactor.md

## Context
Refactor the Kanban card cover system to align with Trello's "Banner" (small) and "Cover" (large) modes. This includes updating nomenclature, database schema handling, and visual rendering to ensure high-quality UI and text contrast.

## Proposed Changes

### [x] 1. Types & Schema
- [x] **Updated** `types/kanban.ts`: Added `cover_size` to `KanbanCard` and `MasterKanbanCard`.
- [x] **Updated** `actions/kanban.ts`: `updateCardCover` now handles `cover_size`.

### [x] 2. Selection UI
- [x] **Updated** `CardCoverSelector.tsx`: State handling, size toggles, and labels ("Banner" vs "Capa").

### [x] 3. Card Rendering
- [x] **Updated** `KanbanCard.tsx`: Optimized logic for `small` (Banner) and `large` (Full) modes.
- [x] **Large Mode (Cover)**: Implemented `object-fit: cover` equivalents and title rendering over the image with contrast logic.

## Verification Checklist
- [x] Small Mode: Banner at top, content below.
- [x] Large Mode: Image fills entire card, title on top.
- [x] Text Contrast: Swapping 'light'/'dark' theme updates title color.
- [x] Persistence: Changes remain after refresh.
