# Documentation Refresh Plan

## Goal
Synchronize the project documentation with the current state of Kyrie OS 2.0, specifically focusing on the recent "Ultimate Kanban" refactor, UI/UX improvements (Glassmorphism), and architectural changes.

## Analysis of Current State
- **README.md**: Good structure, points to `docs/`.
- **Kanban Docs**: `MASTER_KANBAN_FEATURE.md` exists but likely needs updates to reflect:
    - New Column Structure (12 Global Columns).
    - Header Refactor (Search, Filter, Options).
    - Card Styles (Cover modes, text themes).
- **UI Documentation**: Lacking a centralized Style Guide for the new "Apple-like" and "Glassmorphism" standards.

## Proposed Actions

### 1. Update `docs/features/MASTER_KANBAN_FEATURE.md`
- [ ] **Columns**: Document the 12 standard columns and their flow.
- [ ] **Header**: Explain the new header components (Search, Filter, View Options).
- [ ] **Cards**: document the cover capabilities, customization, and "Bolinha" checkbox.
- [ ] **Realtime**: Ensure realtime sync architecture is described.

### 2. Create `docs/guides/UI_STYLE_GUIDE.md`
- [ ] **Design Philosophy**: Glassmorphism, "Apple-like" aesthetic, Clean lines.
- [ ] **Components**:
    - Scrollbars (`.glass-scrollbar`).
    - Modals/Popovers (Backdrop blur, borders).
    - Buttons (Variants).
- [ ] **Colors & Themes**: Reference `globals.css` variables.

### 3. Update `docs/architecture/CHANGELOG.md`
- [ ] Add entry for "Kanban UI Refactor & Glassmorphism".
- [ ] Add entry for "Dynamic Columns & Header".

### 4. Organize Plans
- [ ] Move recent plan artifacts (from this session) to `docs/plans/` if applicable.

## Verification
- [ ] AI Review: Verify consistency between code and docs.
- [ ] User Review: Check if the "Frankenstein" concerns are addressed.
