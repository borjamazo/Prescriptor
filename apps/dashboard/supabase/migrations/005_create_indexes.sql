-- Migration 005: Performance indexes

-- profiles
CREATE INDEX idx_profiles_status ON public.profiles (status);
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_created_at ON public.profiles (created_at DESC);
CREATE INDEX idx_profiles_last_sign_in ON public.profiles (last_sign_in_at DESC NULLS LAST);
CREATE INDEX idx_profiles_auth_provider ON public.profiles (auth_provider);
CREATE INDEX idx_profiles_email ON public.profiles (email);

-- app_usage
CREATE INDEX idx_app_usage_user_id ON public.app_usage (user_id);
CREATE INDEX idx_app_usage_year_month ON public.app_usage (year DESC, month DESC);
CREATE INDEX idx_app_usage_total ON public.app_usage (total_uses DESC);

-- usage_events
CREATE INDEX idx_usage_events_user_id ON public.usage_events (user_id);
CREATE INDEX idx_usage_events_created_at ON public.usage_events (created_at DESC);
CREATE INDEX idx_usage_events_type ON public.usage_events (event_type);

-- legal_documents
CREATE INDEX idx_legal_documents_type ON public.legal_documents (type);
CREATE INDEX idx_legal_documents_active ON public.legal_documents (is_active, type);

-- user_legal_acceptances
CREATE INDEX idx_legal_acceptances_user ON public.user_legal_acceptances (user_id);
CREATE INDEX idx_legal_acceptances_document ON public.user_legal_acceptances (document_id);
