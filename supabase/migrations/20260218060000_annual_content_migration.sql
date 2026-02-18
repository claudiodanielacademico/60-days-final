-- Annual Content Library to support 365 versions of 60 steps (21,900 entries)
CREATE TABLE public.daily_content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id INT NOT NULL CHECK (version_id >= 1 AND version_id <= 365),
  step_number INT NOT NULL CHECK (step_number >= 1 AND step_number <= 60),
  title TEXT NOT NULL,
  scripture TEXT NOT NULL,
  reflection TEXT NOT NULL,
  task TEXT NOT NULL,
  prayer TEXT NOT NULL DEFAULT '',
  duration_min INT NOT NULL DEFAULT 1,
  seasonal_theme TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(version_id, step_number)
);

-- Index for fast lookup based on day of year and step number
CREATE INDEX idx_content_version_step ON public.daily_content_library(version_id, step_number);

-- Enable RLS
ALTER TABLE public.daily_content_library ENABLE ROW LEVEL SECURITY;

-- Read access for everyone
CREATE POLICY "Anyone can read content library" ON public.daily_content_library FOR SELECT USING (true);

-- Function to get content version based on date
CREATE OR REPLACE FUNCTION public.get_current_content_version(check_date DATE DEFAULT CURRENT_DATE)
RETURNS INT AS $$
BEGIN
  -- Returns day of year (1-366)
  -- Leap year handling: if it's Dec 31 in a leap year (366), return 365 to stay in 1-365 range
  -- Or handle Feb 29 separately. Let's return 1-365.
  RETURN LEAST(EXTRACT(DOY FROM check_date)::INT, 365);
END;
$$ LANGUAGE plpgsql STABLE;

-- Seasonal Theme Mapping Reference (Informational)
-- 1-31 (Jan): Renewal
-- 32-59 (Feb): Friendship/Self-Love
-- 60-90 (Mar): Faith
-- 91-120 (Apr): Easter (Resurrection/New Life)
-- 121-151 (May): Family/Motherhood
-- 152-181 (Jun): Community
-- 182-212 (Jul): Persistence
-- 213-243 (Aug): Strength/Fatherhood
-- 244-273 (Sep): Creation/Growth
-- 274-304 (Oct): Joy/Simplicity (Child-like Faith)
-- 305-334 (Nov): Gratitude
-- 335-365 (Dec): Christmas (Hope/Light)
