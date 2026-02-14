# Plan: Documentation Refresh & Consolidation

> **Goal:** Align project documentation with the current high-fidelity system state, specifically recording the recent Kanban "Ultimate" polish, Image Upload features, and visual standards.

## 1. Documentation Cleanup
- **Action**: Organize `docs/` directory.
- **Task**:
    - Ensure all `PLAN-*.md` files are moved to `docs/plans/` (archive).
    - existing `docs/PLAN-documentation-refresh.md` is this file.

## 2. Feature Documentation Updates

### `docs/features/MASTER_KANBAN_FEATURE.md`
- **Update Status**: Mark "Upload real de anexos" as `[x]`.
- **Add Section**: **3.5 Upload & Anexos**
    - Describe the "Anexos & Upload" tab in `CardCoverSelector`.
    - Document the Drag & Drop zone (`react-dropzone`).
    - Explain Supabase Storage integration (Bucket: `card-covers`, RLS policies, file path structure: `orgId/cardId/...`).
- **Update Section**: **6. Refinamentos Visuais**
    - Update "Densidade de Informação" to reflect the recent `KanbanCard` fix:
        - Removal of default `Card` padding (`!p-0`).
        - `min-height: 150px` for Full Covers.
        - Tight bottom spacing (`!pb-1.5`) for Trello-like aesthetic.

## 3. New Documentation: `docs/guides/UI_STYLE_GUIDE.md`
Create a centralized guide to prevent "Frankenstein" UIs.
- **Core Philosophy**: "Premium, Borderless, Native-Feel".
- **Topics**:
    - **Cards**: No physical borders (`border-0`), use `ring-1 ring-transparent hover:ring-white/60` for interaction.
    - **Glassmorphism**: Use of `bg-white/20 backdrop-blur-md` for badges/overlays.
    - **Typography**: 15px/14px sizing, `leading-tight` for density.
    - **Interaction**: Prop-based state updates (Optimistic UI) + Server Actions + `router.refresh()` pattern.
    - **Colors**: Reference new palette (no "standard red", use Tailwind functional colors).

## 4. Architecture Update
### `docs/architecture/ARCHITECTURE.md`
- **Update**: Reference the new `UI_STYLE_GUIDE.md`.
- **Tech Stack**: Confirm Next.js 16 / React 19 / Tailwind 4 presence.

## 5. Verification
- **Links**: Ensure relative links between docs are working.
- **Consistency**: Verify terms (e.g., "Master Kanban", "Ultimate Infrastructure") are used consistently.
