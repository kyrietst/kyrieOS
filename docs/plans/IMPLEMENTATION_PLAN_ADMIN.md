# Week 3: Admin Dashboard Implementation Plan

## Goal

Build the "God Mode" dashboard for Gilmar (Admin), enabling full oversight of
clients, projects, and AI insights. This dashboard will be the control center
for the Kyrie OS operation.

## User Review Required

- [ ] Confirm if "Impersonation" (ver como cliente) is a priority for this week.
- [ ] Confirm the metrics to be displayed on the main dashboard.

## Proposed Changes

### 1. Admin Dashboard Core (`app/kyrie/dashboard/page.tsx`)

- [MODIFY] Replace placeholder with real grid layout.
- [NEW] Component `AdminMetricsCard.tsx`: Reusable card for high-level numbers
  (Active Clients, MRR).
- [NEW] Component `RecentActivityFeed.tsx`: List of latest system events (Sales,
  Reports Generated).

### 2. Client Management (`app/kyrie/clients/page.tsx`)

- [NEW] Page displaying a table of all organizations.
- [NEW] Component `ClientTable.tsx`: Uses Shadcn Table.
  - Columns: Name, Plan, Status, Last Report Date, Actions.
  - Actions: "View Details", "Edit", "Delete".

### 3. AI Insights Integration

- [NEW] Integration with Backend: Admin needs to see "Generation Status" of
  reports.
- [NEW] Button "Force Generate All": Trigger batch report generation via API.

## Verification Plan

### Manual Verification

1. Log in as `KYRIE_ADMIN`.
2. Verify the Dashboard loads with 4 key metric cards.
3. Navigate to `/kyrie/clients` and verify the list of mock clients (or real DB
   clients).
4. Click "Generate All" and verify console logs/toast notifications.

### Automated Tests

- Test the `ClientTable` rendering with mocked data.
