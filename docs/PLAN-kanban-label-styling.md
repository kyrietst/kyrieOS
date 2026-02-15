# PLAN-kanban-label-styling

## Context
- **User Request**: "Apply better styling! to make it look part of the system as a whole".
- **Current State**: Labels are functional but visually inconsistent (too large, `h-9`, potentially wrong color application).
- **Goal**: Polish label UI to match Kyrie OS design system (glassmorphism, compact, professional).

## Design Analysis (ui-ux-pro-max)

### 1. Visual Hierarchy
- **Current**: Labels compete with buttons (`h-9` is button size).
- **Target**: Labels should be secondary indicators (Tags).
- **Size**: Reduce to `h-6` or `h-7`, `text-xs`.

### 2. Shape & Radius
- **System**: Uses `rounded-radius` (approx `rounded-md`) for cards/inputs, `rounded-full` for badges.
- **Decision**: Use **`rounded-md`** (or `rounded-sm`) to distinct labels from status badges (often pills) and align with the "card" metaphor of Kanban. Trello uses slightly rounded rects.

### 3. Color System
- **Requirement**: Support dynamic colors from DB.
- **Style**:
    - **Solid**: `bg-{color} text-white` (High contrast, "pop").
    - **Subtle**: `bg-{color}/15 text-{color}` (Modern, "glassy").
- **Proposal**: **Subtle (Glassy)** for default, **Solid** on hover or active. This fits the "Glassmorphism" theme of Kyrie OS.

### 4. Typography
- **Font**: `text-xs font-medium` (Inter/System sans).
- **Case**: Sentence case or Uppercase? `Badge` uses standard case. Trello uses clear text.

## Proposed Changes

### Component: `components/kanban/KanbanCardDetails.tsx`

#### Labels Section
- Change `h-9` -> `h-6`.
- Change `px-3 text-sm` -> `px-2 text-xs`.
- Change `rounded` -> `rounded-md` (or `rounded-sm`).
- Apply `ring-1 ring-inset` for better definition in dark mode.

```tsx
<div className="flex flex-wrap gap-1.5">
  {cardLabels.map(label => (
    <Badge
      key={label.id}
      variant="outline"
      className="h-6 px-2 text-xs font-medium border-transparent bg-opacity-20 hover:bg-opacity-30 transition-colors"
      style={{
        backgroundColor: label.color + '20', // 20% opacity
        color: label.color,
        borderColor: label.color + '30'
      }}
    >
      {label.name}
    </Badge>
  ))}
  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md ...">
    <PlusIcon className="w-3 h-3" />
  </Button>
</div>
```

### Component: `components/kanban/KanbanCard.tsx` (Board View)

- Ensure consistency with details view (miniature version).
- Currently uses `h-2` strips or badges? Check implementation.
- If showing text, use `text-[10px] h-5 px-1.5`.

## Verification Plan

### Manual Verification
1.  **Visual Check**:
    - Open "Test Card".
    - Verify labels are compact, aligned, and readable.
    - Verify hover states.
2.  **Dark Mode**:
    - Switch to dark mode.
    - Ensure contrast is sufficient (glassy effect works well here).
3.  **Board View**:
    - Check mini-cards on the board.

### Success Criteria
- [ ] Labels look "native" to the system.
- [ ] No layout shifts.
- [ ] Colors are accessible.
