# PLAN: KanbanCard UI Cleanup

🤖 **Applying knowledge of @frontend-specialist & @clean-code...**

## deliverable: docs/PLAN-kanban-card-cleanup.md

## Context
The current `KanbanCard` has redundant metadata and buttons that clutter the UI, especially in "Capa" (Full Cover) mode. The user wants to remove the play button, specific badges ("ADE", "0"), and resolve duplicate check indicators.

## Proposed Changes

### [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)
- [ ] **Remove ICE Score**: Delete the block rendering `card.ice_score` (approx. line 318).
- [ ] **Remove Organization Badge**: Delete the block rendering the first 3 letters of `organization_name` (approx. line 356).
- [ ] **Remove Bottom Actions**: Delete the row containing the "Play" and "Complete" (Circle) buttons (approx. line 377-423).
- [ ] **Functional Hover Indicator**: 
    - Move `handleToggleComplete` logic to the Trello-style `Circle` indicator (approx. line 284).
    - Wrap the `Circle` in a `button` with `e.stopPropagation()` and `onClick`.
    - Ensure it shows `CheckCircle2` when completed and `Circle` on hover when not.

## Verification Plan
1. **Visual Regression**: Verify the record "0" and "ADE" badge are gone from all cards.
2. **Interaction**: Verify that clicking the circle next to the title (on hover) still toggles the card status.
3. **No Play Button**: Verify the play button is gone.
