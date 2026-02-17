# PLAN-debug-calendar: Fix Calendar Navigation & Cleanup

## Goal Description
Fix the UI issues in the Kanban card details calendar component where navigation arrows and month/year labels are misaligned or incorrectly styled. Additionally, remove unused calendar components (`BigCalendarWrapper`, etc.) to clean up the codebase as requested.

## User Review Required
> [!NOTE]
> We are deleting `components/calendar/` which contains `BigCalendarWrapper`. This component is not used anywhere in the project.

## Proposed Changes

### UI Fixes
#### [MODIFY] [calendar.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/ui/calendar.tsx)
- Update `nav_button_previous` class: Add `absolute left-1`
- Update `nav_button_next` class: Add `absolute right-1`
- Ensure `caption` has `relative` (already present) and `flex items-center justify-center` (already present) to center the title.
- Verify `nav` container styles don't conflict (ensure `flex items-center` allows absolute positioning of children relative to their container? No, `nav_button_previous` is usually absolute relative to `caption` parent? In shadcn/ui, the structure is `DayPicker > div (caption) > nav (nav buttons)`. If `nav_button_previous` is absolute, it needs a relative parent. Usually `caption` is the relative parent).
- Wait, in shadcn/ui the structure is typically flattened or `nav` is inside `caption`.
- `react-day-picker` v8 default structure:
  - `caption` contains the label.
  - `nav` contains the buttons.
  - If `nav` is absolute, it works. If buttons are absolute, their parent needs checking.
  - We will set `nav_button_previous` to `absolute left-1` and `nav_button_next` to `absolute right-1`.

### Code Cleanup
#### [DELETE] [BigCalendarWrapper.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/calendar/BigCalendarWrapper.tsx)
#### [DELETE] [CalendarEvent.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/calendar/CalendarEvent.tsx)
#### [DELETE] [CalendarToolbar.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/calendar/CalendarToolbar.tsx)
- Remove the entire `components/calendar` directory if these are the only files.

## Verification Plan

### Automated Tests
- Run build to ensure no missing imports: `npm run build` (or equivalent check)

### Manual Verification
1. Open Kanban board.
2. Click on a card to open details.
3. Click "Datas" (or Date) button.
4. Verify the calendar popover shows:
   - Month/Year centered at the top.
   - Left arrow on the far left.
   - Right arrow on the far right.
   - Navigation works correctly.
