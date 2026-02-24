# Implementación de Datos Reales

## Resumen
Se ha eliminado todos los datos mock y se ha implementado un sistema completo de almacenamiento local con AsyncStorage para trabajar con datos reales de prescripciones.

## Cambios Realizados

### 1. PrescriptionService - Gestión de Prescripciones Reales
**Archivo**: `apps/mobile/src/services/PrescriptionService.ts`

- ✅ Eliminados todos los datos MOCK
- ✅ Implementado almacenamiento con AsyncStorage (`@prescriptions_v1`)
- ✅ Agregados campos adicionales:
  - `createdAt`: timestamp de creación
  - `signedAt`: timestamp de firma (opcional)
  - `blockId`: referencia al talonario usado
- ✅ Métodos implementados:
  - `getAll()`: Obtiene todas las prescripciones ordenadas por fecha
  - `search()`: Búsqueda por paciente, número Rx o medicamento
  - `getStats()`: Estadísticas del dashboard
  - `createPrescription()`: Crea nueva prescripción usando el talonario activo
  - `updateStatus()`: Actualiza estado de prescripción
  - `delete()`: Elimina prescripción
  - `hasReceiptAvailable()`: Verifica si hay talonario activo con recetas disponibles

### 2. PrescriptionBlockService - Talonario Activo
**Archivo**: `apps/mobile/src/services/PrescriptionBlockService.ts`

- ✅ Agregado campo `isActive` a la interfaz `PrescriptionBlock`
- ✅ Nuevos métodos:
  - `setActive(id)`: Activa un talonario (solo uno puede estar activo)
  - `getActive()`: Obtiene el talonario activo actual
- ✅ Validaciones:
  - Solo se puede activar talonarios con recetas disponibles
  - Solo un talonario puede estar activo a la vez

### 3. StatsService - Estadísticas Reales
**Archivo**: `apps/mobile/src/services/StatsService.ts`

- ✅ Eliminados datos mock
- ✅ Cálculo dinámico de estadísticas:
  - Prescripciones esta semana vs semana anterior (con % cambio)
  - Prescripciones este mes vs mes anterior (con % cambio)
  - Actividad semanal (últimos 7 días)
  - Comparación mensual (últimos 6 meses)
  - Distribución de medicamentos (top 4)
- ✅ Manejo de datos vacíos (retorna estadísticas en 0)

### 4. SigningService - Historial de Firmas
**Archivo**: `apps/mobile/src/services/SigningService.ts`

- ✅ Eliminados datos mock
- ✅ Implementado almacenamiento con AsyncStorage (`@signing_records_v1`)
- ✅ Nuevos métodos:
  - `saveRecord()`: Guarda registro de firma
  - `getRecentSignings()`: Obtiene historial de firmas
  - `deleteRecord()`: Elimina registro de firma

### 5. UI - Selector de Talonario Activo
**Archivo**: `apps/mobile/src/screens/PrescriptionBlocksScreen.tsx`

- ✅ Agregado icono de selección en cada card de talonario
- ✅ Solo visible si el talonario tiene recetas disponibles
- ✅ Badge verde "Talonario activo" cuando está seleccionado
- ✅ Handler `handleToggleActive()` para activar/desactivar
- ✅ Confirmación al desactivar talonario
- ✅ Inicialización de nuevos bloques con `isActive: false`

## Flujo de Nueva Prescripción

1. Usuario crea nueva prescripción desde la UI
2. `PrescriptionService.createPrescription()` se ejecuta:
   - Busca el talonario activo con recetas disponibles
   - Si no hay talonario activo → Error
   - Llama a `PrescriptionBlockService.markNextUsed()` para obtener el siguiente número de receta
   - Crea la prescripción con el número de receta del talonario
   - Guarda en AsyncStorage
3. Las estadísticas se actualizan automáticamente al leer los datos

## Selector de Talonario Activo

### Comportamiento
- Solo un talonario puede estar activo a la vez
- Solo se pueden activar talonarios con recetas disponibles
- Icono de checkmark (✓) en el header de cada card:
  - Verde sólido = activo
  - Gris outline = inactivo
- Badge verde "Talonario activo" visible cuando está seleccionado

### Restricciones
- Talonarios agotados no muestran el selector
- Al activar un talonario, los demás se desactivan automáticamente
- Se requiere confirmación para desactivar

## Almacenamiento Local

Todas las claves de AsyncStorage:
- `@prescriptions_v1`: Prescripciones
- `@rx_blocks_v1`: Talonarios de recetas
- `@signing_records_v1`: Historial de firmas

## Seguridad

- Todos los datos son locales (AsyncStorage)
- No se comparten datos con servidores externos
- Contraseñas de PDF cifradas con AES-256
- Datos privados del dispositivo

## Próximos Pasos

1. Actualizar pantalla de nueva prescripción para usar `PrescriptionService.createPrescription()`
2. Verificar que las estadísticas se actualicen correctamente
3. Implementar UI para mostrar error si no hay talonario activo
4. Agregar validación en UI para requerir talonario activo antes de crear prescripción

## Testing

Para probar:
1. Importar un talonario de recetas
2. Activarlo usando el icono de checkmark
3. Crear una nueva prescripción
4. Verificar que use el número correcto del talonario
5. Verificar que las estadísticas se actualicen

## Archivos Modificados

- `apps/mobile/src/services/PrescriptionService.ts`
- `apps/mobile/src/services/PrescriptionBlockService.ts`
- `apps/mobile/src/services/StatsService.ts`
- `apps/mobile/src/services/SigningService.ts`
- `apps/mobile/src/screens/PrescriptionBlocksScreen.tsx`
