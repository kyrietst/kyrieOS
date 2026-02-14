# Plan: Documentation Refresh

Goal: Clean up project structure, consolidate documentation, and create a UI Style Guide to prevent "Frankenstein" UI implementations, reflecting the recent high-fidelity Kanban work.

## 1. Project Organization (Cleanup)
- **Action**: Move all `PLAN-*.md` files from root to `docs/plans/`.
- **Why**: Reduce root clutter and archive past implementation plans.
- **Files**:
    - `PLAN-kanban-border-cleanup.md`
    - `PLAN-kanban-border-fix-v2.md`
    - `PLAN-kanban-border-fix-v3.md`
    - `PLAN-kanban-border-only.md`
    - `PLAN-kanban-corner-fix.md`
    - `PLAN-kanban-density-v2.md`
    - `PLAN-kanban-density-v3.md`
    - `PLAN-kanban-polish.md`

## 2. UI Style Guide (New)
- **Action**: Create `docs/guides/UI_STYLE_GUIDE.md`.
- **Content**:
    - **Card Design**: Document the "Borderless but Ring-Hover" pattern (transparent borders, ring-1 on white/60 hover).
    - **Full Coverage**: Document `bg-transparent` rule for images/gradients to avoid corner bleed.
    - **Typography**: 15px titles, tight leading.
    - **Density**: 100px min-height for covers.
- **Why**: Ensure future developers (and agents) build consistent UIs matching the "Apple-like" or "Trello-like" polish.

## 3. Documentation Updates
- **Root README.md**:
    - Update to clearly point to `docs/architecture/` and `docs/guides/`.
- **MASTER_KANBAN_FEATURE.md**:
    - Add a "UI/UX Refinements" section summarizing the V1-V6 polish journey (Density -> Border -> Ring).
- **ARCHITECTURE.md**:
    - Ensure it references the new Style Guide.

## 4. Verification
- **Links**: Verify all links in `README.md` work.
- **Structure**: Verify root key files are clean.
