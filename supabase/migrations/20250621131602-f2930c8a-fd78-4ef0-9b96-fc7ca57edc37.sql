
-- Add admin-specific columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create admin_activity_logs table to track admin actions
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'user', 'escort', 'booking', etc.
  target_id UUID,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_settings table for global settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_activity_logs (only admins can access)
CREATE POLICY "Only admins can view activity logs" 
  ON public.admin_activity_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can insert activity logs" 
  ON public.admin_activity_logs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS policies for platform_settings (only admins can access)
CREATE POLICY "Only admins can view platform settings" 
  ON public.platform_settings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update platform settings" 
  ON public.platform_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description) 
VALUES 
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('registration_enabled', 'true', 'Allow new user registrations'),
  ('escort_verification_required', 'true', 'Require admin verification for new escorts'),
  ('platform_commission_rate', '0.15', 'Platform commission rate (15%)'),
  ('minimum_booking_amount', '50', 'Minimum booking amount in currency'),
  ('max_upload_size_mb', '10', 'Maximum file upload size in MB')
ON CONFLICT (setting_key) DO NOTHING;
