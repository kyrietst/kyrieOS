# PLAN: Relocate Cover Button to Header

🤖 **Applying knowledge of @frontend-specialist & @product-manager...**

## Context
The user wants to declutter the horizontal action bar by moving the "Capa" (Cover) button to the header section, specifically as an icon-only button next to the "..." (More Actions) button.

## Proposed Changes

### [x] Phase 1: Planning
- [x] Create relocation plan.
- [x] Define icon-only mode.

### [x] Phase 2: Implementation
- [x] **Relocated** `<CardCoverSelector />` in `KanbanCardDetails.tsx` to the header as an icon next to the "..." button.
- [x] **Modified** `CardCoverSelector.tsx` to support a `variant="icon"` prop.

### [x] Phase 3: Verification
- [x] Verified icon appearance in header.
- [x] Verified popover functionality.
- [x] Verified removal from action bar.
