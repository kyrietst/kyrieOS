# PLAN: Kanban Background Personalization

Implement dynamic background personalization for Kanban boards with per-organization persistence.

## Phase 1: Infrastructure & Hook
- Create `useKanbanBackground` hook.
- Handle `localStorage` with keys `kyrie_bg_{orgId || 'master'}`.
- Define background presets:
    - **Default**: Transparent/Standard.
    - **Kyrie Gradient**: `bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10`.
    - **Solid Colors**: Blue, Grey (with dark mode variants).
- Logic to apply styles to the container.

## Phase 2: UI Components
- Create `components/kanban/KanbanPageOptions.tsx`.
- Use Shadcn `DropdownMenu`.
- Add section "Visual do Board".
- Sub-menu for background selection.

## Phase 3: Integration
- Modify `KanbanBoard.tsx` to include `KanbanPageOptions`.
- Ensure the background class is applied to the main wrapper.

## Verification
- Test persistence after page reload.
- Test different backgrounds for different organizations.
- Verify dark mode adaptation.
