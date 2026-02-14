# Plan: Kanban Card Density V2 (Trello Fidelity)

The user reports that the cards are still too tall compared to Trello. We need to be more aggressive in removing whitespace and forcing compact heights.

## Proposed Changes

### [Component] Kanban UI

#### [MODIFY] [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)

1. **Remove Aggressive `min-h`**:
    - The `min-h-[110px]` for `isFullCover` is forcing the card to be too tall. Trello cards with only a title are much shorter.
    - Reduce to `min-h-[60px]` or remove entirely and let content drive height.
2. **Conditional Metadata Row**:
    - Wrap the Metadata row div in a conditional that only renders if there are labels, assignees, or an active timer. This removes the 4px gap.
3. **Typography & Line Height**:
    - Switch to a custom tight line-height `leading-[1.2]` and potentially `text-[12px]`.
4. **Padding Fine-tuning**:
    - Reduce `px-2 py-1` to `px-2 py-0.5`.
    - Reduce `pb-1.5` for `isFullCover` to `pb-1`.
5. **Checkbox Size**:
    - Maintain `h-3.5` or slightly reduce if it looks too bulky.

## Verification Plan

### Manual Verification
- **Empty Card Density**: Verify that a card with only a title is as short as possible.
- **Label Density**: Verify that labels don't add excessive height.
- **Overlay Fidelity**: Compare side-by-side with Trello's compact mode.
