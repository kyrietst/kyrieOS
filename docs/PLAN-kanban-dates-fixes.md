# Plan: Kanban Dates & Fixes

## Context
The user has reported two main issues/requests:
1.  **Member Picker**: Admin users (like "Kyrie Adm") are not appearing in the member picker list for cards.
2.  **Date Picker**: Request for a Trello-like date picker allowing selection of both **Start Date** and **Due Date**, along with **Reminders**.
3.  **UI Enhancements**: Request to use "Avatar Stack" (Magic UI/Kibo UI style) for displaying members.

## Goal
Fix member visibility logic, upgrade the Date Picker to support date ranges and reminders, and implement a premium "Avatar Stack" component.

## Architecture

### 1. Member Picker Logic
*   **Current State**: `getWorkspaceMembers` fetches profiles where `organization_id` matches the card's organization.
*   **Problem**: Admins or Master users likely have a different `organization_id` (or `null`) and are filtered out.
*   **Solution**: Update `getWorkspaceMembers` to include users who have access to the organization (e.g., via a junction table `organization_members` if it exists, or by including the `master` organization members if the user is a super-admin).
    *   *Note*: Need to verify if `organization_members` table exists. If not, we might need to rely on `profiles.organization_id` logic adjustments (e.g., fetch target org + master org).

### 2. Date Picker (Trello-like)
*   **Schema Changes**:
    *   `kanban_cards` table needs new columns:
        *   `start_date` (timestamptz, nullable)
        *   `reminder_at` (timestamptz, nullable)
        *   `is_due_date_completed` (boolean, default false) - *Check if already exists, currently leveraging `completed_at` or similar?*
*   **UI Component**: `KanbanDatePicker`
    *   **Features**:
        *   Start Date toggle & picker.
        *   Due Date picker & time.
        *   Reminder dropdown (None, At time of due date, 1 day before, etc.).
        *   "Save" and "Remove" actions.
    *   **Style**: Glassmorphism (`PickerLayout` compatible).

### 3. Avatar Stack
*   **Component**: `AvatarCircles` (inspired by Magic UI).
*   **Usage**: Display assigned members in `KanbanCardDetails` and potentially on the Kanban Card face (`KanbanCard.tsx`).

## Task Breakdown

### Phase 1: Database & Schema
- [ ] **Migration**: Add `start_date` and `reminder_at` columns to `kanban_cards`.
- [ ] **Verify**: Check `kanban_cards` structure.

### Phase 2: Member Picker Fix
- [ ] **Investigate**: Confirm how admins are linked to organizations.
- [ ] **Update Action**: Modify `getWorkspaceMembers` in `actions/kanban.ts` to include Master/Admin users.
- [ ] **Verify**: Admin user appears in the picker.

### Phase 3: Avatar Stack (UI)
- [ ] **Create Component**: `components/magicui/avatar-circles.tsx` (or similar).
- [ ] **Integrate**: Replace existing avatar list in `KanbanCardDetails.tsx` with `AvatarCircles`.
- [ ] **Style**: Ensure "Pro Max" aesthetic (transparency, refined borders).

### Phase 4: Date Picker Implementation
- [ ] **Create Component**: `components/kanban/DatePicker.tsx` (using `PickerLayout`).
- [ ] **Logic**: Handle Start/Due/Reminder state.
- [ ] **Server Actions**: Update `updateCardDates` (new action) or modify `updateCardDetails`.
- [ ] **Integrate**: Use `DatePicker` in `KanbanCardDetails`.

### Phase 5: Verification
- [ ] **Test**: Assign Member (Admin).
- [ ] **Test**: Set Start & Due Date.
- [ ] **Test**: Visual check of Avatar Stack.

## Agent Assignments
- **Backend**: Schema updates, `actions/kanban.ts` fixes.
- **Frontend**: Component creation (`AvatarCircles`, `DatePicker`), integration.

## Verification Checklist
- [ ] Admin user "Kyrie Adm" is visible in Member Picker.
- [ ] Can save Start Date and Due Date.
- [ ] Avatar Stack displays correctly with +N overflow.
