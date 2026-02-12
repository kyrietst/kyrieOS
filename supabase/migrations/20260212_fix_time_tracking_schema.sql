-- migration: 20260212_fix_time_tracking_schema
-- Fix time tracking schema by ensuring foreign key joins with profiles and unique active timer

-- Drop existing table if any
DROP TABLE IF EXISTS kanban_time_entries;

-- Create table for Card-based Time Tracking
CREATE TABLE kanban_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Link to profiles for discoverable joins
    start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_time TIMESTAMPTZ, -- NULL means "running"
    duration INTEGER DEFAULT 0, -- Seconds accumulated
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_kanban_time_entries_card_id ON kanban_time_entries(card_id);
CREATE INDEX idx_kanban_time_entries_user_id ON kanban_time_entries(user_id);

-- Constraint: Ensure only ONE running timer per user
CREATE UNIQUE INDEX idx_one_active_timer_per_user 
ON kanban_time_entries (user_id) 
WHERE end_time IS NULL;

-- Enable RLS
ALTER TABLE kanban_time_entries ENABLE ROW LEVEL SECURITY;

-- Simplified Policies
CREATE POLICY "Users can manage own time entries"
ON kanban_time_entries FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all time entries"
ON kanban_time_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);
