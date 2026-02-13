# PLAN: Cover Text Theme Functionality

🤖 **Applying knowledge of @frontend-specialist & @backend-specialist...**

## deliverable: docs/PLAN-cover-text-theme.md

## Context
Enable the "Escuro" (Dark) and "Claro" (Light) buttons in the `CardCoverSelector` to toggle the card title's text color between black and white in "Capa" mode.

## Proposed Changes

### [kanban.ts](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/actions/kanban.ts)
- [ ] **Fix Revalidation**: Update `updateCardCover` to revalidate the correct paths (`/kyrie/workspace/kanban` and `/kyrie/clients/[slug]/kanban`) instead of just `/kanban`.

### [CardCoverSelector.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/CardCoverSelector.tsx)
- [ ] **Refine Previews**: Update the "Capa" preview in the selector to accurately show the text color based on the `textTheme` selection.

### [KanbanCard.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCard.tsx)
- [ ] **Verify Rendering**: Ensure the title rendering logic correctly applies `text-white` or `text-zinc-900` based on the `cover_text_theme` field.

## Verification Plan
1. **Dynamic Update**: Change the text theme in the selector and verify the card title color changes immediately on the board.
2. **Persistence**: Refresh the page and verify the color choice is saved.
3. **Contrast**: Verify that "Claro" produces white text and "Escuro" produces black (dark zinc) text.
