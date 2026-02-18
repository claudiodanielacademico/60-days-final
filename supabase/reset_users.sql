-- WARNING: THIS SCRIPT WILL DELETE ALL USERS AND THEIR DATA
-- Only run this if you want to start the application with a clean slate.

-- 1. Use the service role or administrative access to wipe the auth schema
-- This will trigger cascade deletes if foreign keys are set up with ON DELETE CASCADE.

-- In Supabase, the public.profiles usually has a foreign key to auth.users.
-- To be safe, we can manually clean up the public tables first if we want to be explicit,
-- but a simple delete on auth.users is the most direct way for "new accesses".

BEGIN;

-- Delete from auth.users (this table is in the 'auth' schema)
-- Note: This requires high-level privileges (SQL Editor in Supabase Dashboard)
DELETE FROM auth.users;

-- If you have specific records that might not cascade, you can add them here:
-- TRUNCATE public.community_posts CASCADE;
-- TRUNCATE public.journey_progress CASCADE;
-- TRUNCATE public.prayer_requests CASCADE;

COMMIT;

-- After running this, all previous emails will be available for new registration.
