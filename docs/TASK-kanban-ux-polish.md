# Task: Kanban UX Polish

## 1. Animations & Reordering (Butter Smooth)
- [x] Tune `framer-motion` spring config in `KanbanBoard.tsx` (stiffness: 350, damping: 25) <!-- id: 1 -->
- [x] Verify/Add `layout` props for smooth reordering <!-- id: 2 -->
- [x] Customize `DragOverlay` drop animation <!-- id: 3 -->

## 2. Micro-interactions & Feedback
- [x] Add `whileHover` scale & shadow effects to `KanbanCard.tsx` <!-- id: 4 -->
- [x] Implement "pop" animation for checkbox in `KanbanCard.tsx` <!-- id: 5 -->
- [x] Verify `canvas-confetti` integration (already present, ensuring sync) <!-- id: 6 -->
- [x] Ensure `.glass-scrollbar` utility exists in `globals.css` <!-- id: 7 -->

## 3. Loading States
- [x] Create `KanbanSkeleton.tsx` for smooth loading states <!-- id: 8 -->
- [ ] Integrate Skeleton into `KanbanBoard` loading state <!-- id: 9 -->

## 4. Keyboard Shortcuts (Power User)
- [x] Update `use-keyboard-shortcuts.ts` with new handlers (`n`, `f`, `p`) <!-- id: 10 -->
- [x] Implement global shortcut listeners in `KanbanBoard.tsx` <!-- id: 11 -->
- [x] Connect shortcuts to actions (New Card 'n', Pin 'p') <!-- id: 12 -->
- [x] Connect 'f' to search (implemented in `GlobalCommandMenu`)
