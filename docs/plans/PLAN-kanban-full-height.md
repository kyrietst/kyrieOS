# PLAN: Kanban Full Height Viewport

Refactor the Kanban layout to a "Trello-style" viewport where the board fills the available space between the Header and the screen bottom, and scrolling is handled independently per column.

## User Review Required

> [!IMPORTANT]
> **Global Scroll**: I will modify `app/kyrie/layout.tsx` to remove `overflow-y-auto` from the `main` container. This will affect ALL pages in the `/kyrie` path. If other pages (like Dashboard or Clients) depend on this global scroll, I will need to ensure they have their own `overflow-y-auto` wrappers.

> [!NOTE]
> **Header Height**: I will assume the Header is `h-16` (64px). I'll use `h-[calc(100vh-4rem)]` (where 4rem = 64px) for the board height.

## Proposed Changes

### Global Infrastructure

#### [MODIFY] [layout.tsx](file:///d:/1:/LUCCAS/aplicativos/ai/KyrieOS10/kyrieOS/app/kyrie/layout.tsx)
- Set main container to `h-screen overflow-hidden` (using `100dvh` for better mobile support).
- Remove global `overflow-y-auto`.

#### [NEW] [PageContainer.tsx](file:///d:/1:/LUCCAS/aplicativos/ai/KyrieOS10/kyrieOS/components/layout/PageContainer.tsx)
- A simple wrapper component for pages that need scrolling.
- Tailwind classes: `h-full overflow-y-auto p-6`.

#### [MODIFY] [Other Pages](file:///d:/1:/LUCCAS/aplicativos/ai/KyrieOS10/kyrieOS/app/kyrie/)
- Wrap Dashboard and Clients pages with `PageContainer`.

---

### Kanban Feature

#### [MODIFY] [KanbanBoard.tsx](file:///d:/1:/LUCCAS/aplicativos/ai/KyrieOS10/kyrieOS/components/kanban/KanbanBoard.tsx)
- Update main `div` to `h-full` (it now fills the `100dvh - header` automatically).
- Ensure columns have `h-full` and cards list has `overflow-y-auto`.

## Verification Plan

### Manual Verification
1. **Vertical Scroll**: Open the Kanban board and verify the main page no longer has a vertical scrollbar.
2. **Column Scroll**: Add enough cards to a column to exceed the screen height. Verify only that column scrolls vertically.
3. **Horizontal Scroll**: Add multiple columns. Verify the board scrolls horizontally correctly.
4. **Header Stability**: Verify the Header remains fixed at the top and doesn't scroll away.
5. **Other Pages**: Navigate to the Dashboard or Client list. Verify they still have scroll functionality (I might need to add `overflow-y-auto` to their root containers if they were relying on the layout's scroll).
