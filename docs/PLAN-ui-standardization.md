# PLAN-ui-standardization

## Goal
Standardize the UI of Kanban card details modals and buttons to achieve a "Pro Max" aesthetic, consistent with the `LabelPicker` design. This involves creating a shared layout for pickers and unifying trigger button styles.

## Context
Currently, `LabelPicker.tsx` and `MemberPicker.tsx` have divergent styles:
- `LabelPicker`: Glassmorphism, custom header, styled input, 80px width, specific animations.
- `MemberPicker`: Standard popover, default input, 72px width.
- `KanbanCardDetails`: Trigger buttons have varying toggle states and styles.

## User Review Required
> [!IMPORTANT]
> This refactor will visually change `MemberPicker` and potentially `LabelPicker` to share a common base.

## Proposed Changes

### 1. New Component: `PickerLayout`
Create `components/kanban/PickerLayout.tsx` to handle the common frame:
- **Popover Content**: Fixed width (`w-80`), glass effect (`bg-popover/95 backdrop-blur-xl`), shadow.
- **Header**: Title centered, Close button on right.
- **Search**: Standardized search input section.
- **Content**: Scrollable area wrapper.
- **Footer**: Optional action area for creating new items.

### 2. Refactor `MemberPicker.tsx`
- Adopt `PickerLayout`.
- Update width to match LabelPicker (`w-80`).
- Match `LabelPicker`'s "selected" state visuals (check icon alignment).

### 3. Refactor `LabelPicker.tsx`
- Refactor to use `PickerLayout` (removing duplicated structural code).
- Maintain existing functionality (color picking, creation).

### 4. Standardize `KanbanCardDetails.tsx` Buttons
- Create a reusable `CardActionButton` component (if not already fully standardized via `ActionButton` helper).
- Ensure all triggers ("Membros", "Etiquetas", "Checklist", "Datas", "Anexo") share:
  - Height (`h-8` or `h-9`).
  - Background/Border styles.
  - Hover effects.
  - Active states.

### 5. Date Picker Improvement
- Enhance the visual container of the date picker popover to match `PickerLayout`, even if keeping the native date input for now (or implementing a simple calendar view using `date-fns` if feasible without extra heavy deps).

## Verification Plan

### Manual Verification
- [ ] Open a Kanban card.
- [ ] Click "Membros" -> Verify "Pro" look (glassy, wide, consistent header).
- [ ] Click "Etiquetas" -> Verify functionality remains and look matches Members.
- [ ] Check all action buttons -> Verify consistent height, spacing, and hover states.
- [ ] Mobile check -> Verify popovers don't overflow small screens.
