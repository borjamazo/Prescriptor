-- Seed: Create superadmin user
-- Run this AFTER running all migrations.
-- Replace the values below before executing.

-- 1. Create the auth user via Supabase Auth API (or Dashboard):
--    Email: admin@prescriptor.app
--    Password: (set a strong password)
--    Then copy the UUID from auth.users and use it below.

-- 2. After creating the auth user, update their profile to superadmin:
UPDATE public.profiles
SET
  role = 'superadmin',
  status = 'active',
  full_name = 'Super Admin',
  email_verified_at = NOW(),
  activated_at = NOW()
WHERE email = 'borjamazo@gmail.com';

-- 3. Insert default legal documents (terms & privacy as placeholders)
INSERT INTO public.legal_documents (type, version, title, content, is_active, published_at, created_by)
SELECT
  'terms_of_service',
  '1.0.0',
  'Términos de Servicio',
  '<h1>Términos de Servicio</h1><p>Versión 1.0.0 - Por favor actualiza este contenido.</p>',
  true,
  NOW(),
  id
FROM public.profiles WHERE email = 'borjamazo@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.legal_documents (type, version, title, content, is_active, published_at, created_by)
SELECT
  'privacy_policy',
  '1.0.0',
  'Política de Privacidad',
  '<h1>Política de Privacidad</h1><p>Versión 1.0.0 - Por favor actualiza este contenido.</p>',
  true,
  NOW(),
  id
FROM public.profiles WHERE email = 'borjamazo@gmail.com'
ON CONFLICT DO NOTHING;
