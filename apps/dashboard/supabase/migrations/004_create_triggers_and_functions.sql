-- Migration 004: Triggers and functions

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_legal_documents_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_provider auth_provider;
BEGIN
  -- Detect auth provider from raw_app_meta_data
  v_provider := CASE
    WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'::auth_provider
    WHEN NEW.raw_app_meta_data->>'provider' = 'facebook' THEN 'facebook'::auth_provider
    WHEN NEW.raw_app_meta_data->>'provider' = 'linkedin_oidc' THEN 'linkedin'::auth_provider
    ELSE 'email'::auth_provider
  END;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    auth_provider,
    status,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    v_provider,
    'pending_email',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync last_sign_in_at from auth.users
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles
    SET last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- Sync email verification (pending_email -> pending_activation)
CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET
      status = 'pending_activation',
      email_verified_at = NEW.email_confirmed_at
    WHERE id = NEW.id
      AND status = 'pending_email';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmed();

-- Function to activate a user (called by superadmin)
CREATE OR REPLACE FUNCTION public.activate_user(
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Verify caller is superadmin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_admin_id AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: only superadmin can activate users';
  END IF;

  UPDATE public.profiles
  SET
    status = 'active',
    activated_at = NOW(),
    activated_by = p_admin_id
  WHERE id = p_user_id
    AND status = 'pending_activation';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found or not in pending_activation status';
  END IF;
END;
$$;

-- Function to get dashboard KPI stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users_this_month BIGINT,
  pending_activation BIGINT,
  new_users_this_week BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COUNT(*) FILTER (WHERE role = 'user') AS total_users,
    COUNT(*) FILTER (
      WHERE role = 'user'
      AND status = 'active'
      AND last_sign_in_at >= date_trunc('month', NOW())
    ) AS active_users_this_month,
    COUNT(*) FILTER (
      WHERE role = 'user'
      AND status = 'pending_activation'
    ) AS pending_activation,
    COUNT(*) FILTER (
      WHERE role = 'user'
      AND created_at >= NOW() - INTERVAL '7 days'
    ) AS new_users_this_week
  FROM public.profiles;
$$;
