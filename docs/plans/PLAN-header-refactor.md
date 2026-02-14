# IMPLEMENTATION PLAN: Kanban Card Details Header Refactor

## Goal Description
Refactor the Kanban Card Details Modal to replicate Trello's "Control Header" UI. The goal is to maximize space for the card cover (color or image) and overlay the window controls (Close, Cover, etc.) on top of it, creating a more immersive and modern look.

## User Review Required
> [!IMPORTANT]
> **Accessibility Change:** We will be hiding the default `Dialog` close button and implementing a custom one. We must ensure this custom button remains accessible (keyboard navigatable, proper aria labels).

> [!NOTE]
> **Component Update:** `components/ui/dialog.tsx` will be modified to accept a `hideCloseButton` prop. This is a shared component, but the change is additive and backward compatible.

## Proposed Changes

### 1. Shadcn/Radix UI Dialog Component
#### [MODIFY] [dialog.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/ui/dialog.tsx)
- Update `DialogContent` interface to include `hideCloseButton?: boolean`.
- Conditionally render `DialogPrimitive.Close` based on this prop.

### 2. Kanban Card Details Component
#### [MODIFY] [KanbanCardDetails.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/kanban/KanbanCardDetails.tsx)
- **Structure Update:**
  - Remove existing `DialogHeader` usage that pushes content down.
  - Create a new `HeaderControls` container that is absolutely positioned (`absolute top-0 right-0 left-0`).
  - Pass `hideCloseButton` to `DialogContent`.
- **Cover Image Handling:**
  - Ensure the cover image container is at the very top of the flex column.
  - Add a gradient overlay (scrim) `bg-gradient-to-b from-black/50 to-transparent` to ensure control visibility on light/dark covers.
- **Controls Integration:**
  - Move the "Close" (X) button into this new `HeaderControls` container.
  - Move the `CardCoverSelector` into this container.
  - Ensure Z-Index is set correctly (`z-10` or higher) so controls are clickable over the image.

### 3. Card Cover Selector
#### [MODIFY] [CardCoverSelector.tsx](file:///d:/1.%20LUCCAS/aplicativos%20ai/KyrieOS10/kyrieOS/components/kanban/CardCoverSelector.tsx)
- Add a new `className` prop to allow external styling of the trigger button (needed for transparent/white text on dark covers).
- Optionally add a `variant="glass"` or similar if generic `className` isn't enough, but `className` + `variant="ghost"` should suffice.

## Verification Plan

### Automated Tests
- None (Visual/UI refactor).

### Manual Verification
1.  **Dialog Close Button**:
    - Open any modal *other* than the card details to ensure the default close button still appears.
    - Open the Kanban Card Details modal and verify the default close button is gone.
2.  **Header Layout**:
    - **With Cover (Image)**: Open a card with an image cover. Verify buttons (Cover, Close) are overlaid on the image, have a scrim behind them for readability, and are white/light.
    - **With Cover (Color)**: Open a card with a color cover. Verify buttons are overlaid and visible.
    - **Without Cover**: Open a card with no cover. Verify buttons appear at the top in a standard "gray" or default state, visible against the modal background.
3.  **Functionality**:
    - Click "Close" -> Modal should close.
    - Click "Capa" (Cover) -> Popover should open -> Change cover -> Updates immediately.
