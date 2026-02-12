-- Migration: Add Labels System with color rotation
-- Created: 2026-02-07

-- 1. Criar tabela kanban_labels
CREATE TABLE IF NOT EXISTS kanban_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- 2. Criar tabela de junção kanban_card_labels
CREATE TABLE IF NOT EXISTS kanban_card_labels (
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES kanban_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (card_id, label_id)
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_kanban_labels_org ON kanban_labels(organization_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_labels_card ON kanban_card_labels(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_labels_label ON kanban_card_labels(label_id);

-- 4. Migração de dados: labels[] -> kanban_labels + kanban_card_labels com cores rotativas
DO $$
DECLARE
  card_record RECORD;
  label_name TEXT;
  label_id UUID;
  color_index INTEGER := 0;
  colors TEXT[] := ARRAY['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500'];
  label_color TEXT;
BEGIN
  FOR card_record IN 
    SELECT id, organization_id, labels 
    FROM kanban_cards 
    WHERE labels IS NOT NULL AND array_length(labels, 1) > 0
  LOOP
    FOREACH label_name IN ARRAY card_record.labels
    LOOP
      -- Determinar cor rotativa
      label_color := colors[(color_index % 6) + 1];
      color_index := color_index + 1;
      
      -- Inserir label se não existir (ou pegar ID existente)
      INSERT INTO kanban_labels (organization_id, name, color)
      VALUES (card_record.organization_id, label_name, label_color)
      ON CONFLICT (organization_id, name) DO NOTHING
      RETURNING id INTO label_id;
      
      -- Se INSERT retornou NULL (conflito), buscar ID existente
      IF label_id IS NULL THEN
        SELECT id INTO label_id 
        FROM kanban_labels 
        WHERE organization_id = card_record.organization_id AND name = label_name;
      END IF;
      
      -- Associar card com label
      INSERT INTO kanban_card_labels (card_id, label_id)
      VALUES (card_record.id, label_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

COMMENT ON TABLE kanban_labels IS 'Normalized labels for kanban cards with color support';
COMMENT ON TABLE kanban_card_labels IS 'Junction table for many-to-many relationship between cards and labels';
