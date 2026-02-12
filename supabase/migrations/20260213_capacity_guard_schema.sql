-- Migration: 20260213_capacity_guard_schema.sql
-- Description: Adds capacity planning fields to kanban_cards and creates the burn-down view.

-- 1. Alter kanban_cards table
ALTER TABLE kanban_cards 
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ice_ease INTEGER DEFAULT 5;

-- 2. Create Capacity Burn-down View
-- Using security_invoker = on to respect RLS of the base tables
CREATE OR REPLACE VIEW capacity_burn_down_view 
WITH (security_invoker = on)
AS
SELECT 
    c.id AS card_id,
    c.column_id,
    c.organization_id,
    c.title,
    c.due_date,
    c.estimated_minutes,
    COALESCE(SUM(te.duration) / 60.0, 0) AS total_tracked_minutes,
    GREATEST(0, c.estimated_minutes - COALESCE(SUM(te.duration) / 60.0, 0)) AS remaining_load_minutes
FROM 
    kanban_cards c
LEFT JOIN 
    kanban_time_entries te ON c.id = te.card_id
GROUP BY 
    c.id, c.column_id, c.organization_id, c.title, c.due_date, c.estimated_minutes;

-- 3. Comments for documentation
COMMENT ON VIEW capacity_burn_down_view IS 'View for liquid capacity calculation (burn-down) joining cards and time entries.';
COMMENT ON COLUMN kanban_cards.estimated_minutes IS 'Initial gross estimate for the task in minutes.';
COMMENT ON COLUMN kanban_cards.due_date IS 'Task deadline for calendar and capacity planning.';
