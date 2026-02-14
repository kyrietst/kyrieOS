# Plan: Kanban Card Bottom Spacing Adjustment

> **Goal:** Reduce the gap between the card title/check icon and the bottom of the card in "Full Cover" mode, matching Trello's tighter layout style.

## 1. Analysis: `KanbanCard.tsx`

**Current State:**
The content area of the card (`CardContent`) uses the following logic when `isFullCover` is true:
```tsx
isFullCover && "min-h-[100px] justify-end pb-1"
```
And inside `CardContent`:
```tsx
className="px-2.5 py-1.5 ... flex flex-col gap-1"
```

The gap at the bottom likely comes from several factors:
1.  **Padding Bottom (`pb-1`):** Currently set to `0.25rem`.
2.  **Flex Gap (`gap-1`):** If there are no labels/members below the title, this shouldn't matter for the Title row itself, unless `justify-end` pushes things up.
3.  **Title Line Height / Padding:** The title container itself might have internal padding.

**Reference Check (Trello Style):**
Trello cards with full covers have very little padding at the bottom (sometimes `2px` to `4px`). The text sits almost flush with the bottom edge.

## 2. Proposed Changes

We will modify `components/kanban/KanbanCard.tsx`.

### CSS Adjustments:
1.  **CardContent Container:**
    - Change `pb-1` to `pb-1.5` or `pb-2`? Wait, the user wants *less* space.
    - Check if `py-1.5` (global) affects it. Yes, `py-1.5` means `0.375rem` top/bottom.
    - If `isFullCover` is true, we might want to override the default padding.

**Target Logic:**
- Remove or reduce the bottom padding specifically for full cover mode.
- Ensure the title text doesn't touch the edge (needs *some* padding), but less than current.

**Specific Change:**
```tsx
<CardContent className={cn(
    "px-2.5 py-1.5 relative z-10 w-full flex flex-col gap-1",
    isHeaderCover ? "pt-1" : "pt-2",
    // CHANGE: Reduce bottom padding for full cover
    isFullCover && "min-h-[100px] justify-end !pb-1.5" // Trello seems to have around 6-8px.
)}>
```
Actually, looking at the user request "diminuir esse espaçamento", if it's currently `pb-1` (4px) + `py-1.5` (6px) = 10px? No, utility classes override each other based on order in `cn` usually, but `py-1.5` sets `padding-top` and `padding-bottom`. `pb-1` sets `padding-bottom`. If `pb-1` is later, it overrides. 4px is quite small.

**Wait, let me re-read the code snippet I saw previously.**
```tsx
className={cn(
    "px-2.5 py-1.5 relative z-10 w-full flex flex-col gap-1",
    ...
    isFullCover && "min-h-[100px] justify-end pb-1"
)}
```
`py-1.5` = 6px.
`pb-1` = 4px.
So currently bottom padding is 4px.
If the gap looks too big, maybe the user means the space *under* the text line height.

**Alternative Strategy:**
- Text line-height might be tall (`leading-snug`).
- Flex gap might be adding space if there are "invisible" elements below? (Checked: conditional rendering handles this).
- Maybe `pb-0.5` (2px) is better? Or `pb-1` is actually overriding `py-1.5` correctly?

**Decision:**
I will try `pb-0.5` (2px) and ensure `toggleCardCompletion` button is aligned correctly.

## 3. Verification Plan

1.  **Manual Test:**
    - Apply the change.
    - View a card with a full image cover.
    - Compare with the user's "Test Card" vs "teste" reference.
    - Ensure the text isn't cut off.

## 4. Implementation Steps

- [ ] Modify `KanbanCard.tsx`: Update `CardContent` class logic for `isFullCover`.
