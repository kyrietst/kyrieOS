# Kyrie OS: Kanban Developer Guide

This guide is intended for developers working on the Kyrie OS Kanban system. It explains the internal mechanics, common pitfalls, and architectural patterns.

> **Last Updated:** 2026-02-14

---

## 1. The ID Mismatch (CRITICAL)

There are two main ways Kanban data is retrieved, which leads to different ID naming conventions for Cards:

| Context | Hook/Source | Card ID Property |
|---------|-------------|------------------|
| **Client View** | `useKanban` (Direct Table) | `id` |
| **Master View** | `useMasterKanban` (RPC View) | `card_id` |

### 🛠️ Solution
Always use the following pattern when referencing a Card ID:
```typescript
const validId = card.id || card.card_id;
```
This is already implemented in `KanbanBoard.tsx`, `KanbanCard.tsx`, and `KanbanCardMenu.tsx`.

---

## 2. Master View State Synchronization

In the Master View, the UI filters cards based on `master_status` ('todo', 'doing', 'done'). Standard drag handlers only update `column_id`.

### ⚠️ The "Snap-back" Problem
If you only update `column_id`, the card will visually jump back to its original column because the `master_status` filter still thinks it belongs elsewhere.

### ✅ Correct Implementation
When moving a card in Master View, update BOTH:
1. `column_id`: For database persistence.
2. `master_status`: For visual filtering consistency.

```typescript
setCards(prev => prev.map(c => 
  (c.id || c.card_id) === activeId 
    ? { ...c, column_id: targetColId, master_status: newStatus } 
    : c
));
```

---

## 3. Pin Card Pattern (Optimistic Updates)

The Pin system uses an **optimistic callback chain** to provide instant feedback.

### Architecture
```
KanbanBoard.handlePinToggle(cardId, isPinned)
  → Updates local `cards` state (is_pinned + pinned_at)
  → SortableColumn sorts cards (pinned first)
  → framer-motion `layout` animation handles visual reorder
```

### How It Works
1. **User clicks "Fixar no Topo"** in `KanbanCardMenu`
2. `handleTogglePin` calls `onPinToggle(validId, newPinnedState)` **BEFORE** server action
3. `KanbanBoard.handlePinToggle` updates React state instantly
4. `SortableColumn` sorts: pinned cards → top of column
5. Server action `toggleCardPin()` persists to database
6. **On failure:** `onPinToggle(validId, !newPinnedState)` reverts state

### 🛠️ Adding New Optimistic Actions
Follow this same pattern: **callback chain** from `KanbanBoard` → `SortableColumn` → `SortableCard` → `KanbanCard` → `KanbanCardMenu`.

```typescript
// 1. Define handler in KanbanBoard
const handlePinToggle = (cardId: string, isPinned: boolean) => {
  setCards(prev => prev.map(c =>
    (c.id || c.card_id) === cardId
      ? { ...c, is_pinned: isPinned, pinned_at: isPinned ? new Date().toISOString() : null }
      : c
  ))
}

// 2. Pass through SortableColumn → SortableCard → KanbanCard → KanbanCardMenu
// 3. Call it optimistically in the menu handler
```

---

## 4. Cover System

### Storage
Cover images are uploaded to the `card-covers` Supabase Storage bucket.

### Database Fields
| Field | Values | Description |
|-------|--------|-------------|
| `cover_type` | `'color'` / `'image'` | Type of cover |
| `cover_value` | hex color / URL | The actual value |
| `cover_mode` | `'header'` / `'full'` | Banner vs full-card |
| `cover_size` | `'small'` / `'large'` | Height preset |
| `cover_text_theme` | `'light'` / `'dark'` | Text contrast on full covers |

### ⚠️ View/RPC Sync
When modifying `master_kanban_view` or `get_master_kanban`, **always include** all cover fields. Omitting them caused a production regression (covers disappeared).

---

## 5. Realtime Sync

### How It Works
```
User Action → Server Action → DB Update
                                  ↓
                          Supabase Realtime
                                  ↓
                          router.refresh()
                                  ↓
                     React Prop Sync (useEffect)
                                  ↓
                        UI re-renders with new data
```

### Key Code (KanbanBoard.tsx)
```typescript
// Prop sync: keeps local state in sync with server revalidations
useEffect(() => {
  setColumns(initialColumns)
  setCards(initialCards)
}, [initialColumns, initialCards])

// Realtime listener
const channel = supabase
  .channel('kanban-realtime')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'kanban_cards',
    filter: organizationId !== 'master' ? `organization_id=eq.${orgId}` : undefined
  }, () => router.refresh())
  .subscribe()
```

---

## 6. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Cards not appearing | `is_archived = true` or missing from View | Check `master_kanban_view` SQL |
| Drag not starting | Invalid `id` prop on `SortableCard` | Use `card.id \|\| card.card_id` |
| Columns duplicated | Wrong `organizationId` parameter | Check `getKanbanColumns` call |
| Pin doesn't reorder | Local state not updating | Verify `onPinToggle` callback chain |
| Covers missing | View/RPC missing cover fields | Re-check `master_kanban_view` SQL |
| Card snaps back | `master_status` not updated | Update both `column_id` AND `master_status` |
