# PLAN-fix-calendar-overflow

## Context
- **User Request:** Fix the calendar overflow issue in the "date" button within the Kanban card details. Days are spilling out of the modal.
- **Workflow:** `@[/plan]`, `@[/orchestrate]`, `@[/ui-ux-pro-max]`
- **Mode:** PLANNING
- **Affected Files:**
  - `components/kanban/DatePicker.tsx`
  - `components/ui/calendar.tsx`

## Problem Analysis
The root cause appears to be a constraint conflict:
1.  **Fixed Width Container:** The `PopoverContent` in `DatePicker.tsx` has a hardcoded width of `w-[300px]`.
2.  **Internal Padding:** 
    - `DatePicker.tsx` adds `p-2` wrapper.
    - `calendar.tsx` adds `p-3` default padding.
    - `react-day-picker` has its own internal spacing.
3.  **Forced Grid:** Custom `!important` styles in `calendar.tsx` force a grid layout that might not be shrinking gracefully below a certain width.

The combination of padding + fixed 300px width is likely too narrow for the standard month view, causing the 7-column grid to overflow or clip.

## Proposed Changes

### 1. Relax Container Constraints (`components/kanban/DatePicker.tsx`)
- Change `PopoverContent` width from `w-[300px]` to `w-auto` to allow the calendar to define its own natural width.
- Alternatively, restrict `max-w` but ensure it's at least `320px` or `350px` to accommodate the calendar comfortably.

### 2. Refine Calendar Styles (`components/ui/calendar.tsx`)
- Review the injected `<style>` block. The `.kanban-calendar` class applies very specific grid overrides. 
- Ensure `max-width: 100%` is respected.
- Possibly reduce `gap` in the grid if necessary (`gap: 0.25rem` is currently set).

### 3. UI/UX Polish (`components/kanban/DatePicker.tsx`)
- Ensure the popover conforms to "UI UX Pro Max" standards (shadows, borders, rounding).
- Check if the "Data de início" and "Data de entrega" inputs need more breathing room if formatting is changed.

## Implementation Plan

### Phase 1: Layout Fixes
- [ ] **Modify `DatePicker.tsx`**: Change `w-[300px]` to `w-auto` in `PopoverContent`.
- [ ] **Verify**: Check if this resolves the overflow immediately. This provides the most flexibility.

### Phase 2: Component Refinement (if Phase 1 insufficient)
- [ ] **Modify `calendar.tsx`**: 
    - Check the `p-3` padding. If `DatePicker` already provides padding, maybe reduce `Calendar` padding or make it configurable.
    - Check `.kanban-calendar` styles for fixed widths or non-responsive behaviors.

## Verification Plan

### Manual Verification
1.  Open the Kanban board.
2.  Click on a Card to open details.
3.  Click the "Datas" (Date) button/popover.
4.  **Expectation**: The calendar popup appears. The days (Mon-Sun) and dates (1-31) are fully contained within the black popover box. No horizontal scrolling or clipping.
5.  **Responsiveness**: Check on mobile view (if applicable) or small screens to ensure it doesn't overflow the viewport.

### Automated Tests
- Run existing frontend tests to ensure no regression in DatePicker functionality:
  - `npm run dev:frontend` (already running, check logs)
