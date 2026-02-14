# Plan: Kanban Card Corner Bleed Fix (V4)

Goal: Eliminate the "border artifacts" visible at the corners of the card (quinas).

## Diagnosis
The artifacts are likely caused by the standard `bg-card` color bleeding through the rounded corners due to sub-pixel rendering or anti-aliasing limits of `overflow-hidden`. Since the default card background (white or dark slate) contrasts with the full-cover gradient, the anti-aliased pixels at the curved corners appear as a faint line.

## Proposed Changes

### [Component] Kanban UI

#### [MODIFY] [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)

1. **Transparent Background for Full Cover**:
    - Conditionally apply `bg-transparent` instead of `bg-card` when `isFullCover` is true.
    - This ensures that there is no contrasting background color to "bleed" through the corners.
    - Note: We must ensure the cover itself is opaque enough (which it is, being a color or image).

#### CSS Tweak (Optimization)
2. **Backface Visibility**:
    - Sometimes adding `backface-visibility: hidden` or `transform: translateZ(0)` helps with corner clipping. I will add `will-change-transform` if `bg-transparent` alone doesn't suffice, but `bg-transparent` is the root cause fix.

## Verification Plan

### Manual Verification
- **Corners**: Inspect the corners at high zoom. They should be clean transitions to the column background, without a "halo" of the card's original background color.
