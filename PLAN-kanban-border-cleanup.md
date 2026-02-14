# Plan: Kanban Card Border Cleanup (V6)

Goal: Remove the default border that appears on cards (especially visible on dark/gradient covers), while preserving the "white border on hover" effect.

## Proposed Changes

### [Component] Kanban UI

#### [MODIFY] [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)

1. **Default Border Removal**:
    - Change `border-border/60` to `border-transparent` (or simply remove the border color class if `border` is set elsewhere to transparent by default, but explicit transparent is safer to prevent layout shifts).
    - Ensure `border` class matches the border-width needed for the hover state (usually 1px).
2. **Hover Consistency**:
    - Maintain `hover:border-white/60` so the interaction remains.

## Verification Plan

### Manual Verification
- **Default State**: Verify the card has no visible border, especially on the dark gradient background. The "cut" effect should be gone.
- **Hover State**: Verify the white border still appears when hovering.
- **Layout**: Ensure no pixel jumping occurs between states.
