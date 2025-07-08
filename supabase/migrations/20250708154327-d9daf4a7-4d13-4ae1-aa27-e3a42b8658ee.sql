
-- Add user account status fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add escort profile activation control
ALTER TABLE public.escort_profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update user_role enum to remove escort/client distinction and add user
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'user';

-- Create a function to update existing users to 'user' role
CREATE OR REPLACE FUNCTION migrate_user_roles()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update all client and escort users to 'user' role
  UPDATE public.profiles 
  SET user_role = 'user'
  WHERE user_role IN ('client', 'escort');
END;
$$;

-- Execute the migration
SELECT migrate_user_roles();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_user_roles();

-- Update RLS policies to account for banned/inactive users
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view active profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (is_active = true AND is_banned = false);

-- Update escort profiles policy to only show active escorts
DROP POLICY IF EXISTS "Anyone can view verified escort profiles" ON public.escort_profiles;
CREATE POLICY "Anyone can view active verified escort profiles" 
  ON public.escort_profiles 
  FOR SELECT 
  USING (verified = true AND is_active = true);

-- Add admin policies for managing user status
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

CREATE POLICY "Admins can update user status" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

CREATE POLICY "Admins can manage escort profiles" 
  ON public.escort_profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

-- Update the handle_new_user function to set default role as 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_role, phone, location)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    'user'::user_role,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'location'
  );
  RETURN NEW;
END;
$$;
