# Time Tracking Feature Documentation

## Overview
The Time Tracking system in KyrieOS is a **Card-based** timer solution designed for the Kanban workflow. It allows users to track time spent on specific tasks (cards) with precision. 

The system enforces a **"Single Active Timer"** rule per user: initiating a timer on a new card automatically stops any previously running timer.

## Core Components

### 1. Database Schema (`kanban_time_entries`)
The feature relies on a dedicated table distinct from the legacy `time_entries`.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `card_id` | UUID | Foreign Key to `kanban_cards` |
| `user_id` | UUID | Foreign Key to `auth.users` |
| `start_time` | TIMESTAMPTZ | When the timer started |
| `end_time` | TIMESTAMPTZ | NULL if running, otherwise timestamp |
| `duration` | INTEGER | Calculated seconds (populated on stop) |

**Constraints:**
- `idx_one_active_timer_per_user`: Unique partial index (`where end_time is null`) ensuring only one active entry per user.

### 2. Frontend Components

#### `KanbanCard.tsx`
- **Visual Indicators:** 
  - **Inactive:** Displays a gray "Play" button on hover.
  - **Active:** Displays a **Red Square (Stop)** button and a red glow/border effect on the card.
- **Logic:** correctly identifies active state by checking `activeTimer.card_id === card.id` (handling both Master and Client view ID structures).

#### `GlobalTimer.tsx` (The Dock)
- **Role:** A read-only "Control Dock" that appears at the bottom-right when a timer is active.
- **Features:**
  - Displays elapsed time (updated locally).
  - Shows the title of the active card.
  - Allows stopping the timer from anywhere in the application.
- **Synchronization:** Uses polling (5s interval) to sync with server state to handle multi-tab usage or external changes.

#### `TimerBadge.tsx`
- **Role:** Small badge displayed on the card header showing the timer duration.
- **Visuals:** Pulsing red effect when active.

### 3. Server Actions (`actions/time-tracking.ts`)

- `startTimer(cardId)`: 
  1. Stops any currently active timer for the user.
  2. Creates a new `kanban_time_entries` record.
  3. Revalidates Kanban paths.
- `stopTimer()`:
  1. Finds the active entry.
  2. Updates `end_time` and calculates `duration`.
  3. Revalidates paths.
- `getCardTimeLogs(cardId)`: Fetches history for details view.

## User Flow

1. **Start:** User clicks "Play" on Card A.
   - Card A turns Red.
   - Global Dock appears.
2. **Switch:** User clicks "Play" on Card B.
   - Card A stops (turns Gray).
   - Card B turns Red.
   - Global Dock updates to Card B.
3. **Stop:** User clicks "Stop" on Card B OR on Global Dock.
   - Timer stops.
   - Dock disappears.

## Future Improvements
- **Realtime:** Replace polling in `GlobalTimer` with Supabase Realtime subscriptions for instant updates across devices.
- **Reporting:** Add visual charts for time distribution per column/organization in the Dashboard.
