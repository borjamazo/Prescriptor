# Prescriptor Admin Dashboard

Panel de administración para la gestión de usuarios de la app móvil Prescriptor.

## Stack

- **Framework**: [Remix](https://remix.run/) v2 + Vite
- **Base de datos**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) v3
- **Gráficas**: [Recharts](https://recharts.org/)
- **Editor de texto**: [Tiptap](https://tiptap.dev/)
- **Validación**: [Zod](https://zod.dev/)
- **Fechas**: [date-fns](https://date-fns.org/)
- **Notificaciones**: [Sonner](https://sonner.emilkowal.ski/)

---

## Setup local

### 1. Instalar dependencias

```bash
# Desde la raíz del monorepo
npm install
```

### 2. Variables de entorno

```bash
cp apps/dashboard/.env.example apps/dashboard/.env
```

Rellena las variables:

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (para operaciones admin) |
| `SESSION_SECRET` | String aleatorio largo para firmar sesiones |

### 3. Base de datos

Ejecuta las migraciones en orden en el editor SQL de Supabase:

```bash
supabase/migrations/001_create_enums_and_profiles.sql
supabase/migrations/002_create_usage_tables.sql
supabase/migrations/003_create_legal_tables.sql
supabase/migrations/004_create_triggers_and_functions.sql
supabase/migrations/005_create_indexes.sql
```

Luego ejecuta el seed para crear el superadmin y documentos legales iniciales:

```bash
supabase/seed.sql
```

> **Importante**: Antes de ejecutar el seed, crea el usuario superadmin desde el Dashboard de Supabase → Authentication → Users (email: `admin@prescriptor.app`). Copia el UUID y úsalo en el seed si es necesario.

### 4. Iniciar en desarrollo

```bash
# Desde la raíz del monorepo
npm run dev

# O solo el dashboard
cd apps/dashboard && npm run dev
```

El dashboard estará disponible en [http://localhost:3002](http://localhost:3002).

---

## Configuración de Supabase

### Auth providers (para la app móvil)

Configura los proveedores en **Supabase Dashboard → Authentication → Providers**:

#### Google OAuth
1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Activa la API de Google+ / Google People
3. Crea credenciales OAuth 2.0 (tipo: Web application)
4. URI de redirección: `https://<tu-proyecto>.supabase.co/auth/v1/callback`
5. Copia Client ID y Client Secret a Supabase

#### Facebook OAuth
1. Crea una app en [Facebook Developers](https://developers.facebook.com/)
2. Añade el producto "Facebook Login"
3. URI de redirección válida: `https://<tu-proyecto>.supabase.co/auth/v1/callback`
4. Copia App ID y App Secret a Supabase

#### LinkedIn OAuth
1. Crea una app en [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Añade el producto "Sign In with LinkedIn using OpenID Connect"
3. URI de redirección autorizada: `https://<tu-proyecto>.supabase.co/auth/v1/callback`
4. Usa el provider `linkedin_oidc` en Supabase

### Plantillas de email

Personaliza en **Supabase Dashboard → Authentication → Email Templates**:

- **Confirm signup**: Email de verificación
- **Invite user**: No usado directamente
- Añade plantillas HTML en cada template para branding personalizado

---

## Arquitectura

```
apps/dashboard/
├── app/
│   ├── components/
│   │   ├── charts/        # LineChart, BarChart, DonutChart, HorizontalBarChart
│   │   ├── forms/         # RichTextEditor
│   │   ├── layout/        # Sidebar, Header, PageWrapper
│   │   └── ui/            # Button, Badge, Table, Modal, Avatar, etc.
│   ├── lib/
│   │   ├── auth.server.ts        # requireSuperAdmin, requireGuest
│   │   ├── supabase.server.ts    # Cliente SSR de Supabase
│   │   ├── supabase.client.ts    # Cliente browser
│   │   └── utils.ts             # Formateo, helpers
│   ├── routes/
│   │   ├── _auth.login.tsx            # /login
│   │   ├── logout.tsx                 # POST /logout
│   │   ├── _dashboard.tsx             # Layout con sidebar
│   │   ├── _dashboard.index.tsx       # / (analytics)
│   │   ├── _dashboard.users.tsx       # /users
│   │   ├── _dashboard.users.$id.tsx   # /users/:id
│   │   ├── _dashboard.policies.tsx    # /policies
│   │   └── _dashboard.settings.tsx   # /settings
│   ├── types/
│   │   └── index.ts       # Todos los tipos TypeScript
│   ├── root.tsx
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   └── tailwind.css
└── supabase/
    ├── migrations/        # SQL migrations numeradas
    └── seed.sql           # Superadmin + datos iniciales
```

### Patrón de autenticación

Cada ruta del dashboard usa `requireSuperAdmin(request)` en el loader:

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  // ... fetch data
  return Response.json({ data }, { headers });
}
```

Si no hay sesión o el usuario no es superadmin → redirect automático a `/login`.

### Flujo de activación de usuarios

```
Registro (app móvil)
  → status: pending_email
  → Supabase envía email de verificación
  → Usuario verifica email
  → trigger SQL: status = pending_activation
  → Superadmin ve usuario en lista
  → Superadmin activa → RPC activate_user()
  → status: active
  → Usuario puede usar la app
```

---

## Añadir nuevas funcionalidades

### Nueva ruta del dashboard

1. Crea `app/routes/_dashboard.nueva-seccion.tsx`
2. Añade `requireSuperAdmin` en el loader
3. Añade el NavLink en `app/components/layout/Sidebar.tsx`

### Nueva tabla en la BD

1. Crea `supabase/migrations/00N_nueva_tabla.sql`
2. Activa RLS y crea policies para `superadmin` y `user`
3. Añade el tipo en `app/types/index.ts`
4. Usa el cliente de Supabase en los loaders/actions

### Nuevo componente UI

Crea en `app/components/ui/` siguiendo el patrón:

```typescript
import { cn } from "~/lib/utils";

interface MiComponenteProps {
  className?: string;
  // ... props
}

export function MiComponente({ className, ...props }: MiComponenteProps) {
  return (
    <div className={cn("base-classes", className)}>
      {/* ... */}
    </div>
  );
}
```

---

## Despliegue

### Fly.io (recomendado)

```bash
fly launch --name prescriptor-dashboard
fly secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... SESSION_SECRET=...
fly deploy
```

### Variables de entorno en producción

Asegúrate de configurar las mismas variables que en `.env.example` en tu plataforma de despliegue.

---

## Seguridad

- **RLS activo** en todas las tablas de Supabase
- **Solo un superadmin** permitido (enforced a nivel de BD con UNIQUE INDEX)
- **Verificación de rol** en cada loader y action
- **Sanitización de HTML** del editor (Tiptap genera HTML seguro; considera `DOMPurify` en producción si procesas HTML externo)
- **CSRF protection** gestionado nativamente por Remix
- **Service Role Key** nunca expuesta al cliente (solo en server)
