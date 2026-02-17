# PLAN-kanban-datepicker

## Goal
Transform the current `DatePicker` into a "Pro Max" (Linear-style) component with a "Butter Smooth" experience, standardized styling, and smart "Quick Select" presets.

## Context
- **Current State**: Standard Shadcn `Calendar` inside a `Popover`. Functional but basic.
- **Research Results**: Magic UI has no calendar. Kibo UI is similar to what we have. A custom implementation is the best path to achieve the "Pro Max" feel.
- **Requirement**: Match the recently standardized `CardActionButton` (Outline, h-7) for the trigger.

## Socratic Gate
- **Architecture**: Keep `react-day-picker` as the core engine (via `components/ui/calendar.tsx`) but wrap it in a richer UI.
- **UX**: Prioritize speed. "Tomorrow", "Next Week" buttons are faster than clicking a specific date.
- **Visuals**: Use `CardActionButton` for consistency. Animation for the popover (slide-in).

## Task Breakdown

### Phase 1: Preparation & UI Standardization
- [ ] **Trigger Refactor**: Replace the custom trigger logic in `DatePicker.tsx` with `CardActionButton`.
    - Variant: `outline`
    - Size: `sm` (h-7)
    - State: Show full date (e.g., "Feb 14") if selected, "Data" if empty.
    - Style: Red text/border if overdue.

### Phase 2: "Pro Max" Popover Content
- [ ] **Quick Select Sidebar**:
    - [ ] "Amanhã" (Tomorrow)
    - [ ] "Final de Semana" (Next Saturday)
    - [ ] "Próxima Semana" (Next Monday)
    - [ ] "Em 1 Mês" (Next Month)
- [ ] **Layout**: Create a two-column layout in the Popover (Sidebar + Calendar).
- [ ] **Footer/Header**:
    - [ ] "Clear" button to remove the date.

### Phase 3: Visual Polish (The "Butter Smooth" Feel)
- [ ] **Animations**: Add `data-[state=open]:animate-in` and `slide-in-from-top-2` to the Popover content (already in Shadcn, ensure it's tuned).
- [ ] **Calendar Styling**:
    - Ensure `components/ui/calendar.tsx` uses `rounded-md` and proper accent colors (`primary` for selected).
    - Verify dark mode contrast.

## Agents Assigned
- **frontend-specialist**: For React component refactoring and styling.
- **test-engineer**: For verifying the interactions and date calculations.

## Verification
- [ ] Open Kanban Card.
- [ ] Click "Datas" (or date) button -> Popover opens efficiently.
- [ ] Click "Amanhã" -> Date updates to tomorrow and closes (or stays open? *Decision: Close on preset click*).
- [ ] Select a date manually -> Updates.
- [ ] Verify "Overdue" styling on the trigger when applicable.
