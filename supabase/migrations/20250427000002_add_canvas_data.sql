-- Add a JSONB column to store canvas nodes and edges
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS canvas_data JSONB;

-- Add a constraint to ensure canvas_data is only populated for canvas notes (optional but good practice)
-- Note: Adjust if you might store metadata for markdown notes here later
ALTER TABLE public.notes
ADD CONSTRAINT check_canvas_data_for_canvas_type
CHECK ( (type = 'canvas' AND canvas_data IS NOT NULL) OR (type != 'canvas' AND canvas_data IS NULL) );