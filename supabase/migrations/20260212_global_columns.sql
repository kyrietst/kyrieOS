-- Migration: Global Columns Implementation (Hybrid System)
-- Date: 2026-02-12
-- Description: Introduces Global Columns (org_id IS NULL), migrates standard columns to them, and updates RLS.

-- 1. Schema Changes (DDL)

-- Allow organization_id to be NULL (Global Columns)
ALTER TABLE kanban_columns ALTER COLUMN organization_id DROP NOT NULL;

-- Ensure only one set of global columns exists (Partial Index)
CREATE UNIQUE INDEX IF NOT EXISTS unique_global_columns_position 
ON kanban_columns (position) 
WHERE organization_id IS NULL;

-- Optional: Ensure global columns have unique names per position? or just unique names?
-- Let's stick to unique position for ordering primarily.

-- 2. Data Migration & Seeding (PL/PGSQL)

DO $$
DECLARE
    v_todo_id UUID;
    v_doing_id UUID;
    v_done_id UUID;
    v_count_todo INTEGER;
    v_count_doing INTEGER;
    v_count_done INTEGER;
BEGIN
    -- A. Seed Global Columns (Idempotent)
    
    -- Global Todo (Pos 0)
    INSERT INTO kanban_columns (name, position, is_done_column, organization_id, is_default)
    VALUES ('A Fazer', 0, false, NULL, true)
    ON CONFLICT DO NOTHING; -- Conflict on ID? We don't have ID, we rely on SELECT after.
    -- Better to check existence first or use WHERE NOT EXISTS if no unique constraint on name/pos yet (except the index we just made)
    
    SELECT id INTO v_todo_id FROM kanban_columns WHERE organization_id IS NULL AND position = 0 LIMIT 1;
    IF v_todo_id IS NULL THEN
         INSERT INTO kanban_columns (name, position, is_done_column, organization_id, is_default)
         VALUES ('A Fazer', 0, false, NULL, true)
         RETURNING id INTO v_todo_id;
    END IF;

    -- Global Doing (Pos 1)
    SELECT id INTO v_doing_id FROM kanban_columns WHERE organization_id IS NULL AND position = 1 LIMIT 1;
    IF v_doing_id IS NULL THEN
         INSERT INTO kanban_columns (name, position, is_done_column, organization_id, is_default)
         VALUES ('Em Progresso', 1, false, NULL, true)
         RETURNING id INTO v_doing_id;
    END IF;

    -- Global Done (Pos 2)
    SELECT id INTO v_done_id FROM kanban_columns WHERE organization_id IS NULL AND is_done_column = true LIMIT 1;
    IF v_done_id IS NULL THEN
         INSERT INTO kanban_columns (name, position, is_done_column, organization_id, is_default)
         VALUES ('Concluído', 2, true, NULL, true)
         RETURNING id INTO v_done_id;
    END IF;

    RAISE NOTICE 'Global Columns IDs: Todo=%, Doing=%, Done=%', v_todo_id, v_doing_id, v_done_id;

    -- B. Migrate Cards (Standardizing)
    
    -- 1. Migrate TO DO
    -- Matches: 'todo', 'a fazer', 'backlog', 'pendente'
    WITH moved_cards AS (
        UPDATE kanban_cards
        SET column_id = v_todo_id
        WHERE column_id IN (
            SELECT id FROM kanban_columns 
            WHERE organization_id IS NOT NULL 
            AND (
                name ILIKE '%todo%' OR 
                name ILIKE '%a fazer%' OR 
                name ILIKE '%backlog%' OR
                name ILIKE '%pendente%'
            )
            AND is_done_column = false
        )
        RETURNING 1
    )
    SELECT count(*) INTO v_count_todo FROM moved_cards;
    
    -- 2. Migrate DOING
    -- Matches: 'doing', 'em progresso', 'executando', 'andamento'
    WITH moved_cards AS (
        UPDATE kanban_cards
        SET column_id = v_doing_id
        WHERE column_id IN (
            SELECT id FROM kanban_columns 
            WHERE organization_id IS NOT NULL 
            AND (
                name ILIKE '%doing%' OR 
                name ILIKE '%em progresso%' OR 
                name ILIKE '%executando%' OR
                name ILIKE '%andamento%'
            )
            AND is_done_column = false
        )
        RETURNING 1
    )
    SELECT count(*) INTO v_count_doing FROM moved_cards;

    -- 3. Migrate DONE
    -- Matches: is_done_column=true OR name like 'done', 'concluido', 'finalizado'
    WITH moved_cards AS (
        UPDATE kanban_cards
        SET column_id = v_done_id
        WHERE column_id IN (
            SELECT id FROM kanban_columns 
            WHERE organization_id IS NOT NULL 
            AND (
                is_done_column = true OR 
                name ILIKE '%done%' OR 
                name ILIKE '%concluído%' OR 
                name ILIKE '%concluido%' OR
                name ILIKE '%finalizado%'
            )
        )
        RETURNING 1
    )
    SELECT count(*) INTO v_count_done FROM moved_cards;
    
    RAISE NOTICE 'Migrated cards count: Todo=%, Doing=%, Done=%', v_count_todo, v_count_doing, v_count_done;

    -- C. Cleanup (Remove Empty Standard Columns)
    
    DELETE FROM kanban_columns
    WHERE organization_id IS NOT NULL
    AND id NOT IN (SELECT DISTINCT column_id FROM kanban_cards);
    
    RAISE NOTICE 'Cleanup complete (deleted empty columns).';

END $$;

-- 3. Security Updates (RLS)

-- Update Select Policy
DROP POLICY IF EXISTS "Users can view own organization columns" ON kanban_columns;

CREATE POLICY "Users can view own and global columns"
ON kanban_columns FOR SELECT
USING (
  (organization_id IS NULL) OR 
  (auth.uid() IN (
    SELECT id FROM profiles 
    WHERE profiles.organization_id = kanban_columns.organization_id
  ))
);

-- Update Insert/Update/Delete Policies to protect Global Columns
-- Requires KYRIE_ADMIN role for global columns manipulation

-- Drop old policies first (safer to recreate)
DROP POLICY IF EXISTS "Users can modify own organization columns" ON kanban_columns;
DROP POLICY IF EXISTS "Kyrie Admins can modify all columns" ON kanban_columns;

-- Regular users: Can modify ONLY their org's columns
CREATE POLICY "Users can modify own organization columns"
ON kanban_columns FOR ALL
USING (
  organization_id IS NOT NULL AND
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE profiles.organization_id = kanban_columns.organization_id
  )
);

-- Admins: Can modify ALL columns (including Global)
CREATE POLICY "Kyrie Admins can modify all columns"
ON kanban_columns FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);

-- 4. Update Views?
-- master_kanban_view naturally picks up new global columns because it joins on id.
-- BUT, it joins `kanban_cards` -> `kanban_columns`.
-- It also joins `kanban_cards` -> `organizations`.
-- If a card is now in a Global Column (org_id NULL), `c.column_id` points to a col with `organization_id` NULL.
-- The view does `JOIN organizations o ON c.organization_id = o.id`. 
-- `c.organization_id` (card's org) is STILL SET. So the view works fine! The card knows who owns it.
-- The column is just a container.
-- So no view update needed for data integrity.

-- However, in `get_master_kanban` RPC or frontend, we might want to know if a column is global.
-- View already selects `col.name`, which works.
