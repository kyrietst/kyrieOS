# PLAN: Card Cover Rendering Fix

🤖 **Applying knowledge of @frontend-specialist & @debugger...**

## deliverable: docs/PLAN-card-cover-rendering.md

## Context
The user added a color cover to a card, but it's not showing up. We need to verify why the rendering logic in `KanbanCard.tsx` isn't triggering or if the data isn't reaching the component.

## Hypotheses
1. **Data Desync**: The query fetching cards in the frontend isn't selecting the new `cover_size` column yet (unlikely since we use `*` but worth checking if there's a specific view).
2. **Logic Gap**: The `KanbanCard` component might be receiving `cover_type` and `cover_value` but the CSS classes or styles aren't applying correctly to the `Card` container.
3. **Property Naming**: In the Master View, the card properties might be differently named (e.g., `card.cover_type` vs `card.card_cover_type`).

## Proposed Changes

### 1. Database Updates (Master View)
- [x] **Update `master_kanban_view`**: Include `cover_type`, `cover_value`, `cover_mode`, `cover_size`, and `cover_text_theme` in the view definition.
- [x] **Update `get_master_kanban` RPC**: 
    - [x] Update return table type to include cover fields.
    - [x] Update internal query to select cover fields from the view.

### 2. Frontend Consolidation
#### [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)
- Add console logs to inspect the `card` object and see if `cover_type`, `cover_value`, and `cover_size` are present.
- Ensure `backgroundColor` is correctly applied to the `Card` component for `full` mode.
- Ensure the header div is correctly rendered for `small` mode.
- Verify that `cn` classes don't override the inline `style` background.

### [actions/kanban.ts](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/actions/kanban.ts)
- Verify `updateCardCover` is correctly returning success and the data is actually updated in the DB (already verified with migration).

## Verification Plan
1. **Log Check**: Observe browser console to see the card object.
2. **Inspector Check**: Inspect the card element in the browser to see if the inline styles are present.
3. **Manual Test**: Toggle between Banner and Capa and see if the UI updates.
