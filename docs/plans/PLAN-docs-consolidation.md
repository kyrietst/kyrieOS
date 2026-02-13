# PLAN: Documentation Consolidation & Update

## 🎯 Goal
Clean up fragmented documentation and update the system architecture to reflect the current state (Dynamic Header, Ultimate Kanban, Background Personalization).

## 🧩 Current Strategy (Source of Truth)

### 1. Hierarchy Cleanup
- **[MOVE]** Legacy plans and PRDs to `docs/archive/`.
- **[UNIFY]** Architecture details into `docs/architecture/ARCHITECTURE.md`.
- **[REFERENCE]** Feature-specific details should stay in `docs/features/`.

### 2. Architecture Updates
- **Dynamic Header System**:
    - Document `TitleContext`, `usePageTitle`, and `TitleSetter`.
    - Explain the "Zero Static Title" rule for pages.
- **Ultimate Kanban 1.5/1.6**:
    - Finalize documentation on the 12 global columns.
    - Document the Drag-and-Drop snap-back fix logic.
- **Immersive Personalization**:
    - Document `useKanbanBackground` and the `localStorage` key strategy.
    - Mention the "Total Area Background" layout refactor.

### 3. Developer Guidance
- Update `KANBAN_DEVELOPER_GUIDE.md` with:
    - ID consistency (`id` vs `card_id`).
    - Layout padding rules (Individual pages manage padding, not the global structure).

## 🛠️ Agents
- `project-planner`: Master plan and structure.
- `explorer-agent`: Verification of implementation details.
- `documentation-writer`: Implementation of `.md` changes.

## ✅ Verification
- Run `lint-runner.py` on workspace.
- Manual check of all internal links in `docs/`.
