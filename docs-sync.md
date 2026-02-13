# PLAN: Documentation Synchronization (App-Feel & UI Portal)

Establish a clear, up-to-date documentation foundation for the new "App-Feel" architecture, ensuring developers understand how to use the Header Actions Portal and maintain the locked-viewport layout.

## Overview
The system has recently shifted towards a native "App-Feel" (locked viewport, internal scrolling) and introduced a decoupled "Header Actions Portal". This plan synchronizes 12+ documents and creates 1 new guide to reflect these changes.

## Project Type: WEB (Documentation Refactor)

## Proposed Changes

### 1. Global Architecture
#### [MODIFY] [ARCHITECTURE.md](file:///d:/1:/LUCCAS/aplicativos/ai/KyrieOS10/kyrieOS/docs/architecture/ARCHITECTURE.md)
- Update "Frontend" section to include the **Header Actions Portal** and **App-Feel Layout** patterns.
- Add `HeaderActionsContext` to the technical stack/infrastructure list.

### 2. UI & Interaction Guides
#### [NEW] [UI_INTERACTION_GUIDE.md](file:///d:/1:/LUCCAS/aplicativos/ai/KyrieOS10/kyrieOS/docs/guides/UI_INTERACTION_GUIDE.md)
- Document the "No Window Scroll" rule.
- Usage guide for `PageContainer` (when to use it, scrollable vs non-scrollable).
- **Global Command Menu**: ⌘K shortcut documentation and extension instructions.

### 3. Feature Documentation
#### [MODIFY] [MASTER_KANBAN_FEATURE.md](file:///d:/1:/LUCCAS/aplicativos/ai/KyrieOS10/kyrieOS/docs/features/MASTER_KANBAN_FEATURE.md)
- Update UI section to reflect that board controls (Filters, Options) are now hosted in the global Header via the Actions Portal.
- Updated layout diagram (Mermaid) to show the app frame structure.

---

## Success Criteria
- [ ] `ARCHITECTURE.md` describes the Header Actions Portal.
- [ ] `PageContainer` usage is documented in a new guide.
- [ ] `MASTER_KANBAN_FEATURE.md` UI section matches current implementation.
- [ ] All `docs/PLAN-*.md` related to these changes are moved to `docs/plans/` (archive).

## Task Breakdown

### Phase 1: Planning & Discovery
- [x] Analyze codebase vs documentation delta (Explorer)
- [/] Create `docs-sync.md` (Planner)
- [ ] User Approval

### Phase 2: Implementation (Parallel)
| Task ID | Name | Agent | Skills | Priority | Dependencies |
|---------|------|-------|--------|----------|--------------|
| T1 | Update ARCHITECTURE.md | `documentation-writer` | documentation-templates | P0 | None |
| T2 | Create UI_INTERACTION_GUIDE.md | `documentation-writer` | documentation-templates | P0 | None |
| T3 | Update MASTER_KANBAN_FEATURE.md | `documentation-writer` | documentation-templates | P1 | T1 |
| T4 | Audit existing guides for conflicts | `explorer-agent` | architecture | P2 | None |

### Phase X: Verification
- [ ] Run `security_scan.py` (Orchestration mandatory)
- [ ] Verify markdown links across updated files.
- [ ] Verify Mermaid diagrams render correctly.
