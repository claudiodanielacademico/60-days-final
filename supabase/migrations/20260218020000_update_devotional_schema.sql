-- Add prayer and duration_min columns to daily_content
ALTER TABLE public.daily_content 
ADD COLUMN IF NOT EXISTS prayer TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS duration_min INT NOT NULL DEFAULT 15;

-- Update existing content with placeholders if necessary (usually handled by the data team, but good for safety)
UPDATE public.daily_content 
SET prayer = 'Lord, open my heart to Your word today. Amen.'
WHERE prayer = '';

-- Optional: Add a column to track join date for more robust local-time calculation if not using auth user's created_at
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS journey_start_date TIMESTAMPTZ DEFAULT now();
