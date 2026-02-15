# Kanban Label Manager Feature

> [!NOTE]
> This document describes the implementation of the Kanban Label Manager introduced in February 2026.

## Overview

The **Kanban Label Manager** is a comprehensive UI component that allows users to manage card labels efficiently within the Kanban board. It replaces static tag lists with an interactive system for searching, toggling, and creating labels on the fly.

### Key Capabilities
- **Search & Filter:** Real-time filtering of existing organization labels.
- **Quick Create:** Ability to create new labels directly from the search input if a match is not found.
- **Glassy UI:** Modern, translucent visual style ("Glassy Pro Max") that adapts to light/dark modes.
- **Optimistic Updates:** Instant UI feedback when toggling labels.

## Architecture

### Components

#### 1. `LabelPicker.tsx` (`components/kanban/LabelPicker.tsx`)
The core component. It encapsulates the retrieval, display, and management logic.

**Props:**
```typescript
interface LabelPickerProps {
    cardId: string
    organizationId: string
    selectedLabelIds?: string[]
    onLabelsChange?: (labelIds: string[]) => void
    trigger?: React.ReactNode // Custom trigger element (e.g., "+" button)
}
```

**State:**
- `labels`: List of all available labels for the organization.
- `searchQuery`: Current text in the search input.
- `isCreating`: Boolean flag for the creation loading state.

#### 2. `KanbanCardDetails.tsx` (`components/kanban/KanbanCardDetails.tsx`)
Consumer of `LabelPicker`.
- Imports `LabelPicker`.
- Passes `refreshData` to `onLabelsChange` to ensure the parent view stays synchronized.

### Server Actions
Located in `actions/labels.ts`:
- `getOrganizationLabels(orgId)`: Fetches all available labels.
- `createLabel(data)`: Creates a new label.
- `toggleCardLabel(cardId, labelId)`: Links/unlinks a label to a card.

## Data Model & Styling

### Color Logic
The system handles legacy data while enforcing modern styling.

**Problem:**
Database `label.color` might contain:
- Hex codes (`#FF0000`)
- Tailwind classes (`bg-red-500`)
- Valid/Invalid strings

**Solution:**
A mapping logic converts these values into consistent "Glassy" styles:

| Database Value | Rendered Style (Light/Dark) | Description |
| :--- | :--- | :--- |
| `bg-red-500` | `bg-red-500/15 text-red-700 dark:text-red-400` | Translucent background, solid text |
| `#FF0000` | `style={{ backgroundColor: '#FF000026', color: '#FF0000' }}` | Fallback for hex values |

### UI Standards ("Glassy Pro Max")
- **Shape:** `rounded-md` (Details), `rounded-sm` (Board)
- **Compactness:** `h-6` height for standard labels.
- **Typography:** `text-xs` font-medium.

## Usage Guide

### Integrating into a new view
```tsx
import { LabelPicker } from '@/components/kanban/LabelPicker'

<LabelPicker
    cardId={card.id}
    organizationId={orgId}
    selectedLabelIds={currentLabelIds}
    onLabelsChange={handleLabelUpdate}
    trigger={<MyCustomButton />} 
/>
```
