# Verificación: Click en Filas de Usuario

## Estado Actual

El código para hacer click en las filas de usuarios está correctamente implementado.

### Implementación

#### 1. Componente Table (`apps/dashboard/app/components/ui/Table.tsx`)
```typescript
<tr
  key={rowKey(row)}
  onClick={() => onRowClick?.(row)}
  className={cn(
    "transition-colors hover:bg-surface-50 dark:hover:bg-surface-750",
    onRowClick && "cursor-pointer"
  )}
>
```

El componente Table:
- ✅ Acepta prop `onRowClick`
- ✅ Aplica el evento onClick a cada fila
- ✅ Cambia el cursor a pointer cuando hay onRowClick
- ✅ Aplica hover effect

#### 2. Ruta de Usuarios (`apps/dashboard/app/routes/_dashboard.users.tsx`)

**Imports correctos:**
```typescript
import {
  useActionData,
  useLoaderData,
  useNavigate,  // ✅ Importado
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
```

**Hook usado:**
```typescript
export default function UsersPage() {
  const navigate = useNavigate();  // ✅ Hook llamado
  // ...
}
```

**Prop pasada al Table:**
```typescript
<Table<UserWithUsage>
  columns={columns}
  data={users}
  loading={navigation.state === "loading"}
  emptyMessage="No se encontraron usuarios"
  sortBy={searchParams.get("sort_by") ?? "created_at"}
  sortOrder={(searchParams.get("sort_order") ?? "desc") as "asc" | "desc"}
  onSort={handleSort}
  onRowClick={(row) => navigate(`/users/${row.id}`)}  // ✅ Navegación configurada
  rowKey={(row) => row.id}
/>
```

#### 3. Columna de Acciones

La columna de acciones tiene `stopPropagation` para evitar que el click en el dropdown active la navegación:

```typescript
{
  key: "actions",
  header: "",
  render: (row: UserWithUsage) => (
    <div onClick={(e) => e.stopPropagation()}>  // ✅ Previene propagación
      <DropdownMenu
        trigger={...}
        items={[
          {
            label: "Ver detalle",
            onClick: () => navigate(`/users/${row.id}`),
          },
          // ... más opciones
        ]}
      />
    </div>
  ),
}
```

## Cómo Funciona

1. **Click en cualquier parte de la fila** → Navega a `/users/{id}`
2. **Click en el botón de acciones (3 puntos)** → Abre el dropdown (no navega)
3. **Click en "Ver detalle" del dropdown** → Navega a `/users/{id}`
4. **Hover sobre la fila** → Cambia el fondo y el cursor a pointer

## Verificación

Para verificar que funciona:

1. Abre http://localhost:3003/users (nota: el puerto cambió a 3003)
2. Deberías ver la lista de usuarios
3. Pasa el mouse sobre una fila → El cursor debe cambiar a pointer
4. Haz click en cualquier parte de la fila → Debes navegar a la página de detalle del usuario
5. Haz click en el botón de 3 puntos → Debe abrir el dropdown sin navegar
6. Selecciona "Ver detalle" del dropdown → Debe navegar a la página de detalle

## Posibles Problemas

### 1. El click no funciona
**Causa**: Algún elemento hijo está interceptando el evento
**Solución**: Verificar que todos los elementos interactivos tengan `stopPropagation`

### 2. El cursor no cambia a pointer
**Causa**: El prop `onRowClick` no se está pasando correctamente
**Solución**: Verificar que el prop esté en el componente Table

### 3. La navegación no funciona
**Causa**: `useNavigate` no está funcionando
**Solución**: Verificar que Remix Router esté configurado correctamente

### 4. Error en consola
**Causa**: Puede haber un error de JavaScript
**Solución**: Abrir DevTools y revisar la consola

## Debugging

Si el click no funciona, agrega logs temporales:

```typescript
<Table<UserWithUsage>
  // ...
  onRowClick={(row) => {
    console.log("Row clicked:", row.id);
    navigate(`/users/${row.id}`);
  }}
  // ...
/>
```

Luego abre DevTools (F12) y verifica:
1. Si aparece el log cuando haces click
2. Si hay algún error en la consola
3. Si la navegación se ejecuta

## Alternativa: Usar Link

Si prefieres usar Link en lugar de navigate, puedes cambiar la columna de usuario:

```typescript
{
  key: "user",
  header: "Usuario",
  render: (row: UserWithUsage) => (
    <Link to={`/users/${row.id}`} className="flex items-center gap-3">
      <Avatar src={row.avatar_url} name={row.full_name ?? row.email} size="sm" />
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">
          {row.full_name ?? "—"}
        </p>
        <p className="text-xs text-surface-500">{row.email}</p>
      </div>
    </Link>
  ),
}
```

Y remover el `onRowClick` del Table.

## Estado del Servidor

- **Puerto actual**: http://localhost:3003 (cambió del 3002)
- **Estado**: Running ✅
- **Node version**: 20.19.3 ✅

## Conclusión

El código está correctamente implementado. El click en las filas debería funcionar. Si no funciona:

1. Verifica que estés accediendo al puerto correcto (3003)
2. Abre DevTools y revisa la consola
3. Verifica que haya usuarios en la lista
4. Intenta hacer click en diferentes partes de la fila

---

**Status**: ✅ Implementado correctamente
**Fecha**: 22 de Febrero, 2026
