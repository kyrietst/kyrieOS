# Plan: Kanban Member Manager

## Goal Description
Implement a full-featured Member Assignment system for Kanban cards, replicating Trello's functionality. This involves enabling **multiple members** per card (currently limited to one), creating a rich "Member Picker" UI, and updating the database schema to support this relationship.

## User Review Required
> [!WARNING]
> **Database Schema Change Required**
> The current system uses a single `assigned_to` column on the `kanban_cards` table. To support multiple members (like Trello), we must:
> 1. Create a new junction table `kanban_card_members`.
> 2. Migrate existing data from `assigned_to` to the new table.
> 3. Deprecate `assigned_to` (or keep it as a sync/primary assignee if strictly needed, but junction is preferred).
> **Decision:** We will proceed with the junction table approach for full flexibility.

## Proposed Changes

### 1. Database Schema
#### [NEW] `kanban_card_members` Table
- `card_id` (UUID, FK to `kanban_cards`)
- `user_id` (UUID, FK to `auth.users` / `profiles`)
- `created_at` (Timestamp)
- Primary Key: (`card_id`, `user_id`)

#### [MIGRATION]
- Create the table.
- Insert existing `assigned_to` relations into `kanban_card_members`.

### 2. Server Actions & Data
#### [MODIFY] `actions/kanban.ts`
- Add `addCardMember(cardId, userId)`
- Add `removeCardMember(cardId, userId)`
- Update `getCardDetails` (or equivalent) to fetch the list of members via the new relation.

### 3. UI Components
#### [NEW] `components/kanban/MemberPicker.tsx`
- **Trigger:** Accepts a custom trigger (the "+" button).
- **Popover Content:**
  - **Header:** "Membros" with search input.
  - **List:** Scrollable list of workspace members.
  - **Item State:** Show checkmark if user is already assigned.
  - **Avatar:** Show user avatar + name.
- **Optimistic Updates:** Immediate UI feedback on toggle.

#### [MODIFY] `components/kanban/KanbanCardDetails.tsx`
- Replace the static "+" button with `MemberPicker`.
- Update the `AvatarStack` to render data from the new `members` list instead of `card.assigned_to_user`.
- Ensure real-time/optimistic updates when members are added/removed.

### 4. Integration
- Fetch workspace members (needed for the picker list).
- Likely need `getWorkspaceMembers` action (check if exists, else create).

## Verification Plan

### Automated Tests
- Run migration and verify table structure.

### Manual Verification
1. **Migration Check:** Verify existing cards with assignees show up correctly in the new list.
2. **Add Member:**
   - Click "+" in Card Details.
   - Select a user (User B).
   - Verify User B's avatar appears in the card header.
   - Verify User B is checked in the picker.
3. **Remove Member:**
   - Uncheck User B in the picker.
   - Verify avatar disappears.
4. **Persistence:** Refresh page and ensure members remain assigned.
5. **Multiple Members:** Assign User A, User B, and User C. Verify `AvatarStack` handles layout correctly.
