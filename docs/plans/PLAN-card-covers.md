# PLAN: Card Covers Implementation

🤖 **Applying knowledge of @product-manager & @database-architect...**

## deliverable: docs/PLAN-card-covers.md

## Task Breakdown

### [x] Phase 1: Context & Schema
- [x] Analyze current `kanban_cards` table.
- [x] Implement Migration: Add `cover_type`, `cover_value`, `cover_mode`, `cover_text_theme`.

### [x] Phase 2: Selection UI
- [x] Create `CardCoverSelector` component.
- [x] Integrate into `KanbanCardModal` / `Details`.

### [x] Phase 3: Card Rendering
- [x] Update `KanbanCard` for Header Mode.
- [x] Update `KanbanCard` for Full Mode (Background + Text Contrast).

### [x] Phase 4: Polish
- [x] Accessibility: Ensure contrast ratios meet WCAG.
- [x] Performance: Optimize image loading for covers.

## Verification Checklist
- [x] Database schema validation.
- [x] UI visual audit (Header vs Full).
- [x] Mobile responsiveness check.
