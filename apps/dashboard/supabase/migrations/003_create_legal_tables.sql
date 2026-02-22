-- Migration 003: Create legal documents tables

CREATE TYPE legal_document_type AS ENUM ('terms_of_service', 'privacy_policy');

-- Legal documents
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type legal_document_type NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (type, version)
);

-- Ensure only one active document per type
CREATE UNIQUE INDEX unique_active_document_per_type
  ON public.legal_documents (type)
  WHERE is_active = true;

-- User legal acceptances
CREATE TABLE IF NOT EXISTS public.user_legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.legal_documents(id),
  document_type legal_document_type NOT NULL,
  document_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE (user_id, document_id)
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can read active legal documents
CREATE POLICY "Public can read active documents"
  ON public.legal_documents FOR SELECT
  USING (is_active = true);

-- Superadmin can manage all documents
CREATE POLICY "Superadmin full access on legal_documents"
  ON public.legal_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

-- Users can read own acceptances
CREATE POLICY "Users can view own acceptances"
  ON public.user_legal_acceptances FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own acceptances
CREATE POLICY "Users can insert own acceptances"
  ON public.user_legal_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Superadmin full access
CREATE POLICY "Superadmin full access on acceptances"
  ON public.user_legal_acceptances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );
