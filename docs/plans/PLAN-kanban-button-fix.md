# PLAN: Kanban Column Button Alignment

Move the "Add Card" button from outside the column container to a fixed footer inside the column, following Trello's UX patterns.

## User Review Required

> [!IMPORTANT]
> The button will be moved to a fixed footer at the bottom of the column. This means it will always be visible even if the column has many cards and is scrollable.

## Proposed Changes

### Frontend Components

#### [MODIFY] [KanbanBoard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanBoard.tsx)
- Refactor `SortableColumn` component structure:
    - Use `flex flex-col` on the column container.
    - Wrap cards in a `flex-1 overflow-y-auto` container.
    - Move the "Add Card" button/component to a `flex-none` footer div at the bottom of the column container.
- Update styling to match Trello:
    - Background of the footer should match the column background.
    - Button should be `w-full` with `justify-start` and `variant="ghost"`.

## Verification Plan

### Manual Verification
- [ ] Open the Kanban board.
- [ ] Verify the "+" button is inside the grey area of the column.
- [ ] Add multiple cards to a column until it scrolls; verify the button stays fixed at the bottom.
- [ ] Test adding a card from the new button position.
- [ ] Check mobile responsiveness.
