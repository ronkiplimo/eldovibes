
-- First, let's check the current RLS policies and fix them
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Escorts can insert own profile" ON public.escort_profiles;
DROP POLICY IF EXISTS "Escorts can update own profile" ON public.escort_profiles;

-- Create correct policies for escort profile creation and updates
CREATE POLICY "Users can insert own escort profile" 
ON public.escort_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own escort profile" 
ON public.escort_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Also ensure the SELECT policy allows users to see their own profiles
DROP POLICY IF EXISTS "Users can view own escort profile" ON public.escort_profiles;
CREATE POLICY "Users can view own escort profile" 
ON public.escort_profiles 
FOR SELECT 
USING (auth.uid() = user_id OR verified = true);
