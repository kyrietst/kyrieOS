-- Add start_date and end_date to kanban_cards for React Big Calendar
-- Also ensure they are timestamptz

ALTER TABLE public.kanban_cards
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Index for range queries
CREATE INDEX IF NOT EXISTS idx_kanban_cards_dates ON public.kanban_cards(start_date, end_date);
