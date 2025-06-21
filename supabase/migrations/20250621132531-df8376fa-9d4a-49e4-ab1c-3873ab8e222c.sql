
-- Add phone_number and date_of_birth columns to escort_profiles table
ALTER TABLE public.escort_profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;
