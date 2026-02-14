# PLAN-header-search-center

## Goal
Center the Search Bar (`GlobalCommandMenu`) in the global application Header.

## Context
The user wants the search bar, which is currently located on the right side of the header, to be positioned in the center of the header. This mimics the layout of many modern applications (e.g., Vercel, Linear).

## Agent Assignments
- **Orchestrator**: `project-planner` (to create this plan)
- **Implementer**: `frontend-specialist` (to apply CSS changes)

## Components Involved
- `components/layout/Header.tsx`: The main header component.
- `components/layout/GlobalCommandMenu.tsx`: The search component itself.

## Proposed Changes

### 1. Refactor `Header.tsx` Layout
- Current layout uses `justify-between` with two main children: PageTitle (left) and Actions/RightSection (right).
- New layout needs to accommodate a centered element.
- **Approach**:
    - Keep `PageTitle` on the left.
    - Keep `Profile` and `PageActions` on the right.
    - Position `GlobalCommandMenu` in the center.

#### Technical Implementation
Use absolute positioning for the centered element to ensure it stays in the center regardless of the width of the left/right sections, OR use a 3-column grid. Given the dynamic width of the left title, absolute positioning is usually more robust for "true" centering.

```tsx
<header className="relative ... flex justify-between items-center">
  {/* Left: Page Title */}
  <div className="flex items-center">
    <PageTitle />
  </div>

  {/* Center: Search Bar */}
  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl justify-center pointer-events-none">
     {/* Enable pointer events on the child so it's clickable */}
     <div className="pointer-events-auto w-full max-w-lg">
        <GlobalCommandMenu />
     </div>
  </div>

  {/* Right: Actions & Profile */}
  <div className="flex items-center gap-4">
     {/* Actions */}
     {/* Profile */}
  </div>
</header>
```

### 2. Responsiveness
- The `GlobalCommandMenu` currently adapts to mobile (icon only).
- We need to ensure that on smaller screens, it doesn't overlap with the title or profile.
- **Strategy**:
    - On Desktop (`md`+): Show centered using absolute positioning.
    - On Mobile: Decide whether to keep it centered (if space permits) or move it back to the right/hide it behind an icon in the right section.
    - *Assumption*: The `GlobalCommandMenu` styles itself. We just need to position the container.

## Verification Plan
### Phase 1: Visual Verification
1.  **Desktop**: Verify the search bar is perfectly centered.
2.  **Mobile**: Verify layout doesn't break.
3.  **Interaction**: Verify clicking outside works, and clicking the search bar works (z-index check).

