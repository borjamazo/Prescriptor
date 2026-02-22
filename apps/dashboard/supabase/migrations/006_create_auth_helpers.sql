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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_status(UUID) TO anon;

COMMENT ON FUNCTION public.check_user_status IS 'Check user status and role during login. Bypasses RLS for authentication purposes.';
