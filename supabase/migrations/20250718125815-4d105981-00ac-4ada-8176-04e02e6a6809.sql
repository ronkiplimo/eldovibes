-- Create function for admin to get all escort profiles bypassing RLS
CREATE OR REPLACE FUNCTION get_all_escort_profiles_admin(search_term text DEFAULT '')
RETURNS TABLE (
  id uuid,
  user_id uuid,
  stage_name text,
  bio text,
  age integer,
  category text,
  services_offered text[],
  hourly_rate numeric,
  availability_status availability_status,
  location text,
  verified boolean,
  rating numeric,
  total_reviews integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  profile_image_url text,
  phone_number text,
  date_of_birth date,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return all escort profiles with optional search
  RETURN QUERY
  SELECT 
    ep.id,
    ep.user_id,
    ep.stage_name,
    ep.bio,
    ep.age,
    ep.category,
    ep.services_offered,
    ep.hourly_rate,
    ep.availability_status,
    ep.location,
    ep.verified,
    ep.rating,
    ep.total_reviews,
    ep.created_at,
    ep.updated_at,
    ep.profile_image_url,
    ep.phone_number,
    ep.date_of_birth,
    ep.is_active
  FROM escort_profiles ep
  WHERE 
    CASE 
      WHEN search_term = '' THEN true
      ELSE ep.stage_name ILIKE '%' || search_term || '%'
    END
  ORDER BY ep.created_at DESC;
END;
$$;