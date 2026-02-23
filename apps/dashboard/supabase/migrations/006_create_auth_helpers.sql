-- Migration 006: Create auth helper functions

-- Function to check user status during login (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_user_status(user_id UUID)
RETURNS TABLE (
  status user_status,
  role user_role
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.status, p.role
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$;

-- Function to get current user profile (bypasses RLS for own profile)
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  country TEXT,
  city TEXT,
  status user_status,
  auth_provider auth_provider,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.phone,
    p.date_of_birth,
    p.country,
    p.city,
    p.status,
    p.auth_provider,
    p.created_at,
    p.last_sign_in_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_status(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;

-- Function to update current user profile (bypasses RLS for own profile)
CREATE OR REPLACE FUNCTION public.update_current_user_profile(
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET
    full_name = COALESCE(p_full_name, full_name),
    phone = COALESCE(p_phone, phone),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    country = COALESCE(p_country, country),
    city = COALESCE(p_city, city),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = NOW()
  WHERE id = auth.uid();
  
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_current_user_profile(TEXT, TEXT, DATE, TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.check_user_status IS 'Check user status and role during login. Bypasses RLS for authentication purposes.';
COMMENT ON FUNCTION public.get_current_user_profile IS 'Get current user profile. Bypasses RLS for own profile access.';
COMMENT ON FUNCTION public.update_current_user_profile IS 'Update current user profile. Bypasses RLS for own profile updates.';
