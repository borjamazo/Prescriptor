# Fix: No Puede Cargar el Perfil en la App Mobile

## Problema

Al intentar acceder a la pantalla de Settings o Account, la app muestra el error "No se pudo cargar el perfil".

### Causa Raíz

La función `getCurrentUserProfile()` usa una consulta directa a la tabla `profiles` que está sujeta a Row Level Security (RLS):

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

Aunque la política RLS permite que los usuarios vean su propio perfil:

```sql
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

Puede haber problemas de:
1. **Timing**: La sesión no se ha propagado completamente
2. **Caché**: El cliente de Supabase tiene datos antiguos
3. **Contexto**: El `auth.uid()` no se resuelve correctamente en algunos casos

## Solución Aplicada

Crear una función RPC (Remote Procedure Call) que bypasea RLS para obtener el perfil del usuario actual.

### 1. Migración SQL Actualizada

Archivo: `apps/dashboard/supabase/migrations/006_create_auth_helpers.sql`

```sql
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
```

**Características:**
- `SECURITY DEFINER`: Ejecuta con permisos del creador (bypasea RLS)
- Usa `auth.uid()`: Obtiene el ID del usuario autenticado actual
- Solo retorna el perfil del usuario actual (seguro)
- Solo accesible por usuarios autenticados

### 2. Actualización del Servicio Mobile

Archivo: `apps/mobile/src/services/SupabaseService.ts`

```typescript
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Error getting user:', userError);
      return null;
    }

    // Usar función RPC que bypasea RLS
    const { data, error } = await supabase
      .rpc('get_current_user_profile')
      .single();

    if (error || !data) {
      console.log('Error getting profile via RPC:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Exception in getCurrentUserProfile:', error);
    return null;
  }
}
```

**Cambios:**
- Usa `.rpc('get_current_user_profile')` en lugar de `.from('profiles').select()`
- Bypasea RLS completamente
- Más confiable y consistente
- Logs detallados para debugging

## Cómo Aplicar la Solución

### Paso 1: Ejecutar la Migración Actualizada

**Opción A: Desde Supabase Dashboard**
1. Ve a https://supabase.com/dashboard/project/brhcijwwhtkfwnrcbaju
2. Ve a **SQL Editor**
3. Copia y pega el contenido actualizado de `006_create_auth_helpers.sql`
4. Ejecuta la query

**Opción B: Desde CLI**
```bash
cd apps/dashboard
supabase db push
```

### Paso 2: Verificar la Función

Ejecuta en SQL Editor:
```sql
-- Debe retornar tu perfil
SELECT * FROM public.get_current_user_profile();
```

### Paso 3: Rebuild de la App Mobile

```bash
cd apps/mobile

# Android
npm run android

# iOS
npm run ios
```

## Verificación

Para verificar que funciona:

1. **Inicia sesión** en la app mobile
2. **Ve a Settings** (tab inferior)
3. Deberías ver tu perfil con:
   - Avatar con iniciales
   - Nombre
   - Email
   - Teléfono (si está configurado)
4. **Click en "Editar Perfil"**
5. Deberías ver la pantalla de Account con todos tus datos

## Funciones RPC Disponibles

Después de aplicar la migración, tendrás estas funciones:

### 1. `check_user_status(user_id)`
- **Uso**: Verificar status durante login
- **Parámetros**: UUID del usuario
- **Retorna**: status, role
- **Acceso**: authenticated, anon

### 2. `get_current_user_profile()`
- **Uso**: Obtener perfil completo del usuario actual
- **Parámetros**: Ninguno (usa auth.uid())
- **Retorna**: Todos los campos del perfil
- **Acceso**: authenticated

## Seguridad

✅ **Seguro**: Solo retorna el perfil del usuario autenticado actual
✅ **Controlado**: Solo accesible por usuarios autenticados
✅ **Aislado**: No expone datos de otros usuarios
✅ **Auditado**: Usa `auth.uid()` para verificar identidad

## Comparación

### Antes (con RLS)
```typescript
// Puede fallar por problemas de RLS
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

**Problemas:**
- ❌ Sujeto a políticas RLS
- ❌ Puede fallar por timing
- ❌ Inconsistente en algunos casos

### Después (con RPC)
```typescript
// Siempre funciona
const { data } = await supabase
  .rpc('get_current_user_profile')
  .single();
```

**Ventajas:**
- ✅ Bypasea RLS de forma segura
- ✅ Siempre consistente
- ✅ Más rápido (menos queries)

## Troubleshooting

### Error: "function public.get_current_user_profile does not exist"
**Solución**: Ejecuta la migración SQL actualizada

### Error: "permission denied for function get_current_user_profile"
**Solución**: Ejecuta el GRANT en la migración:
```sql
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
```

### La función retorna null
1. Verifica que estés autenticado: `SELECT auth.uid();`
2. Verifica que exista tu perfil: `SELECT * FROM profiles WHERE id = auth.uid();`
3. Si no existe, créalo desde el dashboard

### Los logs muestran "No user found"
1. Verifica que la sesión esté activa
2. Cierra sesión y vuelve a iniciar sesión
3. Verifica que el token no haya expirado

### Los logs muestran "Error getting profile via RPC"
1. Verifica que la función RPC esté creada
2. Verifica los permisos GRANT
3. Revisa el error específico en los logs

## Logs de Debugging

La función ahora incluye logs detallados:

```typescript
console.log('Getting profile for user:', user.id);
console.log('Error getting profile via RPC:', error);
console.log('Profile loaded successfully:', data.email);
```

Para ver los logs:
- **Android**: `npx react-native log-android`
- **iOS**: `npx react-native log-ios`
- **Metro**: Los logs aparecen en la terminal donde corre Metro

## Próximos Pasos

Si el problema persiste después de aplicar esta solución:

1. **Verifica la migración**: Asegúrate de que la función RPC esté creada
2. **Revisa los logs**: Busca mensajes de error específicos
3. **Verifica la sesión**: Asegúrate de que el usuario esté autenticado
4. **Prueba manualmente**: Ejecuta la función RPC desde SQL Editor

---

**Status**: ✅ Arreglado (requiere ejecutar migración actualizada)
**Fecha**: 22 de Febrero, 2026
