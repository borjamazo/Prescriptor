# Fix: Actualización de Perfil en Supabase

## Cambios Realizados

### 1. Función RPC para Actualizar Perfil

Se agregó una nueva función RPC `update_current_user_profile()` en la migración `006_create_auth_helpers.sql` que permite actualizar el perfil del usuario de forma segura, bypasseando RLS.

**Características:**
- `SECURITY DEFINER`: Ejecuta con permisos del creador (bypasea RLS)
- Solo actualiza el perfil del usuario autenticado actual (`auth.uid()`)
- Usa `COALESCE` para solo actualizar campos que se envían
- Actualiza automáticamente el campo `updated_at`
- Retorna `BOOLEAN` indicando si se actualizó algún registro

### 2. Servicio Mobile Actualizado

La función `updateUserProfile()` en `SupabaseService.ts` ahora usa la función RPC en lugar de una consulta directa:

```typescript
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay usuario autenticado');

  // Usar función RPC que bypasea RLS
  const { error } = await supabase.rpc('update_current_user_profile', {
    p_full_name: updates.full_name ?? null,
    p_phone: updates.phone ?? null,
    p_date_of_birth: updates.date_of_birth ?? null,
    p_country: updates.country ?? null,
    p_city: updates.city ?? null,
    p_avatar_url: updates.avatar_url ?? null,
  });

  if (error) {
    console.error('Error updating profile via RPC:', error);
    throw new Error(error.message);
  }
}
```

### 3. AccountScreen Actualizado

El `AccountScreen` ahora:
1. Importa `useAuth` para acceder al contexto
2. Llama a `refreshProfile()` después de guardar para actualizar el contexto global
3. Esto asegura que el nombre se actualice en todas las pantallas (Home, Settings, etc.)

### 4. HomeScreen Actualizado

La pantalla de Home ahora muestra el nombre real del usuario en lugar de "Dr. Smith":
- Usa `userProfile` del contexto de autenticación
- Muestra `full_name` si existe, o el email si no
- Se actualiza automáticamente cuando se edita el perfil

## Migración SQL Completa

La migración `006_create_auth_helpers.sql` ahora incluye 3 funciones:

1. **`check_user_status(user_id)`** - Verificar status durante login
2. **`get_current_user_profile()`** - Obtener perfil completo
3. **`update_current_user_profile(...)`** - Actualizar perfil (NUEVO)

## Cómo Aplicar

### Paso 1: Ejecutar Migración Actualizada

Ve a Supabase Dashboard → SQL Editor y ejecuta:

```sql
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
```

### Paso 2: Verificar las Funciones

```sql
-- Verificar que las funciones existen
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%user%profile%';

-- Debería retornar:
-- check_user_status
-- get_current_user_profile
-- update_current_user_profile
```

### Paso 3: Probar la Actualización

```sql
-- Probar actualización (cambia 'Tu Nombre' por tu nombre real)
SELECT public.update_current_user_profile(
  p_full_name := 'Tu Nombre',
  p_phone := '+34 600 000 000'
);

-- Verificar que se actualizó
SELECT * FROM public.get_current_user_profile();
```

### Paso 4: Rebuild de la App Mobile

```bash
cd apps/mobile
npm run android
```

## Flujo Completo de Actualización

1. Usuario edita su perfil en `AccountScreen`
2. Click en "Guardar"
3. Se llama a `updateUserProfile()` con los cambios
4. La función RPC `update_current_user_profile()` actualiza en Supabase
5. Se recarga el perfil local con `loadProfile()`
6. Se actualiza el contexto global con `refreshProfile()`
7. El nombre se actualiza automáticamente en:
   - AccountScreen
   - SettingsScreen
   - HomeScreen (card de bienvenida)

## Verificación

Para verificar que todo funciona:

1. **Inicia sesión** en la app mobile
2. **Ve a Settings** → Click en "Editar Perfil"
3. **Edita tu nombre** y otros datos
4. **Guarda los cambios**
5. Verifica que aparece el mensaje "Perfil actualizado correctamente"
6. **Ve a Home** → Deberías ver tu nombre en la card de bienvenida
7. **Vuelve a Settings** → Deberías ver tus datos actualizados
8. **Verifica en Supabase Dashboard** → Los datos deben estar actualizados en la tabla `profiles`

## Seguridad

✅ **Seguro**: Solo actualiza el perfil del usuario autenticado actual
✅ **Controlado**: Solo campos específicos pueden ser actualizados
✅ **Auditado**: Actualiza automáticamente `updated_at`
✅ **Aislado**: No puede modificar datos de otros usuarios
✅ **Validado**: Usa `COALESCE` para mantener valores existentes si no se envían

## Troubleshooting

### Error: "function public.update_current_user_profile does not exist"
**Solución**: Ejecuta la migración SQL actualizada

### Error: "permission denied for function update_current_user_profile"
**Solución**: Ejecuta el GRANT en la migración:
```sql
GRANT EXECUTE ON FUNCTION public.update_current_user_profile(TEXT, TEXT, DATE, TEXT, TEXT, TEXT) TO authenticated;
```

### Los cambios no se reflejan en la UI
1. Verifica que la función RPC esté creada
2. Revisa los logs de la app mobile
3. Verifica que `refreshProfile()` se esté llamando
4. Cierra y vuelve a abrir la app

### Los cambios no se guardan en Supabase
1. Verifica que estés autenticado
2. Ejecuta la función manualmente en SQL Editor
3. Revisa los logs de error en la consola
4. Verifica que el campo `updated_at` se esté actualizando

---

**Status**: ✅ Implementado (requiere ejecutar migración actualizada)
**Fecha**: 23 de Febrero, 2026
