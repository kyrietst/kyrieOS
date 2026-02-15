# Plan: Kanban Label Manager Feature

## Goal Description
Implement a fully functional label management system within the Kanban card details view. REPLACE the non-functional "+" button with a robust Popover that allows users to:
- Search for existing labels.
- Toggle labels on/off for the current card.
- Create new labels with color selection.
- Edit existing labels (future scope, but UI should support it).
- Match the visual style of the provided reference (Trello-like), ensuring "UI UX Pro Max" standards (glassy, modern, accessible).

## Context
- **Current State:** The "+" button in `KanbanCardDetails.tsx` is static HTML with no interactivity.
- **Existing Asset:** `components/kanban/LabelPicker.tsx` exists but needs:
    1.  **UI Overhaul:** To match the reference screenshot and system aesthetics.
    2.  **Integration:** To be properly instantiated in `KanbanCardDetails.tsx`.
    3.  **Refactoring:** To separate the "Trigger" (button) from the "Content" (popover) for flexibility.

## User Review Required
> [!IMPORTANT]
> This plan modifies the shared `LabelPicker` component. We must ensure this doesn't break other views using it (if any). We will introduce a 'customTrigger' prop to allow flexibility.

## Proposed Changes

### 1. Component Architecture (`components/kanban/LabelPicker.tsx`)
Refactor to support a "Custom Trigger" pattern and match the new UI.

- **Props Interface:**
  ```typescript
  interface LabelPickerProps {
      trigger?: React.ReactNode; // Allow custom button
      // ... existing props
  }
  ```
- **UI Structure:**
  - **Header:** "Etiquetas" with Close button.
  - **Search:** `Input` (always visible, unlike current state).
  - **List:** Scrollable list of labels.
    - **Item:** Checkbox (left) + Color Pill (full width) + Edit Icon (right, optional).
  - **Footer:** "Create new label" button if search yields no results.
- **Styling:**
  - Use `PopoverContent` with `w-72`.
  - Apply glassmorphism to the dropdown background.
  - Ensure colors match the new "Label Mapping" logic we just implemented.

### 2. Integration (`components/kanban/KanbanCardDetails.tsx`)
Replace the dummy button with `LabelPicker`.

- **Location:** Inside the "Etiquetas" section loop.
- **Trigger:**
  ```tsx
  <button className="h-6 w-6 ...">
      <PlusIcon />
  </button>
  ```
  Pass this button as the `trigger` prop to `LabelPicker`.

### 3. Data Logic
- The `LabelPicker` already handles `createLabel` and `setCardLabels`.
- Ensure it refreshes the parent view (Server Actions should handle revalidation, but we might need `router.refresh()` or state update).

## Component Breakdown

### [MODIFY] [LabelPicker.tsx](file:///D:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/components/kanban/LabelPicker.tsx)
- Add `trigger` prop.
- Redesign `PopoverContent` layout.
- Add Search functionality (currently only for "New Label Name", change to "Filter/Create").
- Implement the "Trello-style" list item design.

### [MODIFY] [Components/kanban/KanbanCardDetails.tsx](file:///D:/1. LUCCAS\aplicativos ai\KyrieOS10\kyrieOS\components\kanban\KanbanCardDetails.tsx)
- Import `LabelPicker`.
- Replace dummy button.

## Verification Plan

### Automated Tests
- None planned for UI interaction (manual verify).

### Manual Verification
1. Open Card Details.
2. Click "+" button.
3. Verify Popover opens.
4. Verify "Search" input filters the list.
5. Create a new label (Green). verifies it appears immediately.
6. Toggle a label off. Verify it disappears from card.
7. Toggle a label on. Verify it appears on card.
