# Kyrie OS: Kanban Developer Guide

This guide is intended for developers working on the Kyrie OS Kanban system. It explains the internal mechanics, common pitfalls, and architectural patterns.

## 1. The ID Mismatch (IMPORTANT)

There are two main ways Kanban data is retrieved, which leads to different ID naming conventions for Cards:

| Context | Hook/Source | Card ID Property |
|---------|-------------|------------------|
| **Client View** | `useKanban` (Direct Table) | `id` |
| **Master View** | `useMasterKanban` (RPC View) | `card_id` |

### 🛠️ Solution
Always use the following pattern when referencing a Card ID in frontend components:
```typescript
const validId = card.id || card.card_id;
```
This is already implemented in `KanbanBoard.tsx` and `KanbanCard.tsx`.

## 2. Master View State Synchronization

In the Master View, the UI filters cards based on `master_status` ('todo', 'doing', 'done'). Standard drag handlers only update `column_id`.

### ⚠️ The "Snap-back" Problem
If you only update `column_id`, the card will visually jump back to its original column because the `master_status` filter still thinks it belongs elsewhere.

### ✅ Correct Implementation
When moving a card in Master View, you must update BOTH:
1. `column_id`: For database persistence.
2. `master_status`: For visual filtering consistency.

Example from `KanbanBoard.tsx`:
```typescript
setCards(prev => prev.map(c => 
  (c.id || c.card_id) === activeId 
    ? { ...c, column_id: targetColId, master_status: newStatus } 
    : c
));
```

## 3. Hybrid Movement Logic

Use the `moveCardToMasterStatus` server action for Master View drops.
- **Input**: `cardId`, `targetGlobalColumnId`.
- **Action**: Translates the Global Column name to the client's Local Column ID.
- **Goal**: Keep all card movements within the client's localized column structure.

## 4. Troubleshooting

- **Cards not appearing?** Check if the SQL `master_kanban_view` includes them (archived cards are excluded).
- **Drag not starting?** Verify the `SortableCard` is receiving a valid `id` prop (see Section 1).
- **Columns duplicated?** Ensure `getKanbanColumns` is being called with the correct `organizationId` (Client ID vs 'master').
