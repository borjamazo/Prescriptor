# Fix: Navegación a Detalle de Usuario No Cambia la Vista

## Problema Identificado

Al hacer click en una fila de usuario, la URL cambiaba a `/users/{uuid}` pero la vista seguía mostrando el listado de usuarios en lugar del detalle.

### Causa Raíz

En Remix, cuando tienes rutas con el mismo prefijo, la estructura de archivos determina la jerarquía:

**Estructura anterior (incorrecta):**
```
_dashboard.users.tsx          → /users (sin <Outlet />)
_dashboard.users.$id.tsx      → /users/:id (ruta hija)
```

El problema es que `_dashboard.users.tsx` no tenía un `<Outlet />`, por lo que cuando Remix intentaba renderizar la ruta hija (`/users/:id`), no había dónde mostrarla. La ruta padre seguía renderizándose sin dar paso a la ruta hija.

## Solución Aplicada

Reestructurar las rutas siguiendo la convención de Remix para rutas anidadas:

**Estructura nueva (correcta):**
```
_dashboard.users.tsx          → Layout con <Outlet />
_dashboard.users._index.tsx   → /users (listado)
_dashboard.users.$id.tsx      → /users/:id (detalle)
```

### Archivos Modificados

#### 1. Renombrado: `_dashboard.users.tsx` → `_dashboard.users._index.tsx`
El listado de usuarios ahora es una ruta index dentro del layout de usuarios.

#### 2. Creado: `_dashboard.users.tsx` (nuevo layout)
```typescript
import { Outlet } from "@remix-run/react";

export default function UsersLayout() {
  return <Outlet />;
}
```

Este layout simple renderiza las rutas hijas a través del `<Outlet />`.

## Cómo Funciona Ahora

### Jerarquía de Rutas

```
_dashboard.tsx (Layout principal con Sidebar)
  └─ <Outlet />
      ├─ _dashboard.dashboard.tsx → /dashboard
      ├─ _dashboard.users.tsx (Layout de usuarios)
      │   └─ <Outlet />
      │       ├─ _dashboard.users._index.tsx → /users
      │       └─ _dashboard.users.$id.tsx → /users/:id
      ├─ _dashboard.policies.tsx → /policies
      └─ _dashboard.settings.tsx → /settings
```

### Flujo de Navegación

1. Usuario hace click en una fila del listado
2. `navigate(\`/users/${row.id}\`)` se ejecuta
3. Remix matchea la ruta `/users/:id` con `_dashboard.users.$id.tsx`
4. Remix renderiza:
   - `_dashboard.tsx` (layout principal)
   - `_dashboard.users.tsx` (layout de usuarios)
   - `_dashboard.users.$id.tsx` (detalle del usuario)
5. El `<Outlet />` en `_dashboard.users.tsx` renderiza el detalle
6. La vista cambia del listado al detalle ✅

## Convenciones de Remix

### Rutas Index
- `_dashboard.users._index.tsx` → Se renderiza en `/users` (sin segmento adicional)
- El `._index` indica que es la ruta por defecto del layout

### Rutas Dinámicas
- `_dashboard.users.$id.tsx` → Se renderiza en `/users/:id`
- El `$id` es un parámetro dinámico accesible con `params.id`

### Layouts
- `_dashboard.users.tsx` → Layout que envuelve todas las rutas `/users/*`
- Debe tener `<Outlet />` para renderizar rutas hijas

## Verificación

Para verificar que funciona:

1. Abre http://localhost:3003/users
2. Deberías ver el listado de usuarios
3. Haz click en cualquier fila
4. La URL debe cambiar a `/users/{uuid}`
5. La vista debe cambiar al detalle del usuario ✅
6. Usa el botón "Atrás" del navegador
7. Debes volver al listado ✅

## Alternativas Consideradas

### Opción 1: Usar rutas planas (descartada)
```
_dashboard.users-list.tsx → /users
_dashboard.users-detail.$id.tsx → /users/:id
```
**Problema**: URLs no semánticas y más difíciles de mantener

### Opción 2: Agregar <Outlet /> al listado (descartada)
```typescript
// En _dashboard.users.tsx
export default function UsersPage() {
  // ... código del listado
  return (
    <>
      {/* Listado */}
      <Outlet /> {/* Para rutas hijas */}
    </>
  );
}
```
**Problema**: El listado y el detalle se mostrarían al mismo tiempo

### Opción 3: Usar Modal para el detalle (descartada)
Mostrar el detalle en un modal en lugar de una página completa.
**Problema**: No es la UX deseada para un panel de administración

## Otras Rutas Similares

Si tienes otras rutas con el mismo patrón, aplica la misma solución:

### Ejemplo: Políticas
Si quieres tener `/policies` (listado) y `/policies/:id` (detalle):

```
_dashboard.policies.tsx          → Layout con <Outlet />
_dashboard.policies._index.tsx   → /policies (listado)
_dashboard.policies.$id.tsx      → /policies/:id (detalle)
```

### Ejemplo: Settings con tabs
Si quieres tener `/settings` con tabs como `/settings/profile`, `/settings/security`:

```
_dashboard.settings.tsx          → Layout con tabs y <Outlet />
_dashboard.settings._index.tsx   → /settings (redirect a profile)
_dashboard.settings.profile.tsx  → /settings/profile
_dashboard.settings.security.tsx → /settings/security
```

## Recursos

- [Remix Routing Guide](https://remix.run/docs/en/main/file-conventions/routes)
- [Nested Routes](https://remix.run/docs/en/main/guides/routing#nested-routes)
- [Index Routes](https://remix.run/docs/en/main/guides/routing#index-routes)

## Troubleshooting

### La vista sigue sin cambiar
1. Verifica que el servidor se haya reiniciado
2. Limpia la caché del navegador (Ctrl+Shift+R)
3. Verifica que el archivo `_dashboard.users.tsx` tenga `<Outlet />`

### Error: "No route matches URL"
1. Verifica que los nombres de archivo sean correctos
2. Verifica que no haya espacios o caracteres especiales
3. Reinicia el servidor de desarrollo

### El listado no aparece en /users
1. Verifica que `_dashboard.users._index.tsx` exista
2. Verifica que exporte un componente por defecto
3. Verifica que tenga un loader si es necesario

---

**Status**: ✅ Arreglado
**Fecha**: 22 de Febrero, 2026
