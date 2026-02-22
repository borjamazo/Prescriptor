-- Migration 001: Create enums and profiles table

-- Enums
CREATE TYPE user_role AS ENUM ('superadmin', 'user');
CREATE TYPE user_status AS ENUM (
  'pending_email',
  'pending_activation',
  'active',
  'suspended',
  'banned'
);
CREATE TYPE auth_provider AS ENUM ('email', 'google', 'facebook', 'linkedin');

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  country TEXT,
  city TEXT,
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'pending_email',
  auth_provider auth_provider NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  activated_by UUID REFERENCES public.profiles(id),
  accepted_terms_at TIMESTAMPTZ,
  accepted_terms_version TEXT,
  accepted_privacy_at TIMESTAMPTZ,
  accepted_privacy_version TEXT
);

-- Constraint: only one superadmin allowed
CREATE UNIQUE INDEX unique_superadmin ON public.profiles (role)
  WHERE role = 'superadmin';

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Superadmin can do anything
CREATE POLICY "Superadmin full access"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );
