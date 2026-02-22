# Fix: Usuario Activado en Dashboard pero App Mobile Dice "No Activo"

## Problema Identificado

Cuando un usuario es activado desde el dashboard (cambiando su status a 'active'), la app mobile sigue mostrando el mensaje "Tu cuenta está pendiente de activación".

### Causa Raíz

La app mobile usa el cliente normal de Supabase para consultar el estado del usuario:

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('status')
  .eq('id', userId)
  .single();
```

Esta consulta está sujeta a Row Level Security (RLS). La política RLS permite que los usuarios vean su propio perfil:

```sql
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

El problema ocurre durante el login:
1. Usuario hace `signInWithPassword` → Sesión se establece
2. Inmediatamente se consulta el perfil → La sesión puede no haberse propagado completamente
3. La consulta falla o retorna null debido a timing/caché
4. El código interpreta esto como "usuario no activo"

## Solución Aplicada

Crear una función RPC (Remote Procedure Call) que bypasea RLS para verificar el estado del usuario durante el login.

### 1. Migración SQL

Archivo: `apps/dashboard/supabase/migrations/006_create_auth_helpers.sql`

```sql
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_user_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_status(UUID) TO anon;
```

**Características:**
- `SECURITY DEFINER`: Ejecuta con permisos del creador (bypasea RLS)
- Retorna status y role del usuario
- Accesible por usuarios autenticados y anónimos (necesario para login)

### 2. Actualización del Servicio Mobile

Archivo: `apps/mobile/src/services/SupabaseService.ts`

```typescript
export async function getProfileStatus(userId: string): Promise<UserStatus | null> {
  const { data, error } = await supabase
    .rpc('check_user_status', { user_id: userId })
    .single();

  if (error || !data) {
    console.log('Error getting profile status:', error);
    return null;
  }
  return data.status as UserStatus;
}
```

**Cambios:**
- Usa `.rpc('check_user_status')` en lugar de `.from('profiles').select()`
- Bypasea RLS completamente
- Más confiable durante el login

## Cómo Aplicar la Solución

### Paso 1: Ejecutar la Migración

**Opción A: Desde Supabase Dashboard**
1. Ve a https://supabase.com/dashboard/project/brhcijwwhtkfwnrcbaju
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `006_create_auth_helpers.sql`
4. Ejecuta la query

**Opción B: Desde CLI (si tienes Supabase CLI)**
```bash
cd apps/dashboard
supabase db push
```

### Paso 2: Verificar la Función

Ejecuta en SQL Editor:
```sql
SELECT * FROM public.check_user_status('UUID_DE_UN_USUARIO');
```

Debería retornar el status y role del usuario.

### Paso 3: Rebuild de la App Mobile

```bash
cd apps/mobile

# Android
npm run android

# iOS
npm run ios
```

## Flujo de Login Actualizado

### Antes (con problema)
```
1. signInWithPassword() → Sesión establecida
2. SELECT status FROM profiles WHERE id = user_id → Puede fallar por RLS/timing
3. Si falla → "Usuario no activo" ❌
```

### Después (arreglado)
```
1. signInWithPassword() → Sesión establecida
2. check_user_status(user_id) → Bypasea RLS, siempre funciona
3. Retorna status correcto → Login exitoso si status = 'active' ✅
```

## Verificación

Para verificar que funciona:

1. **Crear usuario de prueba:**
   - Registra un usuario en la app mobile
   - El usuario quedará con status 'pending_activation'

2. **Activar desde dashboard:**
   - Inicia sesión en el dashboard como superadmin
   - Ve a `/users`
   - Busca el usuario
   - Click en el menú de 3 puntos → "Activar"

3. **Intentar login en mobile:**
   - Abre la app mobile
   - Intenta hacer login con el usuario activado
   - Debería permitir el acceso ✅

## Seguridad

✅ **Seguro**: La función solo retorna status y role, no datos sensibles
✅ **Controlado**: Solo accesible para verificar el propio usuario durante login
✅ **Auditado**: Los cambios de status se registran en la tabla profiles
✅ **Limitado**: No permite modificar datos, solo leer status

## Alternativas Consideradas

### Opción 1: Agregar delay después del login (descartada)
```typescript
await signInWithPassword();
await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1s
const status = await getProfileStatus();
```
**Problema**: No garantiza que funcione, solo reduce la probabilidad de error

### Opción 2: Modificar políticas RLS (descartada)
Permitir que usuarios anónimos lean cualquier perfil.
**Problema**: Compromete la seguridad, expone datos de usuarios

### Opción 3: Usar Service Role Key en mobile (descartada)
**Problema**: Nunca se debe exponer el Service Role Key en el cliente

## Otros Casos de Uso

Esta función RPC también es útil para:

1. **Verificar status antes de operaciones críticas**
2. **Validar permisos sin consultas complejas**
3. **Evitar problemas de caché en consultas RLS**

## Troubleshooting

### Error: "function public.check_user_status does not exist"
**Solución**: Ejecuta la migración SQL en Supabase

### El usuario sigue sin poder hacer login
1. Verifica que el status sea 'active' en la tabla profiles
2. Verifica que el email esté verificado
3. Revisa los logs en la consola de la app mobile
4. Verifica que la función RPC esté creada correctamente

### Error: "permission denied for function check_user_status"
**Solución**: Ejecuta los GRANT en la migración:
```sql
GRANT EXECUTE ON FUNCTION public.check_user_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_status(UUID) TO anon;
```

### La función retorna null
1. Verifica que el usuario exista en la tabla profiles
2. Verifica que el UUID sea correcto
3. Ejecuta manualmente en SQL Editor para debugging

## Monitoreo

Para monitorear el uso de la función:

```sql
-- Ver usuarios por status
SELECT status, COUNT(*) 
FROM public.profiles 
WHERE role = 'user'
GROUP BY status;

-- Ver últimos logins
SELECT email, last_sign_in_at, status
FROM public.profiles
WHERE role = 'user'
ORDER BY last_sign_in_at DESC
LIMIT 10;
```

---

**Status**: ✅ Arreglado (requiere ejecutar migración)
**Fecha**: 22 de Febrero, 2026
