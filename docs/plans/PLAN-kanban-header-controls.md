# PLAN: Kanban Header Controls Refactor

Implement a "Header Actions Portal" mechanism to move Kanban operational controls (Search, Filters, Options) to the global Header, providing a cleaner UI.

## User Review Required

> [!IMPORTANT]
> **Mobile Responsiveness**: Moving all controls to the Header might cause horizontal overflow on mobile. I plan to use a flex-wrap or a scrollable container in the Header for these actions, but we might want to consider a collapsed menu for mobile in a future iteration.

> [!NOTE]
> **State Access**: The controls injected into the Header will still have access to the `KanbanBoard` component's scope (state/functions) because they are defined as JSX within that component.

## Proposed Changes

### Infrastructure

#### [NEW] [HeaderActionsContext.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/contexts/HeaderActionsContext.tsx)
- Create `HeaderActionsContext` to store `ReactNode`.
- Export `HeaderActionsProvider`.
- Export `useHeaderActions(actions: ReactNode)` hook that:
    - Sets actions on `useEffect` mount.
    - Clears actions (sets to null) on unmount.

#### [NEW] [CommandMenu.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/layout/CommandMenu.tsx)
- Implement `GlobalCommandMenu` using Shadcn `Command`.
- Add `Ctrl+K` / `Cmd+K` keyboard shortcut.
- Design a premium trigger button: Lupa + "Buscar..." + "⌘K".
- Handle mobile view (Icon only).

#### [MODIFY] [layout.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/app/kyrie/layout.tsx)
- Wrap the layout with `HeaderActionsProvider`.
- Consume `headerActions` from context.
- Render `headerActions` in the `<header>` tag, aligned to the right.

---

### Kanban Feature

#### [MODIFY] [KanbanBoard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanBoard.tsx)
- Extract the controls block (Filters, `<KanbanPageOptions />`).
- Replace `SearchInput` with `CommandMenu` trigger.
- Use `useHeaderActions` to inject this block.
- Adjust layout to remove the now-empty top area.

## Verification Plan

### Manual Verification
1. **Visibility**: Verify the Search Trigger, Filter Dropdown, and "..." button appear in the Header when on the Kanban page.
2. **Command Menu**:
   - Test `Ctrl+K` shortcut.
   - Test clicking the trigger button.
   - Verify mobile responsiveness (icon only).
3. **Functionality**:
   - Test filtering by status.
   - Test changing the board background via `<KanbanPageOptions />`.
4. **Lifecycle**: Navigate to another page and verify the Header actions disappear.
