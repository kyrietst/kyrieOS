# PLAN-kanban-ux-polish

## Goal Description
Refine the Kanban board experience to achieve an "Apple-like" butter-smooth feel. Focus on fluid layout transitions, satisfying micro-interactions, and power-user keyboard shortcuts.

## User Review Required
> [!IMPORTANT]
> **Animation Performance**: High-frequency animations (like drag-and-drop springs) can be tax-intensive on lower-end devices. We will use `transform` based animations via Framer Motion to minimize layout trashing, but testing on lower-end devices is recommended.

## Proposed Changes

### 1. Animations & Reordering (Butter Smooth)
**Priority: High**

#### [MODIFY] [KanbanBoard.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/kanban/KanbanBoard.tsx)
-   **Spring Config**: Tune `framer-motion` transition config in `SortableCard`.
    -   Current: `stiffness: 600, damping: 30` (Very snappy)
    -   Proposed: `type: "spring", stiffness: 350, damping: 25, mass: 1` (Softer, more "fluid")
-   **Layout Props**: Ensure `layout` and `layoutId` (where applicable) are correctly set to preventing "jumping" during column switches.
-   **Drop Animation**: Customize `DragOverlay` drop animation to be smoother.

### 2. Micro-interactions & Feedback
**Priority: Medium**

#### [MODIFY] [KanbanCard.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)
-   **Hover State**: Add `whileHover` (Framer Motion) or Tailwind classes for:
    -   Scale: `1.02` (Subtle lift)
    -   Shadow: `shadow-lg`
    -   Border: `ring-1 ring-white/50` (Glassy edge)
-   **Checkbox Pop**: Wrap checkbox icon in `motion.div` with a `keyframe` scale animation on click.
-   **Confetti**: Existing `triggerConfetti` is good, ensure it syncs with the visual toggle.

#### [MODIFY] globals.css (or styled component)
-   **Glass Scrollbar**: Ensure `.glass-scrollbar` class exists and implements a transparent/translucent track and thumb.

### 3. Loading States
**Priority: Medium**

#### [NEW] [KanbanSkeleton.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/kanban/KanbanSkeleton.tsx)
-   Create a component that mimics the board layout with pulsing card skeletons to use while `!mounted` or fetching.

### 4. Keyboard Shortcuts (Power User)
**Priority: Low**

#### [MODIFY] [use-keyboard-shortcuts.ts](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/hooks/use-keyboard-shortcuts.ts)
-   Add handlers to interface:
    -   `onNewCard`: 'n'
    -   `onFocusSearch`: 'f'
    -   `onPin`: 'p'
-   Implement logic to detect global keys (f, n) vs item-specific keys (p).

#### [MODIFY] [KanbanBoard.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/kanban/KanbanBoard.tsx) & [KanbanCard.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)
-   Connect new shortcuts to state functions (`setIsModalOpen`, `document.getElementById('search-input').focus()`, `onPinToggle`).

## Verification Plan

### Automated Tests
-   Verify build passes: `npm run build`

### Manual Verification
1.  **Drag & Drop**:
    -   Move card within same column -> verify other cards slide out of way smoothly.
    -   Move card to different column -> verify clean insertion.
    -   Verify no jitter at end of drag.
2.  **Visuals**:
    -   Hover over card -> Check scale and shadow.
    -   Complete task -> Check "pop" animation and confetti.
    -   Scroll columns -> Check glass scrollbar.
3.  **Shortcuts**:
    -   Press 'n' -> Add Card modal opens.
    -   Press 'p' (while hovering card) -> Card pins/unpins.
    -   Press 'esc' -> Modal closes.
