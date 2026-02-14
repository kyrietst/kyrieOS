# PLAN: Trello-Style Card Visual Polish

🤖 **Applying knowledge of @frontend-specialist & @mobile-design...**

## deliverable: docs/PLAN-card-visual-polish.md

## Context
Refine the `KanbanCard` component in "Capa" (large cover) mode to match Trello's specific UI cues:
1. **Title Alignment**: Move title to the bottom-left edge.
2. **Hover Indicator**: Show a circle checkbox next to the title on hover.
3. **Pencil Icon**: Refine its appearance in large cover mode.

## Proposed Changes

### [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)
- [ ] **Hover Checkbox**: Add a `Circle` icon (from Lucide) next to the title, controlled by the `isHovered` state.
- [ ] **Title Layout**: 
    - Adjust `CardContent` classes for `isFullCover`.
    - Ensure title and checkbox are horizontally aligned.
- [ ] **Edit Button**: Adjust opacity/background logic for icons on dark covers.
- [ ] **Animation**: Ensure the checkbox appears smoothly using Framer Motion or CSS transitions.

## Verification Plan
1. **Hover Test**: Move mouse over a full-cover card and verify the circle appears next to the title.
2. **Placement Test**: Ensure the title is at the bottom-left.
3. **Contrast Test**: Verify title readability on different colors/images.
