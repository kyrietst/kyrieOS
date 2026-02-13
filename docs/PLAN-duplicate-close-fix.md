# PLAN: Fix Duplicate Close Button

🤖 **Applying knowledge of @frontend-specialist & @product-manager...**

## deliverable: docs/PLAN-duplicate-close-fix.md

## Context
The user reported duplicate "Close" (X) buttons in the `KanbanCardDetails.tsx` modal. One is the default Shadcn UI Close button (which is misaligned in this custom layout) and the other is the custom button in our header bar.

## Proposed Changes

### [x] Phase 1: Planning
- [x] Identify source of duplicate buttons.
- [x] Define CSS override strategy.

### [x] Phase 2: Implementation
- [x] **Added** `[&>button]:hidden` to `DialogContent` in `KanbanCardDetails.tsx` to hide the default absolute-positioned close button.
- [x] **Maintained** custom header close button for perfect alignment.

### [x] Phase 3: Verification
- [x] Verified only one "X" button is visible.
- [x] Ensured alignment with "Capa" and "..." icons.
- [x] Confirmed the modal still closes correctly.
