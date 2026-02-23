# Implementación: Sincronización de Perfil con Backend

## Cambios Realizados

Se ha implementado la sincronización completa del perfil del usuario entre la app mobile y el backend de Supabase.

### 1. Actualización de `SupabaseService.ts`

**Tipos agregados:**
```typescript
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  status: UserStatus;
  auth_provider: AuthProvider;
  created_at: string;
  last_sign_in_at: string | null;
}
```

**Funciones agregadas:**
- `getCurrentUserProfile()`: Obtiene el perfil completo del usuario actual
- `updateUserProfile(updates)`: Actualiza el perfil del usuario

### 2. Actualización de `ProfileService.ts`

**Antes (datos mock):**
```typescript
const mockProfile: DoctorProfile = {
  name: 'Dr. David Smith',
  specialty: 'Internal Medicine',
  // ... datos hardcodeados
};
```

**Después (datos reales):**
```typescript
export const ProfileService = {
  getProfile: async (): Promise<DoctorProfile | null> => {
    const profile = await getCurrentUserProfile();
    if (!profile) return null;
    return mapProfileToDoctor(profile);
  },
  
  updateProfile: async (updates: Partial<UserProfile>): Promise<void> => {
    await updateUserProfile(updates);
  },
};
```

**Función de mapeo:**
- Convierte `UserProfile` (backend) a `DoctorProfile` (UI)
- Genera iniciales automáticamente desde el nombre
- Maneja valores null con defaults apropiados

### 3. Actualización de `AuthContext.tsx`

**Estado agregado:**
```typescript
const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
```

**Funciones actualizadas:**
- `loginWithCredentials`: Carga el perfil después del login
- `loginWithBiometrics`: Carga el perfil después del login
- `logout`: Limpia el perfil al cerrar sesión
- `refreshProfile`: Nueva función para recargar el perfil

**Contexto actualizado:**
```typescript
interface AuthContextType {
  // ... otros campos
  userProfile: UserProfile | null;
  refreshProfile: () => Promise<void>;
}
```

### 4. Nueva Pantalla `AccountScreen.tsx`

**Características:**
- ✅ Muestra datos reales del perfil desde Supabase
- ✅ Avatar con iniciales generadas automáticamente
- ✅ Modo de edición inline
- ✅ Validación y guardado de cambios
- ✅ Estados de carga y error
- ✅ Diseño responsive y moderno

**Campos editables:**
- Nombre completo
- Teléfono
- País
- Ciudad
- Fecha de nacimiento

**Campos de solo lectura:**
- Email (no se puede cambiar)
- Miembro desde
- Último acceso

## Flujo de Datos

### Login
```
1. Usuario hace login
2. loginWithEmail() → Autentica en Supabase
3. loadProfile() → Obtiene perfil desde backend
4. setUserProfile() → Guarda en contexto
5. UI se actualiza con datos reales
```

### Edición de Perfil
```
1. Usuario abre AccountScreen
2. ProfileService.getProfile() → Obtiene datos actuales
3. Usuario hace click en "Editar perfil"
4. Usuario modifica campos
5. Usuario hace click en "Guardar"
6. updateUserProfile() → Actualiza en Supabase
7. loadProfile() → Recarga datos actualizados
8. UI se actualiza con nuevos datos
```

### Sincronización
```
AuthContext (global)
    ↓
userProfile state
    ↓
Disponible en toda la app via useAuth()
    ↓
AccountScreen, HomeScreen, etc.
```

## Uso en Otros Componentes

Para acceder al perfil en cualquier componente:

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { userProfile, refreshProfile } = useAuth();
  
  if (!userProfile) {
    return <Text>Cargando perfil...</Text>;
  }
  
  return (
    <View>
      <Text>Hola, {userProfile.full_name || userProfile.email}</Text>
      <Button title="Actualizar" onPress={refreshProfile} />
    </View>
  );
};
```

## Campos del Perfil

### Tabla `profiles` en Supabase
```sql
- id: UUID (PK)
- email: TEXT (NOT NULL)
- full_name: TEXT
- avatar_url: TEXT
- phone: TEXT
- date_of_birth: DATE
- country: TEXT
- city: TEXT
- role: user_role (enum)
- status: user_status (enum)
- auth_provider: auth_provider (enum)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- last_sign_in_at: TIMESTAMPTZ
- email_verified_at: TIMESTAMPTZ
- activated_at: TIMESTAMPTZ
- activated_by: UUID (FK)
- accepted_terms_at: TIMESTAMPTZ
- accepted_terms_version: TEXT
- accepted_privacy_at: TIMESTAMPTZ
- accepted_privacy_version: TEXT
```

### Campos Mapeados en la App
```typescript
interface DoctorProfile {
  id: string;
  name: string;              // full_name || email
  initials: string;          // Generado desde name
  email: string;
  phone: string;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  date_of_birth: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}
```

## Políticas RLS

El perfil está protegido por Row Level Security:

```sql
-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

Esto significa que:
- ✅ Los usuarios solo pueden ver/editar su propio perfil
- ✅ No pueden ver perfiles de otros usuarios
- ✅ No pueden cambiar su email, role o status

## Validaciones

### Frontend (App Mobile)
- Campos requeridos: Ninguno (todos opcionales excepto email)
- Formato de fecha: YYYY-MM-DD
- Teléfono: Formato libre (ej: +34 600 000 000)

### Backend (Supabase)
- Email: Único, formato válido
- Status: Enum válido
- Role: Enum válido
- Fechas: Formato ISO 8601

## Mejoras Futuras

### 1. Upload de Avatar
```typescript
// Agregar función para subir imagen
export async function uploadAvatar(uri: string): Promise<string> {
  // Implementar upload a Supabase Storage
  // Retornar URL pública
}
```

### 2. Validación de Campos
```typescript
// Agregar validación con Zod
const profileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[0-9\s-]+$/).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
```

### 3. Caché Local
```typescript
// Guardar perfil en AsyncStorage para acceso offline
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_CACHE_KEY = '@user_profile';

export async function cacheProfile(profile: UserProfile) {
  await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

export async function getCachedProfile(): Promise<UserProfile | null> {
  const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
}
```

### 4. Sincronización en Tiempo Real
```typescript
// Escuchar cambios en el perfil
supabase
  .channel('profile-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'profiles',
    filter: `id=eq.${userId}`,
  }, (payload) => {
    setUserProfile(payload.new as UserProfile);
  })
  .subscribe();
```

## Testing

### Verificar Sincronización
1. Registra un usuario en la app mobile
2. Activa el usuario desde el dashboard
3. Haz login en la app mobile
4. Ve a la pantalla de Account
5. Verifica que se muestren los datos correctos

### Verificar Edición
1. En AccountScreen, haz click en "Editar perfil"
2. Modifica el nombre, teléfono, país, ciudad
3. Haz click en "Guardar"
4. Verifica que se muestre un mensaje de éxito
5. Recarga la app
6. Verifica que los cambios persistan

### Verificar desde Dashboard
1. Edita el perfil desde la app mobile
2. Ve al dashboard web
3. Busca el usuario en `/users`
4. Verifica que los cambios se reflejen
5. Edita el perfil desde el dashboard
6. Vuelve a la app mobile
7. Recarga el perfil (pull to refresh o reabrir app)
8. Verifica que los cambios se reflejen

## Troubleshooting

### El perfil no se carga
1. Verifica que el usuario esté autenticado
2. Verifica que exista un registro en la tabla `profiles`
3. Revisa los logs en la consola de la app
4. Verifica las políticas RLS en Supabase

### Los cambios no se guardan
1. Verifica que el usuario tenga permisos de UPDATE
2. Verifica que los campos sean válidos
3. Revisa los logs de error en la app
4. Verifica la conexión a internet

### El perfil muestra datos antiguos
1. Llama a `refreshProfile()` para forzar recarga
2. Verifica que no haya caché en el navegador
3. Cierra sesión y vuelve a iniciar sesión

---

**Status**: ✅ Implementado
**Fecha**: 22 de Febrero, 2026
