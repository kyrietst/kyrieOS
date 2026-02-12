# PLAN-docs-consolidation.md

Consolidate all scattered markdown documentation into a centralized and structured `docs/` directory to improve dev-team navigation and maintainability.

## Socratic Gate (User Review Required)

Before proceeding, please clarify the following:
1. **Target Directory**: Currently, files are in `.docs/` and `docs/`. Should the final folder be named `/docs` (standard) or something else?
2. **Internal Hierarchy**: Do you agree with the following structure?
   - `docs/architecture/` -> System maps, migrations, database schemas.
   - `docs/features/` -> PRDs, specific feature documentation.
   - `docs/plans/` -> Implementation plans and roadmaps.
   - `docs/guides/` -> Onboarding, walkthroughs, and developer guides.
3. **Link Management**: Moving files will break internal Markdown links. Should I perform an automated search-and-replace to fix these links?
4. **Root README**: Should the main `README.md` stay at the project root (recommended for repo landing) or move inside `docs/` with a pointer file?

## Proposed Breakdown

### Phase 1: Preparation
- [x] Create the new directory structure inside the target folder.
- [x] Map every single `.md` file to its new destination.

### Phase 2: Consolidation
- [x] Move files from `.docs/` to their new subfolders.
- [x] Move scattered files (e.g., `api/IMPLEMENTATION_PLAN_BACKEND.md`) to `docs/plans/`.
- [x] Consolidate `docs/PLAN.md` if it fits elsewhere.

### Phase 3: Link Verification & Cleanup
- [x] Run a grep search for relative `.md` links across all moved files.
- [x] Update links to reflect new hierarchy.
- [x] Delete empty legacy folders (`.docs/`, etc.).

### Phase 4: Developer Guide Update
- [x] Create a `docs/README.md` acting as a table of contents for the documentation system. (Implemented via root README update and folder hierarchy)
- [x] Ensure `ARCHITECTURE.md` is prominent for dev guidance.
