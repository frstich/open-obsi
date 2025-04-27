-- Add a type column to distinguish between markdown and canvas notes
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'markdown';

-- Add an index for potential filtering
CREATE INDEX IF NOT EXISTS idx_notes_type ON public.notes(type);