
-- Add is_banned and is_active columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_banned boolean DEFAULT false,
ADD COLUMN is_active boolean DEFAULT true;

-- Add is_active column to escort_profiles table  
ALTER TABLE public.escort_profiles
ADD COLUMN is_active boolean DEFAULT true;
