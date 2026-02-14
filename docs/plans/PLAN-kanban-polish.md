# Plan: Kanban Card Polish (V4)

Goal: Finalize card aesthetics with larger typography (15px), tighter bottom spacing, and refined "lift" animations.

## Proposed Changes

### [Component] Kanban UI

#### [MODIFY] [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)

1. **Typography Bump**:
    - Increase title font size to `text-[15px]` (from 14px).
    - Ensure line-height accommodates the larger font (`leading-snug`).
2. **Gap Reduction**:
    - Reduce the bottom padding in `isFullCover` mode to `pb-1.5` or `pb-1`.
3. **Animation Refusal**:
    - **Remove**: Framer Motion `whileHover={{ y: -4 }}` which might be feeling too "bouncy" or disconnected.
    - **Implement**: CSS-based `hover:-translate-y-1` transition.
    - **Border**: Emphasize the white border on hover (`hover:border-white/50`), as requested.

## Verification Plan

### Manual Verification
- **Font Size**: Confirm 15px looks good and doesn't break layout.
- **Bottom Gap**: Verify the title sits closer to the bottom edge in full-cover mode.
- **Animation**: Test hover state. It should feel like it "lifts" smoothly with a white border glow.
