# PLAN: Kanban Button Cleanup

🤖 **Applying knowledge of @project-planner & @frontend-specialist...**

## deliverable: docs/PLAN-kanban-button-cleanup.md

## Context
The user reported duplicate "Cover" buttons in the `KanbanCardDetails.tsx` modal. One is a legacy mock icon picker, and the other is the new functional `CardCoverSelector`.

## Proposed Changes

### [x] Phase 1: Planning & Socratic Gate
- [x] Identify location of duplicate buttons.
- [x] Confirm styling with user.

### [x] Phase 2: Implementation
- [x] **Remove** the legacy `Popover` containing the mock color picker in `KanbanCardDetails.tsx`.
- [x] **Update** the `CardCoverSelector.tsx` trigger to use `variant="secondary"`, `ImageIcon`, and "Capa" label.

### [x] Phase 3: Verification
- [x] Visual audit: Checked that only one "Capa" button exists.
- [x] Interaction check: Verified the button correctly opens the selector.
- [x] Style check: Verified alignment with other action buttons.
