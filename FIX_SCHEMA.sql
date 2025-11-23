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

-- IMPORTANT: Add email column to profiles for username-based login
-- This is required for the login functionality to work with usernames
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles (email);

-- Update existing profiles with email from auth.users (if any exist)
-- This is a one-time migration
UPDATE public.profiles p
SET email = (
  SELECT email 
  FROM auth.users u 
  WHERE u.id = p.id
)
WHERE p.email IS NULL;

