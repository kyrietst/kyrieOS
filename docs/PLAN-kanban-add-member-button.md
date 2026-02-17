# PLAN-kanban-add-member-button

## Goal
Make the round "+" button in the "MEMBROS" section of `KanbanCardDetails.tsx` functional and improve its styling to match the avatar stack aesthetic.

## Context
- **Current State**: The button is a raw HTML `<button>` with no `onClick` handler (`lines 623-625`). It does nothing.
- **Desired State**: Clicking the button opens the `MemberPicker` to assign members to the card. The button style should align with the standard UI (Pro Max).

## Socratic Gate
- **Functionality**: Re-use the existing `MemberPicker` component logic.
- **State**: Since `MemberPicker` controls its own open state via internal `useState` (or `Popover`), we can simply instantiate a second `MemberPicker` here with a different `trigger`.
- **Style**: The Avatar Stack uses size `32` (h-8 w-8). The current button is `h-9 w-9`. We should adjust it to `h-8 w-8` to match the avatars perfectly.

## Proposed Changes

### 1. Refactor `KanbanCardDetails.tsx`
**Location**: Around line 623 (Members section).

- **Replace**:
  ```tsx
  <button className="h-9 w-9 rounded-full ...">
      <PlusIcon ... />
  </button>
  ```
- **With**:
  ```tsx
  <MemberPicker
      cardId={card.id}
      organizationId={card.organization_id}
      selectedMemberIds={memberIds}
      onMembersChange={setMemberIds}
      trigger={
          <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-dashed border-muted-foreground/50 hover:border-primary hover:text-primary transition-colors bg-transparent"
          >
              <PlusIcon className="w-4 h-4" />
          </Button>
      }
  />
  ```

### 2. Styling Details
- **Shape**: `rounded-full` (to match avatars).
- **Size**: `h-8 w-8` (32px) to align with `<AvatarStack size={32}>`.
- **Variant**: `border-dashed` is a standard UI pattern for "Add" buttons in lists. Alternatively, a subtle `secondary` background. I will offer the `border-dashed` "ghost" style as it looks cleaner next to avatars.

## Verification Plan
- [ ] Open Kanban Card Details.
- [ ] Locate "MEMBROS" section.
- [ ] Verify the "+" button is now 32px (`h-8 w-8`).
- [ ] Click the "+" button -> Expect `MemberPicker` popover to open.
- [ ] Select a member -> Expect avatar to appear in the stack immediately.
