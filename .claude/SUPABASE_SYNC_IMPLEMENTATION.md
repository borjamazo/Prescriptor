# Sincronización con Supabase - Prescripciones

## Resumen
Se ha implementado la sincronización de datos de prescripciones entre la app móvil y Supabase para tracking y estadísticas en el dashboard.

## Datos Sincronizados

### 1. Talonarios de Recetas (prescription_blocks)
- `block_serial`: Número de la primera receta (ej: "29-8448968")
- `total_prescriptions`: Total de recetas en el talonario
- `imported_at`: Fecha de importación
- `user_id`: ID del usuario

### 2. Recetas Emitidas (issued_prescriptions)
- `prescription_number`: Número completo de la receta (ej: "29-8448969")
- `block_id`: Referencia al talonario (opcional)
- `issued_at`: Fecha de emisión
- `user_id`: ID del usuario

### 3. Recetas Firmadas (signed_prescriptions)
- `prescription_number`: Número completo de la receta
- `issued_prescription_id`: Referencia a la receta emitida (opcional)
- `signed_at`: Fecha de firma
- `user_id`: ID del usuario

## Archivos Creados/Modificados

### Base de Datos

#### Nueva Migración
**Archivo**: `apps/dashboard/supabase/migrations/007_create_prescription_tracking.sql`

- Crea 3 tablas: `prescription_blocks`, `issued_prescriptions`, `signed_prescriptions`
- Políticas RLS para seguridad por usuario
- Índices para performance
- Función `get_user_prescription_stats()` para obtener estadísticas agregadas
- Trigger para actualizar `updated_at`

### App Móvil

#### Nuevo Servicio de Sincronización
**Archivo**: `apps/mobile/src/services/SupabaseSyncService.ts`

Métodos:
- `syncPrescriptionBlock()`: Sincroniza importación de talonario
- `syncIssuedPrescription()`: Sincroniza emisión de receta
- `syncSignedPrescription()`: Sincroniza firma de receta
- `getUserStats()`: Obtiene estadísticas del usuario desde Supabase

#### Servicios Actualizados

**PrescriptionService.ts**:
- Agregado campo `supabaseIssuedId` a la interfaz `Prescription`
- `createPrescription()`: Sincroniza con Supabase al crear
- `updateStatus()`: Sincroniza con Supabase al firmar

**PrescriptionBlockService.ts**:
- `add()`: Sincroniza con Supabase al importar talonario

**StatsService.ts**:
- `getStats()`: Obtiene estadísticas de Supabase para contexto adicional

#### Archivo de Configuración
**Archivo**: `apps/mobile/src/lib/supabase.ts`
- Re-exporta el cliente de Supabase

### Dashboard Remix

#### Nueva Ruta de Prescripciones
**Archivo**: `apps/dashboard/app/routes/_dashboard.prescriptions.tsx`

Características:
- Estadísticas en cards:
  - Talonarios importados
  - Recetas emitidas
  - Recetas firmadas
  - Firmadas hoy
- Estadísticas mensuales y diarias
- Tabla de prescripciones recientes con estado (firmada/pendiente)

#### Sidebar Actualizado
**Archivo**: `apps/dashboard/app/components/layout/Sidebar.tsx`
- Agregado enlace "Prescripciones" en el menú

## Flujo de Sincronización

### Importar Talonario
1. Usuario importa talonario en app móvil
2. Se guarda localmente en AsyncStorage
3. Se sincroniza con Supabase (`prescription_blocks`)
4. Visible en dashboard

### Crear Prescripción
1. Usuario crea prescripción en app móvil
2. Se obtiene número de receta del talonario activo
3. Se guarda localmente en AsyncStorage
4. Se sincroniza con Supabase (`issued_prescriptions`)
5. Se guarda el ID de Supabase en la prescripción local
6. Visible en dashboard

### Firmar Prescripción
1. Usuario firma prescripción en app móvil
2. Se actualiza estado localmente
3. Se sincroniza con Supabase (`signed_prescriptions`)
4. Se vincula con la receta emitida usando `supabaseIssuedId`
5. Visible en dashboard

## Estadísticas Disponibles

### En App Móvil (Local + Supabase)
- Prescripciones esta semana
- Prescripciones este mes
- Actividad semanal (últimos 7 días)
- Comparación mensual (últimos 6 meses)
- Distribución de medicamentos
- **Nuevo**: Estadísticas de Supabase en logs

### En Dashboard (Supabase)
- Total de talonarios importados
- Total de recetas emitidas
- Total de recetas firmadas
- Recetas emitidas este mes
- Recetas firmadas este mes
- Recetas emitidas hoy
- Recetas firmadas hoy
- Lista de prescripciones recientes con estado

## Seguridad

### Row Level Security (RLS)
- Cada usuario solo puede ver sus propios datos
- Superadmin tiene acceso completo
- Políticas separadas para SELECT, INSERT, UPDATE, DELETE

### Sincronización No Bloqueante
- La sincronización con Supabase no bloquea la UI
- Si falla la sincronización, la app continúa funcionando offline
- Los datos se guardan localmente primero

## Función RPC: get_user_prescription_stats

```sql
SELECT * FROM get_user_prescription_stats('user-id');
```

Retorna:
- `total_blocks`: Total de talonarios
- `total_issued`: Total de recetas emitidas
- `total_signed`: Total de recetas firmadas
- `issued_this_month`: Emitidas este mes
- `signed_this_month`: Firmadas este mes
- `issued_today`: Emitidas hoy
- `signed_today`: Firmadas hoy

## Testing

### App Móvil
1. Importar un talonario
2. Verificar que se sincroniza con Supabase
3. Crear una prescripción
4. Verificar que se sincroniza con Supabase
5. Firmar la prescripción
6. Verificar que se sincroniza con Supabase
7. Verificar logs de consola para confirmar sincronización

### Dashboard
1. Iniciar sesión como usuario
2. Navegar a "Prescripciones"
3. Verificar que aparecen las estadísticas
4. Verificar que aparecen las prescripciones recientes
5. Verificar que los estados (firmada/pendiente) son correctos

## Próximos Pasos

1. **Aplicar migración en Supabase**:
   ```bash
   cd apps/dashboard
   # Aplicar migración manualmente o usar Supabase CLI
   ```

2. **Verificar sincronización**:
   - Revisar logs de consola en app móvil
   - Verificar datos en Supabase Studio
   - Verificar visualización en dashboard

3. **Mejoras futuras**:
   - Sincronización batch para múltiples prescripciones
   - Retry automático si falla la sincronización
   - Indicador visual de estado de sincronización
   - Sincronización de datos pendientes al reconectar

## Notas Importantes

- La sincronización es **no bloqueante**: la app funciona offline
- Los datos locales son la fuente de verdad
- Supabase es para tracking y estadísticas
- No se sincronizan datos sensibles del paciente (solo números de receta)
- La sincronización requiere usuario autenticado

## Archivos Modificados

### Base de Datos
- `apps/dashboard/supabase/migrations/007_create_prescription_tracking.sql` (nuevo)

### App Móvil
- `apps/mobile/src/services/SupabaseSyncService.ts` (nuevo)
- `apps/mobile/src/lib/supabase.ts` (nuevo)
- `apps/mobile/src/services/PrescriptionService.ts`
- `apps/mobile/src/services/PrescriptionBlockService.ts`
- `apps/mobile/src/services/StatsService.ts`

### Dashboard
- `apps/dashboard/app/routes/_dashboard.prescriptions.tsx` (nuevo)
- `apps/dashboard/app/components/layout/Sidebar.tsx`
