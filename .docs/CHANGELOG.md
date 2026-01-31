# Changelog

All notable changes to the Kyrie OS project will be documented in this file.

## [Unreleased]

## [MVP 2.0 - Alpha 1] - 2026-01-31

### Added

- **Approval System (Feature 1):**
  - **Admin:** New `/kyrie/approvals` for creating and managing approvals.
  - **Client:** New `/client/approvals` for reviewing, approving or rejecting
    items.
  - **Storage:** Integrated Supabase Storage `approvals` bucket for file
    uploads.
  - **Database:** Added `approvals` and `approval_history` tables with RLS.
- **Backend Infrastructure:**
  - Created `start-backend.ps1` helper script for easy startup.

### Changed

- **Backend Port:** Changed Python API port from `8000` to `8002` to resolve
  conflict with Django services.
- **Environment:** Updated `.env.local` to point to port `8002`.

## [MVP 1.2] - 2026-01-30

### Added

- **Groq Integration:** Replaced Gemini as the primary AI provider for report
  generation to resolve rate limiting issues.
- **Client Portal:**
  - New `/client/reports` page for viewing generated reports.
  - New `/client/reports/[id]` page for detailed report view.
- **Admin Dashboard:**
  - "Gerar Relatório v1.2" button now functional and connected to the backend.
- **Logout Route:** Added `app/auth/signout/route.ts` to handle server-side
  session cleanup.

### Changed

- **Backend Port:** Moved FastAPI backend to port `8001` to avoid conflicts.
- **Report Generator:** Refactored `api/graphs/report_generator.py` to use
  `groq` library with `llama-3.3-70b-versatile` model.
- **GlobalTimer:** Changed `.single()` to `.maybeSingle()` to fix
  `406 Not Acceptable` error when no timer is active.

### Fixed

- **Hydration Error:** Added `suppressHydrationWarning` to `layout.tsx` to
  handle browser extension mismatches.
- **Logout Redirect:** Fixed issue where logging out redirected to a 404 page
  and didn't clear the session.
