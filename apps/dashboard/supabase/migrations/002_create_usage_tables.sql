-- Migration 002: Create usage tables

-- App usage (monthly aggregates)
CREATE TABLE IF NOT EXISTS public.app_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  monthly_uses INTEGER NOT NULL DEFAULT 0,
  monthly_limit INTEGER NOT NULL DEFAULT 10,
  total_uses INTEGER NOT NULL DEFAULT 0,
  last_use_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, year, month)
);

-- Usage events (detailed log)
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can view own usage"
  ON public.app_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.app_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.app_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
  ON public.usage_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own events"
  ON public.usage_events FOR SELECT
  USING (auth.uid() = user_id);

-- Superadmin full access
CREATE POLICY "Superadmin full access on app_usage"
  ON public.app_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin full access on usage_events"
  ON public.usage_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

-- Function to get remaining uses
CREATE OR REPLACE FUNCTION public.get_remaining_uses(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT GREATEST(0, au.monthly_limit - au.monthly_uses)
  FROM public.app_usage au
  WHERE au.user_id = p_user_id
    AND au.year = EXTRACT(YEAR FROM NOW())::INTEGER
    AND au.month = EXTRACT(MONTH FROM NOW())::INTEGER;
$$;
