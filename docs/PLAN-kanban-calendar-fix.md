# Plan: Fix Kanban Calendar Alignment

## Task
Fix the "nuclear" alignment issues in the Kanban card details calendar by correctly implementing `react-day-picker` v9.

## Analysis
- **Current State**: The `components/ui/calendar.tsx` file contains comment indicators of previous failed attempts ("NUCLEAR", "removemos terminantemente flex") to layout the calendar. It forces `flex` and `w-fit` styles on table elements (`head_row`, `row`), which breaks the natural alignment of date cells against headers.
- **Dependency**: The project uses `react-day-picker@9.13.2`.
- **Root Cause**: The current implementation tries to force a flex/grid layout onto a component that natively renders a `<table>`. `react-day-picker` v9 is designed to function as a table. Forcing `flex` on `tr` elements destroys column alignment.
- **Global Constraints**: `globals.css` is clean and does not interfere.

## Proposed Changes

### 1. Refactor `components/ui/calendar.tsx`
- **Objective**: Align with `react-day-picker` v9 standards.
- **Actions**:
    - Remove all `flex`, `flex-col`, `w-fit` classes from `table`, `head_row`, `row`.
    - Use standard Table CSS classes (`w-full`, `border-collapse`, `space-y-1`).
    - Update `classNames` to target the correct v9 elements if names have changed (v9 uses `root`, `months`, `month`, `caption`, `table`, `head_row`, `head_cell`, `row`, `cell`, `day`, `day_selected`, etc. - mostly compatible but need to ensure no flex overrides).
    - Ensure `showOutsideDays={true}` and `fixedWeeks={true}` are set by default to prevent layout jumping when switching months.
    - Explicitly render standard navigation icons using the `components` prop (already present but needs verification with v9).

### 2. Verify `components/kanban/DatePicker.tsx`
- **Objective**: Ensure it passes correct props and doesn't inject breaking classes.
- **Actions**: 
    - No changes expected unless props need adjustment for v9 types.
    - Verify `mode="single"` usage is correct.

## Verification Plan

### Automated
- **Build Check**: Run `npm run build` (or check for TS errors in IDE) to ensure no type errors with `react-day-picker` v9.

### Manual System Verification
1.  **Open Kanban**: Navigate to the Kanban board.
2.  **Open Card**: Click on a card to open details.
3.  **Open Date Picker**: Click the "Dates" button.
4.  **Visual Check**:
    - Verify headers (Dom, Seg, Ter...) align perfectly with the date columns.
    - Verify navigating months does not resize the popover ("jumping" effect).
    - Verify "Data de início" and "Data de entrega" inputs still sync with calculations.
