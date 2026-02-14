# PLAN: Documentation Refresh & Maintenance

🤖 **Applying knowledge of @documentation-writer, @explorer-agent & @project-planner...**

## deliverable: docs/PLAN-documentation-refresh.md

## Context
Recent rapid development has introduced advanced features (High-Fidelity Covers, Real-time Sync, UI Cleanups) that are not yet fully documented in our technical guides. We need to update existing docs and organize the file structure to guide future developers.

## Proposed Changes

### [explorer-agent] Discovery & Audit
- [x] Scan `docs/` for outdated information and messy file placement.
- [ ] Verify recent code changes (Covers, Real-time) against current `ARCHITECTURE.md`.

### [documentation-writer] Content Updates

#### [MODIFY] [MASTER_KANBAN_FEATURE.md](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/docs/features/MASTER_KANBAN_FEATURE.md)
- [x] Add **Advanced Covers** section: Explain Banner vs Large modes, Color vs Attachment images.
- [x] Add **Text Theme Contrast** section: Explain Light/Dark text theme logic.
- [x] Add **Real-time Board** section: Explain Prop-Sync and Supabase Realtime integration.

#### [MODIFY] [ARCHITECTURE.md](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/docs/architecture/ARCHITECTURE.md)
- [x] Update Technical Stack to include `@supabase/ssr` Realtime patterns.
- [x] Expand on the "Ultimate Kanban" infrastructure to include the reactive sync mechanics.

#### [NEW] [UI_STYLE_GUIDE.md](file:///d:/1. LUCCAS/aplicativos ai/KyrieOS10/kyrieOS/docs/guides/UI_STYLE_GUIDE.md)
- [x] Document the "Trello High-Fidelity" rules (e.g., hover indicators, skeleton cards in selectors, Purple Ban).

### [orchestrator] Structural Maintenance
- [x] Move all remaining `PLAN-*.md` files from `docs/` root to `docs/plans/`.
- [x] Update `CHANGELOG.md` with the cumulative changes since version 1.2.

## Verification Plan
1. **Consistency Check**: Ensure all documentation reflects the current code in `components/kanban`.
2. **Link Verification**: Ensure all internal markdown links work correctly after moving files.
3. **Accuracy**: Verify that the architectural descriptions match the React hooks and types used.
