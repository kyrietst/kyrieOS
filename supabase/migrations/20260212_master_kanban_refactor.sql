-- Migration: Master Kanban Refactor (Security & Performance)
-- Date: 2026-02-12
-- Description: Enables RLS, creates Master View and RPC for paginated access.

-- 1. Enable RLS on core tables
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_card_labels ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies for kanban_cards

-- Policy: Users can view their own organization's cards
DROP POLICY IF EXISTS "Users can view own organization cards" ON kanban_cards;
CREATE POLICY "Users can view own organization cards"
ON kanban_cards FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE profiles.organization_id = kanban_cards.organization_id
  )
);

-- Policy: Users can modify own organization cards
DROP POLICY IF EXISTS "Users can modify own organization cards" ON kanban_cards;
CREATE POLICY "Users can modify own organization cards"
ON kanban_cards FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE profiles.organization_id = kanban_cards.organization_id
  )
);

-- Policy: KYRIE_ADMIN can view ALL cards
DROP POLICY IF EXISTS "Kyrie Admins can view all cards" ON kanban_cards;
CREATE POLICY "Kyrie Admins can view all cards"
ON kanban_cards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);

-- Policy: KYRIE_ADMIN can modify ALL cards
DROP POLICY IF EXISTS "Kyrie Admins can modify all cards" ON kanban_cards;
CREATE POLICY "Kyrie Admins can modify all cards"
ON kanban_cards FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);

-- Policies for kanban_columns are handled in 20260212_global_columns.sql
-- We skip them here to avoid conflicts and to respect the global column logic.
/*
CREATE POLICY "Users can view own organization columns"
ON kanban_columns FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE profiles.organization_id = kanban_columns.organization_id
  )
);

CREATE POLICY "Users can modify own organization columns"
ON kanban_columns FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE profiles.organization_id = kanban_columns.organization_id
  )
);

CREATE POLICY "Kyrie Admins can view all columns"
ON kanban_columns FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);

CREATE POLICY "Kyrie Admins can modify all columns"
ON kanban_columns FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);
*/

-- Repeat for kanban_labels
CREATE POLICY "Users can view own organization labels"
ON kanban_labels FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE profiles.organization_id = kanban_labels.organization_id
  )
);

CREATE POLICY "Users can modify own organization labels"
ON kanban_labels FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE profiles.organization_id = kanban_labels.organization_id
  )
);

CREATE POLICY "Kyrie Admins can view all labels"
ON kanban_labels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);

CREATE POLICY "Kyrie Admins can modify all labels"
ON kanban_labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);

-- Repeat for kanban_card_labels (Link table - inherits security context from card usually, but direct RLS safer)
-- Since it links card and label, we can check card ownership OR label ownership. 
-- Assuming if you can see the card, you can see its labels.
CREATE POLICY "Users can view own organization card labels"
ON kanban_card_labels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM kanban_cards
    WHERE kanban_cards.id = kanban_card_labels.card_id
    AND auth.uid() IN (
      SELECT id FROM profiles
      WHERE profiles.organization_id = kanban_cards.organization_id
    )
  )
);

CREATE POLICY "Users can modify own organization card labels"
ON kanban_card_labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM kanban_cards
    WHERE kanban_cards.id = kanban_card_labels.card_id
    AND auth.uid() IN (
      SELECT id FROM profiles
      WHERE profiles.organization_id = kanban_cards.organization_id
    )
  )
);

CREATE POLICY "Kyrie Admins can view all card labels"
ON kanban_card_labels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);

CREATE POLICY "Kyrie Admins can modify all card labels"
ON kanban_card_labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);


-- 3. Create Master Kanban View
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
    -- Organization Data
    o.name AS organization_name,
    o.slug AS organization_slug,
    o.logo_url AS organization_logo,
    -- Original Column Data
    col.name AS original_column_name,
    col.is_done_column,
    -- Computed Master Status (Todo/Doing/Done)
    CASE
        WHEN col.is_done_column THEN 'done'
        WHEN col.position = 0 THEN 'todo'
        ELSE 'doing'
    END AS master_status,
    -- Aggregated Labels (JSONB array of objects {name, color})
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

-- 4. Create RPC for Paginated Access
DROP FUNCTION IF EXISTS get_master_kanban;

CREATE OR REPLACE FUNCTION get_master_kanban(
    page INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 50,
    status_filter TEXT DEFAULT NULL, -- 'todo', 'doing', 'done'
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
        f.organization_name,
        f.organization_slug,
        f.organization_logo,
        f.original_column_name,
        f.is_done_column,
        f.master_status,
        f.labels,
        (SELECT COUNT(*) FROM filtered_data)::BIGINT AS total_count
    FROM filtered_data f
    ORDER BY f.updated_at DESC
    LIMIT page_size
    OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;
