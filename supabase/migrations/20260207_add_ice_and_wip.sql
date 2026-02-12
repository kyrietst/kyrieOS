-- Migration: Add ICE Score Components and WIP Limits
-- Created: 2026-02-07

-- 1. Adicionar campos ICE individuais
ALTER TABLE kanban_cards
ADD COLUMN IF NOT EXISTS impact INTEGER CHECK (impact >= 1 AND impact <= 10),
ADD COLUMN IF NOT EXISTS confidence INTEGER CHECK (confidence >= 1 AND confidence <= 10),
ADD COLUMN IF NOT EXISTS effort INTEGER CHECK (effort >= 1 AND effort <= 10);

-- 2. Dropar ice_score existente e recriar como GENERATED COLUMN
ALTER TABLE kanban_cards DROP COLUMN IF EXISTS ice_score;

ALTER TABLE kanban_cards
ADD COLUMN ice_score DECIMAL GENERATED ALWAYS AS (
  CASE 
    WHEN effort IS NULL OR effort = 0 THEN 0
    ELSE CAST(impact * confidence AS DECIMAL) / effort
  END
) STORED;

-- 3. Adicionar WIP limit às colunas
ALTER TABLE kanban_columns
ADD COLUMN IF NOT EXISTS wip_limit INTEGER CHECK (wip_limit > 0);

COMMENT ON COLUMN kanban_cards.impact IS 'ICE Score component: Impact (1-10)';
COMMENT ON COLUMN kanban_cards.confidence IS 'ICE Score component: Confidence (1-10)';
COMMENT ON COLUMN kanban_cards.effort IS 'ICE Score component: Effort (1-10)';
COMMENT ON COLUMN kanban_cards.ice_score IS 'Generated ICE Score: (Impact * Confidence) / Effort';
COMMENT ON COLUMN kanban_columns.wip_limit IS 'Work In Progress limit for this column (visual indicator only)';
