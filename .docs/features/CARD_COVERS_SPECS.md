# FEATURE SPEC: Card Covers (Trello Style)

Adding customizable covers (colors/images) to Kanban cards, including a "Full Mode" for high visual impact.

## 1. Data Schema (`kanban_cards`)

We need to extend the `kanban_cards` table to support rich cover metadata.

| Field | Type | Description |
|-------|------|-------------|
| `cover_type` | `text` | `'color'`, `'image'`, or `null` |
| `cover_value` | `text` | Hex code (e.g., `#FF0000`) or Public URL/Storage Path |
| `cover_mode` | `text` | `'header'` (top bar) or `'full'` (background) |
| `cover_text_theme` | `text` | `'light'` or `'dark'` (for contrast in full mode) |

> [!NOTE]
> `cover_color` already exists in the schema but we will transition to `cover_value` for unified handling of both colors and images.

## 2. Selection Component (`CardCoverSelector`)

A new UI component to be used inside the card details modal.

- **Tabs**:
    - **Colors**: A curated grid of Trello-like colors.
    - **Attachments**: List of images already attached to the card to select as cover.
- **Modes Selector**:
    - Toggle between **Header** (fixed height top banner) and **Full** (entire card background).
- **Auto-Contrast Logic**: When selecting a color/image for "Full" mode, suggest or auto-select the best `cover_text_theme`.

## 3. Component Rendering (`KanbanCard`)

### Mode: Header
- Renders a top `div` with `h-32` (or similar).
- Content (title, badges) stays below the cover.

### Mode: Full
- The `KanbanCard` container uses the cover as its background.
- **Title**: Text color shifts to white/black based on `cover_text_theme`.
- **Visual Polish**:
    - Add a subtle dark/light overlay to the background to ensure readability.
    - Badges (labels, dates) should use a semi-transparent background to blend in.
    - Remove standard borders to emphasize the "block" look.

## 4. Migration Plan

```sql
-- Migration to add cover fields
ALTER TABLE public.kanban_cards
ADD COLUMN IF NOT EXISTS cover_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cover_value text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cover_mode text DEFAULT 'header',
ADD COLUMN IF NOT EXISTS cover_text_theme text DEFAULT 'dark';

-- Optional: Data cleanup/migration from old cover_color
-- UPDATE kanban_cards SET cover_type = 'color', cover_value = cover_color WHERE cover_color IS NOT NULL;
```
