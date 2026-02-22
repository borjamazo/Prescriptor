# Fix: Login con RLS (Row Level Security)

## Problema Identificado

El login fallaba porque la tabla `profiles` tiene RLS habilitado con políticas que solo permiten:
1. Ver tu propio perfil
2. Superadmin puede ver todo

Esto crea un problema de "huevo y gallina": para verificar si eres superadmin durante el login, necesitas leer la tabla `profiles`, pero las políticas RLS bloquean la lectura porque aún no estás autenticado como superadmin.

## Solución Aplicada

Usar el **Service Role Key** (que bypasea RLS) para verificar el role del usuario durante:
1. Login (`_auth.login.tsx`)
2. Verificación de autenticación (`auth.server.ts`)
3. Redirección inicial (`_index.tsx`)

### Archivos Modificados

#### 1. `apps/dashboard/app/routes/_auth.login.tsx`
```typescript
// Usar service client para verificar role
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const serviceSupabase = createSupabaseServiceClient();

const { data: profile, error: profileError } = await serviceSupabase
  .from("profiles")
  .select("role")
  .eq("id", data.user.id)
  .single();
```

#### 2. `apps/dashboard/app/lib/auth.server.ts`
```typescript
import { createSupabaseServiceClient } from "~/lib/supabase.server";

// En requireSuperAdmin
const serviceSupabase = createSupabaseServiceClient();
const { data: profile, error: profileError } = await serviceSupabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();
```

#### 3. `apps/dashboard/app/routes/_index.tsx`
```typescript
import { createSupabaseServiceClient } from "~/lib/supabase.server";

// Verificar role con service client
const serviceSupabase = createSupabaseServiceClient();
const { data: profile } = await serviceSupabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();
```

## Cómo Crear un Usuario Superadmin

### Opción 1: Desde el Dashboard de Supabase

1. Ve a https://supabase.com/dashboard/project/brhcijwwhtkfwnrcbaju
2. Ve a **Authentication** → **Users**
3. Crea un nuevo usuario con email y contraseña
4. Copia el UUID del usuario
5. Ve a **SQL Editor** y ejecuta:

```sql
-- Insertar perfil de superadmin
INSERT INTO public.profiles (
  id,
  email,
  role,
  status,
  auth_provider,
  email_verified_at
)
VALUES (
  'UUID_DEL_USUARIO',  -- Reemplazar con el UUID del usuario
  'admin@prescriptor.app',  -- Email del usuario
  'superadmin',
  'active',
  'email',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'superadmin',
    status = 'active';
```

### Opción 2: Crear Usuario y Perfil en un Solo Paso

Si tienes acceso a la base de datos directamente:

```sql
-- 1. Crear usuario en auth.users (esto normalmente lo hace Supabase Auth)
-- Nota: Esto es solo para desarrollo, en producción usa el signup normal

-- 2. Crear perfil de superadmin
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  status,
  auth_provider,
  email_verified_at,
  activated_at
)
VALUES (
  auth.uid(),  -- Si estás ejecutando como el usuario
  'admin@prescriptor.app',
  'Administrador',
  'superadmin',
  'active',
  'email',
  NOW(),
  NOW()
);
```

### Opción 3: Actualizar Usuario Existente

Si ya tienes un usuario creado:

```sql
-- Actualizar role a superadmin
UPDATE public.profiles
SET role = 'superadmin',
    status = 'active'
WHERE email = 'tu-email@ejemplo.com';
```

## Verificar que Funciona

1. Reinicia el servidor de desarrollo:
```bash
cd apps/dashboard
npm run dev
```

2. Abre http://localhost:3002

3. Inicia sesión con las credenciales del superadmin

4. Deberías ser redirigido a http://localhost:3002/dashboard

## Logs de Debugging

El código ahora incluye logs en la consola del servidor:
```typescript
console.log("User ID:", data.user.id);
console.log("Profile data:", profile);
console.log("Profile error:", profileError);
```

Revisa la terminal donde corre `npm run dev` para ver estos logs si hay problemas.

## Políticas RLS Actuales

La tabla `profiles` tiene estas políticas:

1. **Users can view own profile**: Los usuarios pueden ver su propio perfil
2. **Users can update own profile**: Los usuarios pueden actualizar su propio perfil
3. **Superadmin full access**: Los superadmin pueden hacer todo

Estas políticas son correctas y seguras. El Service Role Key se usa solo en el servidor para operaciones administrativas.

## Seguridad

- ✅ El Service Role Key solo se usa en el servidor (nunca se expone al cliente)
- ✅ Las políticas RLS protegen los datos de usuarios normales
- ✅ Solo el código del servidor puede usar el Service Role Key
- ✅ Los usuarios normales no pueden ver perfiles de otros usuarios
- ✅ Solo hay un superadmin permitido (constraint en la base de datos)

## Troubleshooting

### Error: "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY"
Verifica que el archivo `.env` tenga la variable:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Error: "No tienes permisos para acceder al panel de administración"
1. Verifica que el usuario tenga `role = 'superadmin'` en la tabla profiles
2. Verifica que el usuario esté activo (`status = 'active'`)
3. Revisa los logs en la consola del servidor

### Error: "Error al verificar perfil: ..."
1. Verifica que las migraciones se hayan ejecutado
2. Verifica que la tabla `profiles` exista
3. Verifica que el usuario tenga un registro en `profiles`

### El usuario no tiene registro en profiles
Ejecuta este SQL para crear el registro:
```sql
INSERT INTO public.profiles (id, email, role, status, auth_provider)
SELECT id, email, 'superadmin', 'active', 'email'
FROM auth.users
WHERE email = 'tu-email@ejemplo.com'
ON CONFLICT (id) DO UPDATE
SET role = 'superadmin', status = 'active';
```

---

**Status**: ✅ Arreglado
**Fecha**: 22 de Febrero, 2026
