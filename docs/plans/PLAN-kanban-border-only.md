# Plan: Kanban Card Polish V5 (Strictly Border Only)

Goal: Remove the "lift" and "shadow" animations on hover. The user wants to keep **only** the white border effect.

## Proposed Changes

### [Component] Kanban UI

#### [MODIFY] [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)

1. **Remove Lift & Shadow**:
    - Remove `hover:-translate-y-1`.
    - Remove `hover:shadow-lg`.
    - Remove `transition-all duration-300` (or keep duration for the border color, but remove transform transitions).
2. **Refine Border Interaction**:
    - Ensure `hover:border-white/60` (or stronger `hover:border-white`) is the *only* visual change on hover (besides the pencil icon appearing).
    - Maintain `cursor-pointer`.

## Verification Plan

### Manual Verification
- **Static Position**: Verify card does *not* move pixel-wise when hovered.
- **Border Only**: Verify only the border color changes (glows white).
- **Pencil**: Verify pencil still appears on hover.
