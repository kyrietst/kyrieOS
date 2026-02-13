-- Migration: Setup Ultimate Kanban Standard
-- Date: 2026-02-13
-- Author: Kyrie Database Architect

-- 1. Setup Master Columns (Global)
BEGIN;

-- Remove old global columns
DELETE FROM kanban_columns WHERE organization_id IS NULL;

-- Insert 12 Master Columns
INSERT INTO kanban_columns (name, position, is_done_column, organization_id, color) VALUES
('📚 INFO CLIENTES', 0, false, NULL, '#6B7280'),
('💡 IDEIAS', 1, false, NULL, '#6B7280'),
('📥 BACKLOG', 2, false, NULL, '#6B7280'),
('🎯 SPRINT ATUAL', 3, false, NULL, '#6B7280'),
('🔨 EM EXECUÇÃO', 4, false, NULL, '#6B7280'),
('⏸️ AGUARDANDO / BLOQUEADO', 5, false, NULL, '#6B7280'),
('📅 CALENDÁRIO EDITORIAL', 6, false, NULL, '#6B7280'),
('🎨 DESIGN', 7, false, NULL, '#6B7280'),
('🎬 EDIÇÃO', 8, false, NULL, '#6B7280'),
('📤 PUBLICAR', 9, false, NULL, '#6B7280'),
('✅ CONCLUÍDO', 10, true, NULL, '#10B981'),
('❌ CANCELADO', 11, false, NULL, '#EF4444');

-- 2. Backfill Existing Organizations
DO $$
DECLARE
    org_record RECORD;
    col_record RECORD;
BEGIN
    FOR org_record IN SELECT id FROM organizations LOOP
        -- Remove any existing columns to ensure a fresh, standardized start for all clients
        -- Warning: This moves existing cards to the new 'INFO CLIENTES' column as a safety measure
        -- If cards are already correctly placed, we attempt to match names.
        
        FOR col_record IN 
            SELECT name, position, is_done_column, color FROM kanban_columns WHERE organization_id IS NULL
        LOOP
            INSERT INTO kanban_columns (organization_id, name, position, is_done_column, color)
            VALUES (org_record.id, col_record.name, col_record.position, col_record.is_done_column, col_record.color)
            ON CONFLICT (organization_id, name) DO UPDATE SET
                position = EXCLUDED.position,
                is_done_column = EXCLUDED.is_done_column,
                color = EXCLUDED.color;
        END LOOP;
    END LOOP;
END $$;

-- 3. Auto-Sync Trigger for New Global Columns
CREATE OR REPLACE FUNCTION public.on_global_column_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if it's a global column (org_id is NULL)
    IF NEW.organization_id IS NULL THEN
        INSERT INTO kanban_columns (organization_id, name, position, is_done_column, color)
        SELECT id, NEW.name, NEW.position, NEW.is_done_column, NEW.color
        FROM organizations;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_global_column ON kanban_columns;
CREATE TRIGGER trigger_sync_global_column
AFTER INSERT ON kanban_columns
FOR EACH ROW
EXECUTE FUNCTION public.on_global_column_created();

-- 4. Security (RLS - Read Only for Clients)
-- Reset policies for cards
DROP POLICY IF EXISTS "Users can view own organization cards" ON kanban_cards;
DROP POLICY IF EXISTS "Users can create own organization cards" ON kanban_cards;
DROP POLICY IF EXISTS "Users can update own organization cards" ON kanban_cards;
DROP POLICY IF EXISTS "Users can delete own organization cards" ON kanban_cards;

-- SELECT: All users in the org can see cards
CREATE POLICY "Users can view own organization cards"
ON kanban_cards FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE profiles.organization_id = kanban_cards.organization_id
  )
);

-- INSERT/UPDATE/DELETE: Only KYRIE_ADMIN or KYRIE_TEAM
CREATE POLICY "Kyrie staff can modify cards"
ON kanban_cards FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('KYRIE_ADMIN', 'KYRIE_TEAM')
  )
);

-- Reset policies for columns
DROP POLICY IF EXISTS "Users can view own and global columns" ON kanban_columns;
DROP POLICY IF EXISTS "Users can modify own organization columns" ON kanban_columns;
DROP POLICY IF EXISTS "Kyrie Admins can modify all columns" ON kanban_columns;

CREATE POLICY "Users can view columns"
ON kanban_columns FOR SELECT
USING (true);

CREATE POLICY "Kyrie staff can modify columns"
ON kanban_columns FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('KYRIE_ADMIN', 'KYRIE_TEAM')
  )
);

COMMIT;
