-- Migration 007: Create prescription tracking tables

-- Prescription blocks (talonarios)
CREATE TABLE IF NOT EXISTS public.prescription_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  block_serial TEXT NOT NULL, -- First prescription number (e.g., "29-8448968")
  total_prescriptions INTEGER NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Issued prescriptions (recetas emitidas)
CREATE TABLE IF NOT EXISTS public.issued_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prescription_number TEXT NOT NULL, -- Full prescription number (e.g., "29-8448969")
  block_id UUID REFERENCES public.prescription_blocks(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Signed prescriptions (recetas firmadas)
CREATE TABLE IF NOT EXISTS public.signed_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prescription_number TEXT NOT NULL, -- Full prescription number (e.g., "29-8448969")
  issued_prescription_id UUID REFERENCES public.issued_prescriptions(id) ON DELETE SET NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prescription_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signed_prescriptions ENABLE ROW LEVEL SECURITY;

-- Prescription blocks policies
CREATE POLICY "Users can view own prescription blocks"
  ON public.prescription_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescription blocks"
  ON public.prescription_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescription blocks"
  ON public.prescription_blocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescription blocks"
  ON public.prescription_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- Issued prescriptions policies
CREATE POLICY "Users can view own issued prescriptions"
  ON public.issued_prescriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issued prescriptions"
  ON public.issued_prescriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Signed prescriptions policies
CREATE POLICY "Users can view own signed prescriptions"
  ON public.signed_prescriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own signed prescriptions"
  ON public.signed_prescriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Superadmin full access
CREATE POLICY "Superadmin full access on prescription_blocks"
  ON public.prescription_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin full access on issued_prescriptions"
  ON public.issued_prescriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin full access on signed_prescriptions"
  ON public.signed_prescriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_prescription_blocks_user_id ON public.prescription_blocks(user_id);
CREATE INDEX idx_prescription_blocks_imported_at ON public.prescription_blocks(imported_at);

CREATE INDEX idx_issued_prescriptions_user_id ON public.issued_prescriptions(user_id);
CREATE INDEX idx_issued_prescriptions_issued_at ON public.issued_prescriptions(issued_at);
CREATE INDEX idx_issued_prescriptions_block_id ON public.issued_prescriptions(block_id);

CREATE INDEX idx_signed_prescriptions_user_id ON public.signed_prescriptions(user_id);
CREATE INDEX idx_signed_prescriptions_signed_at ON public.signed_prescriptions(signed_at);
CREATE INDEX idx_signed_prescriptions_issued_id ON public.signed_prescriptions(issued_prescription_id);

-- Function to get user prescription stats
CREATE OR REPLACE FUNCTION public.get_user_prescription_stats(p_user_id UUID)
RETURNS TABLE (
  total_blocks INTEGER,
  total_issued INTEGER,
  total_signed INTEGER,
  issued_this_month INTEGER,
  signed_this_month INTEGER,
  issued_today INTEGER,
  signed_today INTEGER
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.prescription_blocks WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.issued_prescriptions WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.signed_prescriptions WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.issued_prescriptions 
     WHERE user_id = p_user_id 
     AND issued_at >= date_trunc('month', NOW())),
    (SELECT COUNT(*)::INTEGER FROM public.signed_prescriptions 
     WHERE user_id = p_user_id 
     AND signed_at >= date_trunc('month', NOW())),
    (SELECT COUNT(*)::INTEGER FROM public.issued_prescriptions 
     WHERE user_id = p_user_id 
     AND issued_at >= date_trunc('day', NOW())),
    (SELECT COUNT(*)::INTEGER FROM public.signed_prescriptions 
     WHERE user_id = p_user_id 
     AND signed_at >= date_trunc('day', NOW()));
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prescription_blocks_updated_at
  BEFORE UPDATE ON public.prescription_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
