# Plan: Kanban Card Border Fix V2 (Force Transparent)

Goal: Aggressively remove the visible border and shadow in the resting state, as the previous transparent fix did not fully eliminate the visual artifact.

## Proposed Changes

### [Component] Kanban UI

#### [MODIFY] [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)

1. **Force Border Transparency**:
    - Use `!border-transparent` to ensure it overrides any transparency or default border colors from the shadcn `Card` component.
    - If `border` width is causing issues (e.g. rendering a hairline), switch to `border-0` and use `ring-1 ring-transparent hover:ring-white/60` inside the card implementation for the hover effect. 
    - **Decision**: Let's try `border-transparent shadow-none` first, or `border-[0px]` if strictly needed. I will use `border-transparent` with `shadow-none`.
2. **Remove Static Shadow**:
    - Remove `shadow-sm`. The user wanted it "flat" and "clean". Shadows often create a border-like artifact on dark backgrounds.
    - Ensure `hover:shadow-none` (or keep distinct hover if requested, but user said "apenas a borda").
3. **Hover State**:
    - Keep `hover:border-white/60`.

## Verification Plan

### Manual Verification
- **Resting State**: Card should blend perfectly with the background (if full cover) or look flat. No hairline.
- **Hover**: White border appears.
