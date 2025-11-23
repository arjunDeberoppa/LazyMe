-- Fix the username constraint to allow NULL values
-- Run this in your Supabase SQL editor

-- Drop the existing constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS username_format_check;

-- Add the constraint that allows NULL or valid username format
ALTER TABLE public.profiles
ADD CONSTRAINT username_format_check 
CHECK (
  username IS NULL 
  OR username ~ '^[A-Za-z0-9_]{3,30}$'
);

-- Note: The email column is not in your schema, so we've removed it from the code
-- If you want to add email column, run:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
-- CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

