# Plan: Kanban Card Density V3 (Perfect Balance)

Goal: Achieve Trello-exact density for text cards while maintaining visual impact (100px) for full-cover cards.

## Proposed Changes

### [Component] Kanban UI

#### [MODIFY] [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)

1. **Full-Cover Height Balance**:
    - Re-introduce `min-h-[100px]` for cards where `isFullCover` is true. This ensures images and background colors have enough "presence" as requested.
2. **Typography Update**:
    - Increase title font size to `text-[14px]` (up from 12px) to match the screenshots and the user's preference for readability.
    - Set `leading-tight` (or `leading-[1.4]`) to allow multi-line titles to look natural.
3. **Dynamic Height for Normal Cards**:
    - Ensure no fixed heights or aggressive `min-h` are applied to normal (text-only) cards. 
    - Keep the `gap-1` and conditional metadata row logic from V2 so that whitespace is only present when data exists.
4. **Spacing Fine-tuning**:
    - Restore a slightly more balanced padding: `px-3 py-2` for normal cards (Trello standard) while keeping the metadata row tight.

## Verification Plan

### Manual Verification
- **Cover Cards**: Verify they have exactly `100px` minimum height.
- **Multi-line Text**: Insert a long title and verify the card expands vertically without clipping.
- **Empty State**: Verify a single-line title card is compact but readable at 14px.
