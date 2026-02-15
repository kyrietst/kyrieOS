-- Fix: Restore cover fields + add pin + assigned_to + estimated_minutes to the View and RPC
-- Date: 2026-02-14

-- 1. Drop dependent function first
DROP FUNCTION IF EXISTS get_master_kanban;

-- 2. Recreate View with ALL fields (including covers that were accidentally lost)
DROP VIEW IF EXISTS master_kanban_view;

CREATE OR REPLACE VIEW master_kanban_view AS
SELECT
    c.id AS card_id,
    c.title,
    c.description,
    c.position,
    c.column_id,
    c.organization_id,
    c.due_date,
    c.priority,
    c.ice_score,
    c.created_at,
    c.updated_at,
    c.assigned_to,
    c.is_pinned,
    c.pinned_at,
    -- Cover fields (RESTORED)
    c.cover_type,
    c.cover_value,
    c.cover_mode,
    c.cover_size,
    c.cover_text_theme,
    -- Capacity fields
    c.estimated_minutes,
    -- Organization Data
    o.name AS organization_name,
    o.slug AS organization_slug,
    o.logo_url AS organization_logo,
    -- Original Column Data
    col.name AS original_column_name,
    col.is_done_column,
    -- Computed Master Status
    CASE
        WHEN col.is_done_column THEN 'done'
        WHEN col.position = 0 THEN 'todo'
        ELSE 'doing'
    END AS master_status,
    -- Aggregated Labels
    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', l.name,
                    'color', l.color
                )
            )
            FROM kanban_card_labels cl
            JOIN kanban_labels l ON cl.label_id = l.id
            WHERE cl.card_id = c.id
        ),
        '[]'::jsonb
    ) AS labels
FROM kanban_cards c
JOIN organizations o ON c.organization_id = o.id
JOIN kanban_columns col ON c.column_id = col.id
WHERE c.is_archived = false;

-- 3. Recreate RPC with ALL fields
CREATE OR REPLACE FUNCTION get_master_kanban(
    page INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 50,
    status_filter TEXT DEFAULT NULL,
    search_text TEXT DEFAULT NULL
)
RETURNS TABLE (
    card_id UUID,
    title TEXT,
    description TEXT,
    "position" INTEGER,
    column_id UUID,
    organization_id UUID,
    due_date DATE,
    priority TEXT,
    ice_score NUMERIC,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    assigned_to UUID,
    is_pinned BOOLEAN,
    pinned_at TIMESTAMPTZ,
    cover_type TEXT,
    cover_value TEXT,
    cover_mode TEXT,
    cover_size TEXT,
    cover_text_theme TEXT,
    estimated_minutes INTEGER,
    organization_name TEXT,
    organization_slug TEXT,
    organization_logo TEXT,
    original_column_name TEXT,
    is_done_column BOOLEAN,
    master_status TEXT,
    labels JSONB,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page - 1) * page_size;

    RETURN QUERY
    WITH filtered_data AS (
        SELECT v.*
        FROM master_kanban_view v
        WHERE
            (status_filter IS NULL OR v.master_status = status_filter)
            AND
            (search_text IS NULL OR
             v.title ILIKE '%' || search_text || '%' OR
             v.organization_name ILIKE '%' || search_text || '%')
    )
    SELECT
        f.card_id,
        f.title,
        f.description,
        f.position,
        f.column_id,
        f.organization_id,
        f.due_date,
        f.priority,
        f.ice_score,
        f.created_at,
        f.updated_at,
        f.assigned_to,
        f.is_pinned,
        f.pinned_at,
        f.cover_type,
        f.cover_value,
        f.cover_mode,
        f.cover_size,
        f.cover_text_theme,
        f.estimated_minutes,
        f.organization_name,
        f.organization_slug,
        f.organization_logo,
        f.original_column_name,
        f.is_done_column,
        f.master_status,
        f.labels,
        (SELECT COUNT(*) FROM filtered_data)::BIGINT AS total_count
    FROM filtered_data f
    ORDER BY 
        f.is_pinned DESC NULLS LAST,
        f.updated_at DESC
    LIMIT page_size
    OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;
