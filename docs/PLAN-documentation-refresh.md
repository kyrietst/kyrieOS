# Plan: Documentation Refresh

## Goal Description
Orchestrate a comprehensive update of the project documentation to reflect recent high-impact changes, specifically the new **Kanban Label Manager** and **Label Styling**. Ensure all documentation guides developers accurately effectively prevents "Frankenstein" implementations.

## Context
- **Recent Changes:** Implemented `LabelPicker` with search/create, Glassy UI for labels, strict color mapping.
- **Current Docs:** 
    - `docs/features/` lacks a specific entry for Label Management.
    - `docs/architecture/MASTER_KANBAN_FEATURE.md` likely references outdated label handling.
    - `docs/CHANGELOG.md` needs to record these releases.

## Strategy
Use the `documentation-writer` agent to create structured, developer-focused documentation.

## Proposed Changes

### 1. New Feature Documentation
Create `docs/features/KANBAN_LABEL_MANAGER.md` containing:
- **Feature Overview:** Purpose and capabilities (Search, Create, Toggle).
- **Architecture:** Component breakdown (`LabelPicker`, `KanbanCardDetails`, Server Actions).
- **Data Model:** Explanation of `label.color` mapping (Tailwind class -> Glassy Style) vs Hex fallback.
- **Usage Guide:** How to use the component in other parts of the app.

### 2. Update Architecture Docs
Update `docs/features/MASTER_KANBAN_FEATURE.md`:
- Remove old references to "simple tag list".
- Link to the new `KANBAN_LABEL_MANAGER.md`.
- Update "UI/UX" section to mention the "Pro Max" glassy style standard.

### 3. Changelog
Update `docs/architecture/CHANGELOG.md`:
- Log "Kanban Label Manager" feature.
- Log "Kanban Label Styling" improvements.

## Execution Plan
1.  **Create:** `docs/features/KANBAN_LABEL_MANAGER.md`.
2.  **Update:** `docs/features/MASTER_KANBAN_FEATURE.md`.
3.  **Update:** `docs/architecture/CHANGELOG.md`.

## User Review Required
> [!NOTE]
> This plan focuses on the Kanban changes. If there are other features needing docs, please specify.

## Verification
- Manual review of generated markdown files for clarity and accuracy.
