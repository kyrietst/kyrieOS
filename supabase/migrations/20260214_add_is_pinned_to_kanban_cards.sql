-- Migration: Add pin functionality to kanban_cards
-- Created: 2026-02-14

ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ DEFAULT NULL;

-- Optional: Create index for faster sorting if table grows large
CREATE INDEX IF NOT EXISTS idx_kanban_cards_pinned ON kanban_cards(is_pinned, position);
