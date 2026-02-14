# Plan: Kanban Card Border Fix V3 (Ring Strategy)

Goal: Eliminate the visual "border" artifact by removing the physical CSS border entirely and using a `ring` (box-shadow) for the hover effect.

## Diagnosis
The `Card` component has a default `border` class which adds `1px` width. Even with `!border-transparent`, this 1px space exists and displays the `bg-card` color. Since the cover image is inside the card, it is inset by 1px, creating a visible "line" (the card background) around the image, especially visible if the card background differs from the black/gradient cover.

## Proposed Changes

### [Component] Kanban UI

#### [MODIFY] [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)

1. **Remove Physical Border**:
    - Change `!border-transparent` to `!border-0`. This removes the 1px width entirely.
2. **Implement Ring for Hover**:
    - Add `ring-1 ring-transparent`.
    - Add `hover:ring-white/60` to replicate the white glow.
    - `ring` uses `box-shadow`, so it won't affect layout and won't "cut" the image (it overlays or sits outside).
3. **Verify Shadow**:
    - Keep `shadow-none` (or `!shadow-none` if needed) to ensure flatness.

## Verification Plan

### Manual Verification
- **Resting State**: The cover image/color should go all the way to the edge of the rounded corners. No 1px gap.
- **Hover**: A white 1px outline should appear.
- **Layout**: No jumping (rings don't take space).
