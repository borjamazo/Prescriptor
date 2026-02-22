# Estado de la App Dashboard (Remix)

## ✅ Estado Actual: FUNCIONANDO

La aplicación dashboard está funcionando correctamente en http://localhost:3002

## Routing

### Ruta Raíz (/)
La ruta raíz (`/`) ahora redirige automáticamente:
- **Sin autenticación** → `/login`
- **Autenticado como superadmin** → `/dashboard`
- **Autenticado pero no superadmin** → Cierra sesión y redirige a `/login`

## Configuración

### Puerto
- **Dashboard**: http://localhost:3002
- **Web**: http://localhost:3000
- **Docs**: http://localhost:3001

### Node Version
- Usando Node 20.19.3 automáticamente vía nvm

### Variables de Entorno
Configuradas en `apps/dashboard/.env`:
```env
SUPABASE_URL=https://brhcijwwhtkfwnrcbaju.supabase.co
SUPABASE_ANON_KEY=sb_publishable_HGeS_5ZOyp0rJHXzxrEQxw_mszsIctD
SESSION_SECRET=your-super-secret-session-key-change-in-production
NODE_ENV=development
```

## Rutas Disponibles

### Públicas
- `/` - Redirige automáticamente a `/login` o `/dashboard` según autenticación ✅
- `/login` - Página de inicio de sesión ✅

### Protegidas (requieren autenticación como superadmin)
- `/dashboard` - Dashboard principal (Analytics) ✅
- `/users` - Gestión de usuarios
- `/users/:id` - Detalle de usuario
- `/policies` - Políticas
- `/settings` - Configuración
- `/logout` - Cerrar sesión

## Autenticación

La app usa Supabase para autenticación y requiere:

1. **Usuario autenticado** en Supabase
2. **Role = "superadmin"** en la tabla `profiles`

### Flujo de Autenticación
1. Usuario no autenticado → Redirige a `/login`
2. Usuario autenticado pero no superadmin → Cierra sesión y redirige a `/login`
3. Usuario autenticado como superadmin → Acceso completo al dashboard

## Sobre el Error de DevTools

El error que ves en la consola:
```
Error: No route matches URL "/.well-known/appspecific/com.chrome.devtools.json"
```

**Es completamente normal y no afecta la funcionalidad**. Chrome DevTools intenta conectarse a esta ruta para funcionalidades de debugging. Remix simplemente reporta que no existe esa ruta.

## Cómo Usar la App

### 1. Iniciar el servidor
```bash
cd apps/dashboard
npm run dev
```

El servidor se levantará en http://localhost:3002

### 2. Acceder a la app
Abre tu navegador en http://localhost:3002

Serás redirigido automáticamente a http://localhost:3002/login si no estás autenticado.

### 3. Iniciar sesión
Necesitas credenciales de un usuario con role "superadmin" en Supabase.

Si no tienes un usuario superadmin, necesitas crearlo en Supabase:

```sql
-- 1. Crear usuario en Supabase Auth (desde el dashboard de Supabase)
-- 2. Actualizar el role en la tabla profiles
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'tu-email@ejemplo.com';
```

### 4. Navegar por el dashboard
Una vez autenticado, tendrás acceso a:
- Analytics con gráficos y estadísticas
- Gestión de usuarios
- Políticas
- Configuración

## Estructura de la App

```
apps/dashboard/
├── app/
│   ├── components/       # Componentes reutilizables
│   │   ├── charts/      # Gráficos (Recharts)
│   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   └── ui/          # UI components (Button, Input, etc)
│   ├── lib/             # Utilidades
│   │   ├── auth.server.ts    # Lógica de autenticación
│   │   ├── supabase.server.ts # Cliente de Supabase
│   │   └── utils.ts          # Utilidades generales
│   ├── routes/          # Rutas de Remix
│   │   ├── _auth.login.tsx        # Login
│   │   ├── _dashboard.tsx         # Layout del dashboard
│   │   ├── _dashboard.index.tsx   # Analytics (home)
│   │   ├── _dashboard.users.tsx   # Lista de usuarios
│   │   ├── _dashboard.users.$id.tsx # Detalle de usuario
│   │   ├── _dashboard.policies.tsx  # Políticas
│   │   ├── _dashboard.settings.tsx  # Configuración
│   │   └── logout.tsx             # Logout
│   ├── types/           # TypeScript types
│   ├── root.tsx         # Root layout
│   └── tailwind.css     # Estilos
├── public/              # Assets estáticos
├── supabase/            # Migraciones y seeds de Supabase
├── .env                 # Variables de entorno
├── package.json
├── vite.config.ts       # Configuración de Vite
└── tailwind.config.ts   # Configuración de Tailwind
```

## Tecnologías Usadas

- **Framework**: Remix 2.16.0
- **Build Tool**: Vite 6.2.2
- **Styling**: Tailwind CSS 3.4.17
- **Database/Auth**: Supabase
- **Charts**: Recharts 2.15.3
- **Rich Text Editor**: Tiptap 2.11.7
- **Notifications**: Sonner 2.0.3
- **Validation**: Zod 3.24.2
- **Date Handling**: date-fns 4.1.0

## Features Implementadas

### Analytics Dashboard
- KPI cards (Total usuarios, Activos, Pendientes, Nuevos)
- Gráfico de línea: Nuevos registros por día
- Gráfico de barras: Usos de la app por día
- Gráfico de dona: Distribución por proveedor de auth
- Gráfico de barras horizontal: Top 10 usuarios
- Tabla de últimas actividades
- Filtro de rango de fechas

### Gestión de Usuarios
- Lista de usuarios con búsqueda y filtros
- Detalle de usuario individual
- Edición de perfiles
- Gestión de roles

### UI/UX
- Dark mode support
- Responsive design
- Sidebar navigation
- Toast notifications
- Loading states
- Error boundaries

## Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo (puerto 3002)

# Producción
npm run build        # Construye la app para producción
npm start            # Inicia servidor de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
npm run typecheck    # Verifica tipos de TypeScript
```

## Troubleshooting

### La app no carga
1. Verifica que el servidor esté corriendo: `npm run dev`
2. Verifica que estés usando Node 20.19.3: `node --version`
3. Verifica que las variables de entorno estén configuradas en `.env`

### No puedo iniciar sesión
1. Verifica que Supabase esté accesible
2. Verifica que el usuario exista en Supabase Auth
3. Verifica que el usuario tenga role "superadmin" en la tabla profiles
4. Verifica las credenciales (email y contraseña)

### Error de CORS
Si ves errores de CORS, verifica la configuración de Supabase:
- URL del sitio debe incluir http://localhost:3002
- Configuración de CORS en Supabase debe permitir localhost

### Errores de TypeScript
```bash
npm run typecheck
```

### Limpiar caché
```bash
rm -rf node_modules/.vite
npm run dev
```

## Próximos Pasos

Para usar la app completamente:

1. **Crear usuario superadmin** en Supabase
2. **Configurar la base de datos** con las migraciones en `supabase/migrations/`
3. **Poblar datos de prueba** con `supabase/seed.sql`
4. **Iniciar sesión** y explorar el dashboard

## Notas de Desarrollo

- La app usa Remix v2 con las nuevas features v3 habilitadas
- Vite es el build tool (más rápido que Webpack)
- Single Fetch está habilitado para mejor performance
- Lazy Route Discovery está habilitado
- TypeScript strict mode está activado

---

**Status**: ✅ Funcionando correctamente
**URL**: http://localhost:3002
**Fecha**: 22 de Febrero, 2026
