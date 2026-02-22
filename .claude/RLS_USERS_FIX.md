# Fix: Usuarios No Aparecen en Listados del Dashboard

## Problema Identificado

Los usuarios registrados aparecían en Supabase y en Analytics, pero no en los listados de usuarios del dashboard.

### Causa Raíz

Todas las rutas del dashboard estaban usando el cliente normal de Supabase (`createSupabaseServerClient`) que está sujeto a las políticas de Row Level Security (RLS).

Las políticas RLS de la tabla `profiles` son:
1. **Users can view own profile**: Los usuarios solo pueden ver su propio perfil
2. **Superadmin full access**: Los superadmin pueden ver todo

El problema es que la política "Superadmin full access" verifica si el usuario actual es superadmin consultando la misma tabla `profiles`:

```sql
CREATE POLICY "Superadmin full access"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );
```

Esto crea una consulta recursiva que puede fallar o no ejecutarse correctamente en algunos casos.

## Solución Aplicada

Usar el **Service Role Client** (`createSupabaseServiceClient`) en todas las rutas del dashboard que necesitan acceso completo a los datos. El Service Role Key bypasea RLS completamente.

### Archivos Modificados

#### 1. `apps/dashboard/app/routes/_dashboard.users.tsx`
```typescript
// Loader
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const supabase = createSupabaseServiceClient();

// Action
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const supabase = createSupabaseServiceClient();
```

#### 2. `apps/dashboard/app/routes/_dashboard.users.$id.tsx`
```typescript
// Loader
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const supabase = createSupabaseServiceClient();

// Action
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const supabase = createSupabaseServiceClient();
```

#### 3. `apps/dashboard/app/routes/_dashboard.dashboard.tsx`
```typescript
// Loader (Analytics)
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const supabase = createSupabaseServiceClient();
```

#### 4. `apps/dashboard/app/routes/_dashboard.policies.tsx`
```typescript
// Loader
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const supabase = createSupabaseServiceClient();

// Action
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const supabase = createSupabaseServiceClient();
```

#### 5. `apps/dashboard/app/routes/_dashboard.settings.tsx`
```typescript
// Action
const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
const supabase = createSupabaseServiceClient();
```

## Patrón de Uso

### Antes (Incorrecto)
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  const { supabase } = createSupabaseServerClient(request); // ❌ Sujeto a RLS
  
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "user");
  
  return Response.json({ data }, { headers });
}
```

### Después (Correcto)
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const supabase = createSupabaseServiceClient(); // ✅ Bypasea RLS
  
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "user");
  
  return Response.json({ data }, { headers });
}
```

## Cuándo Usar Cada Cliente

### `createSupabaseServerClient(request)`
- Para operaciones que deben respetar RLS
- Para operaciones del usuario actual (su propio perfil)
- Para autenticación (login, logout, getUser)
- Mantiene las cookies de sesión

### `createSupabaseServiceClient()`
- Para operaciones administrativas que necesitan acceso completo
- Para consultas que deben ignorar RLS
- Para operaciones en nombre de otros usuarios
- Solo debe usarse en el servidor (nunca en el cliente)

## Seguridad

✅ **Seguro**: El Service Role Key solo se usa en el servidor
✅ **Protegido**: `requireSuperAdmin()` verifica que el usuario sea superadmin antes de permitir acceso
✅ **Aislado**: El Service Role Key nunca se expone al cliente
✅ **Controlado**: Solo las rutas del dashboard (protegidas) usan el service client

## Verificación

Para verificar que funciona:

1. Inicia sesión como superadmin
2. Ve a http://localhost:3002/users
3. Deberías ver todos los usuarios registrados
4. Los filtros y búsqueda deberían funcionar
5. Puedes hacer clic en un usuario para ver su detalle

## Otras Tablas Afectadas

Las siguientes tablas también tienen RLS y pueden necesitar el service client:

- `app_usage` - Uso de la app por usuario
- `usage_events` - Eventos de uso
- `legal_documents` - Documentos legales
- `user_legal_acceptances` - Aceptaciones de términos

Todas estas consultas ahora usan el service client en las rutas del dashboard.

## Alternativa: Mejorar las Políticas RLS

Una alternativa sería mejorar las políticas RLS para evitar la recursión:

```sql
-- Crear una función que verifique si el usuario es superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usar la función en las políticas
CREATE POLICY "Superadmin full access"
  ON public.profiles FOR ALL
  USING (is_superadmin());
```

Sin embargo, usar el service client es más simple y directo para un panel de administración.

## Troubleshooting

### Los usuarios aún no aparecen
1. Verifica que las migraciones se hayan ejecutado
2. Verifica que haya usuarios con `role = 'user'` en la tabla profiles
3. Revisa los logs del servidor para errores
4. Verifica que el SUPABASE_SERVICE_ROLE_KEY esté configurado

### Error: "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY"
Verifica que el archivo `.env` tenga:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Los usuarios aparecen pero sin datos de uso
Verifica que:
1. La tabla `app_usage` exista
2. Los usuarios tengan registros en `app_usage`
3. Las relaciones entre tablas estén correctas

---

**Status**: ✅ Arreglado
**Fecha**: 22 de Febrero, 2026
