# PLAN: Kanban Real-time Synchronization

🤖 **Applying knowledge of @frontend-specialist & @backend-specialist...**

## deliverable: docs/PLAN-kanban-realtime-sync.md

## Context
The Kanban board currently requires a manual refresh (F5) to show changes because the React state is initialized from props but not synchronized when the Server Components revalidate. The goal is to make all updates reactive.

## Socratic Gate (Draft)
- [ ] Determine if multi-user sync (Realtime) or single-user sync (Prop Sync) is the priority.
- [ ] List actions to be made reactive (Covers, Titles, Positions).

## Proposed Strategy (To be finalized)
1. **Prop-State Synchronization**: Use `useEffect` to update `useState` when props from the server change.
2. **Optimistic Updates**: Update local state BEFORE the server responds to make the UI feel instant.
3. **Supabase Realtime**: Listen to `kanban_cards` table changes for global board reactivity.

## NEXT STEPS
- [ ] User feedback on Socratic questions.
- [ ] Implementation of Tier 1 (Prop Sync).
- [ ] Implementation of Tier 2 (Realtime listeners).
