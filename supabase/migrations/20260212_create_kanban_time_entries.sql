-- Migration: Create Kanban Time Entries (Fix Time Tracking)
-- Date: 2026-02-12
-- Description: Creates the missing table for card-based time tracking and deprecates 'time_entries'.

-- 1. Create Table
CREATE TABLE IF NOT EXISTS public.kanban_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ, -- If NULL, timer is running
    duration INTEGER DEFAULT 0, -- Accumulated seconds
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX idx_kanban_time_entries_user_id ON public.kanban_time_entries(user_id);
CREATE INDEX idx_kanban_time_entries_card_id ON public.kanban_time_entries(card_id);

-- 3. INTEGRITY RULE: Only ONE active timer (end_time IS NULL) per user
CREATE UNIQUE INDEX idx_one_active_timer_per_user 
ON public.kanban_time_entries(user_id) 
WHERE end_time IS NULL;

-- 4. Enable RLS
ALTER TABLE public.kanban_time_entries ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Policy: Users can view their own entries
CREATE POLICY "Users can view own time entries"
ON public.kanban_time_entries FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own entries
CREATE POLICY "Users can insert own time entries"
ON public.kanban_time_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own entries
CREATE POLICY "Users can update own time entries"
ON public.kanban_time_entries FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own entries
CREATE POLICY "Users can delete own time entries"
ON public.kanban_time_entries FOR DELETE
USING (auth.uid() = user_id);

-- Policy: KYRIE_ADMIN can view all entries
CREATE POLICY "Admins can view all time entries"
ON public.kanban_time_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);

-- Policy: KYRIE_ADMIN can modify all entries (optional, for management)
CREATE POLICY "Admins can modify all time entries"
ON public.kanban_time_entries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'KYRIE_ADMIN'
  )
);
