
-- Create membership status enum
CREATE TYPE membership_status AS ENUM ('free', 'paid', 'expired');

-- Create memberships table to track user subscriptions
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status membership_status DEFAULT 'free',
  payment_reference TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'KES',
  payment_method TEXT DEFAULT 'mpesa',
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create mpesa_transactions table to track payment attempts
CREATE TABLE public.mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checkout_request_id TEXT UNIQUE,
  merchant_request_id TEXT,
  phone_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT DEFAULT 'CustomerPayBillOnline',
  status TEXT DEFAULT 'pending', -- pending, success, failed, cancelled
  mpesa_receipt_number TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for memberships
CREATE POLICY "Users can view own membership" 
  ON public.memberships 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own membership" 
  ON public.memberships 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own membership" 
  ON public.memberships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for mpesa_transactions
CREATE POLICY "Users can view own transactions" 
  ON public.mpesa_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
  ON public.mpesa_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to create default membership for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.memberships (user_id, status)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create membership on user signup
CREATE TRIGGER on_auth_user_created_membership
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_membership();

-- Function to update escort profile visibility based on membership
CREATE OR REPLACE FUNCTION public.update_escort_profile_visibility()
RETURNS TRIGGER AS $$
BEGIN
  -- If membership becomes paid, make escort profile visible
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE public.escort_profiles 
    SET verified = true
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- If membership expires, hide escort profile
  IF NEW.status = 'expired' AND OLD.status = 'paid' THEN
    UPDATE public.escort_profiles 
    SET verified = false
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update escort profile visibility when membership changes
CREATE TRIGGER on_membership_status_change
  AFTER UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_escort_profile_visibility();

-- Update existing escort profiles RLS policy to only show paid members
DROP POLICY IF EXISTS "Anyone can view escort profiles" ON public.escort_profiles;
CREATE POLICY "Anyone can view verified escort profiles" 
  ON public.escort_profiles 
  FOR SELECT 
  USING (verified = true);
