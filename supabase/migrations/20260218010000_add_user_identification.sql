-- Add username and user_code to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_code TEXT;

-- Function to generate unique 10-character alphanumeric code
CREATE OR REPLACE FUNCTION public.generate_user_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT := '';
  i INT;
  is_unique BOOLEAN := false;
BEGIN
  WHILE NOT is_unique LOOP
    code := '';
    FOR i IN 1..10 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if code is unique
    SELECT NOT EXISTS(SELECT 1 FROM public.profiles WHERE user_code = code) INTO is_unique;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate username from display_name or email
CREATE OR REPLACE FUNCTION public.generate_username(email TEXT, display_name TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
  is_unique BOOLEAN := false;
BEGIN
  -- Create base username from display_name or email
  IF display_name IS NOT NULL AND display_name != '' THEN
    base_username := lower(regexp_replace(display_name, '[^a-zA-Z0-9_]', '', 'g'));
  ELSE
    base_username := lower(split_part(email, '@', 1));
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
  END IF;
  
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := 'user' || base_username;
  END IF;
  
  -- Try base username first, then add numbers if needed
  final_username := base_username;
  
  WHILE NOT is_unique LOOP
    SELECT NOT EXISTS(SELECT 1 FROM public.profiles WHERE username = final_username) INTO is_unique;
    
    IF NOT is_unique THEN
      counter := counter + 1;
      final_username := base_username || counter::TEXT;
    END IF;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to generate username and code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  new_code TEXT;
BEGIN
  new_username := generate_username(NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  new_code := generate_user_code();
  
  INSERT INTO public.profiles (user_id, display_name, username, user_code)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    new_username,
    new_code
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill existing users with username and user_code
DO $$
DECLARE
  profile_record RECORD;
  new_username TEXT;
  new_code TEXT;
BEGIN
  FOR profile_record IN 
    SELECT p.id, p.user_id, p.display_name, u.email 
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.user_id
    WHERE p.username IS NULL OR p.user_code IS NULL
  LOOP
    new_username := generate_username(profile_record.email, profile_record.display_name);
    new_code := generate_user_code();
    
    UPDATE public.profiles 
    SET 
      username = new_username,
      user_code = new_code
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Now make the columns NOT NULL and UNIQUE
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN user_code SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_code_unique UNIQUE (user_code);

-- Add check constraint for username format (alphanumeric and underscore only)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_format 
  CHECK (username ~ '^[a-z0-9_]{3,30}$');

-- Add check constraint for user_code format (exactly 10 alphanumeric characters)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_code_format 
  CHECK (user_code ~ '^[A-Z0-9]{10}$');

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_code ON public.profiles(user_code);

-- Create index for username search with text pattern matching
CREATE INDEX IF NOT EXISTS idx_profiles_username_pattern ON public.profiles(username text_pattern_ops);
