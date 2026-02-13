# PLAN: Fix Duplicate Close Button

🤖 **Applying knowledge of @frontend-specialist & @product-manager...**

## deliverable: docs/PLAN-duplicate-close-fix.md

## Context
The user reported duplicate "Close" (X) buttons in the `KanbanCardDetails.tsx` modal. One is the default Shadcn UI Close button (which is misaligned in this custom layout) and the other is the custom button in our header bar.

## Proposed Changes

### [MODIFY] [KanbanCardDetails.tsx](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/KanbanCardDetails.tsx)
- Add a CSS class `[&>button]:hidden` to the `DialogContent` component to hide the default Shadcn absolute-positioned close button.
- Keep the custom close button in the header bar as it is correctly aligned with the other header icons (Megaphone, Cover, More).

## Verification Checklist
- [ ] Open a Kanban card.
- [ ] Verify only one "X" button is visible in the top right.
- [ ] Ensure the remaining "X" button is properly aligned with the "..." and "Capa" icons.
- [ ] Confirm the button still closes the modal.
