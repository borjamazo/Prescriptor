# Nueva Pantalla: Talonarios Activos

## Resumen
Se ha creado una nueva pantalla "Talonarios Activos" que reemplaza "Sign" en el menú de navegación principal. Esta pantalla muestra solo los talonarios con recetas disponibles para selección rápida.

## Cambios Realizados

### 1. Nueva Pantalla: ActiveBlocksScreen
**Archivo**: `apps/mobile/src/screens/ActiveBlocksScreen.tsx`

**Características**:
- Muestra solo talonarios con recetas disponibles (nextIndex < totalRecetas)
- Vista simplificada de solo lectura
- No permite importar nuevos talonarios
- No permite editar el número siguiente de receta
- Permite seleccionar/activar talonario con un toque
- Muestra claramente cuál es el talonario activo

**Información Mostrada por Card**:
- Nombre del archivo
- Fecha de importación
- Rango de recetas (primera → última)
- Barra de progreso (usadas vs total)
- Estadísticas: Usadas, Disponibles, Total
- Siguiente receta a usar
- Badge verde si es el talonario activo
- Hint: "Toca para activar" o "Talonario activo"

**Funcionalidad**:
- Toque en cualquier card activa ese talonario
- Se recarga automáticamente al volver a la pantalla (useFocusEffect)
- Estado vacío si no hay talonarios disponibles

### 2. Navegación Actualizada
**Archivo**: `apps/mobile/src/navigation/AppDrawer.tsx`

**Cambios en el Tab Navigator**:
- ❌ Eliminado: "Sign" (pantalla de firma)
- ✅ Agregado: "Talonarios" (ActiveBlocksScreen)
- ✅ Mantenido: Home, Stats, Settings

**Nuevo Orden del Menú**:
1. Home (🏠)
2. Stats (📊)
3. Talonarios (📄)
4. Settings (⚙️)

## Diferencias con PrescriptionBlocksScreen

| Característica | PrescriptionBlocksScreen | ActiveBlocksScreen |
|----------------|-------------------------|-------------------|
| Ubicación | Settings → Gestión de Recetas | Tab principal |
| Talonarios mostrados | Todos | Solo con recetas disponibles |
| Importar talonarios | ✅ Sí | ❌ No |
| Editar siguiente receta | ✅ Sí | ❌ No |
| Eliminar talonarios | ✅ Sí | ❌ No |
| Ver historial | ✅ Sí | ❌ No |
| Marcar como usada | ✅ Sí | ❌ No |
| Activar talonario | ✅ Sí | ✅ Sí |
| Propósito | Gestión completa | Selección rápida |

## Flujo de Usuario

### Seleccionar Talonario Activo
1. Usuario abre tab "Talonarios"
2. Ve lista de talonarios con recetas disponibles
3. Toca el talonario que quiere usar
4. El talonario se activa (badge verde)
5. Ese talonario se usará para nuevas prescripciones

### Gestión Completa
1. Usuario va a Settings
2. Selecciona "Gestión de Recetas"
3. Accede a PrescriptionBlocksScreen
4. Puede importar, editar, eliminar, ver historial, etc.

## Estilos Visuales

### Card Normal
- Fondo blanco
- Borde gris claro
- Hint: "Toca para activar"

### Card Activa
- Fondo blanco
- Borde verde (2px)
- Badge verde en la parte superior
- Icono de checkmark verde
- Hint: "Talonario activo"

### Estado Vacío
- Icono de documento grande
- Título: "Sin talonarios disponibles"
- Subtítulo: "Todos los talonarios están agotados. Importa un nuevo talonario desde Configuración."

## Beneficios

1. **Acceso Rápido**: Cambiar de talonario sin ir a Settings
2. **Vista Simplificada**: Solo lo necesario para seleccionar
3. **Menos Errores**: No se puede editar accidentalmente
4. **Mejor UX**: Separación clara entre selección y gestión
5. **Más Intuitivo**: Toque directo para activar

## Testing

Para probar:
1. Importar varios talonarios desde Settings
2. Ir al tab "Talonarios"
3. Verificar que solo aparecen talonarios con recetas disponibles
4. Tocar un talonario para activarlo
5. Verificar que aparece el badge verde
6. Crear una prescripción y verificar que usa el talonario activo
7. Agotar un talonario y verificar que desaparece de la lista

## Archivos Modificados/Creados

- `apps/mobile/src/screens/ActiveBlocksScreen.tsx` (nuevo)
- `apps/mobile/src/navigation/AppDrawer.tsx` (modificado)

## Notas

- SignScreen sigue existiendo pero no está en el menú principal
- Se puede acceder a SignScreen desde otras partes si es necesario
- PrescriptionBlocksScreen sigue siendo la pantalla completa de gestión
- ActiveBlocksScreen es solo para selección rápida
