# Fix: Prescripciones no se visualizan en Home

## Problema
Después de crear una prescripción, no se visualizaba en la pantalla Home porque los datos solo se cargaban una vez al montar el componente.

## Solución Implementada

### 1. HomeScreen - Recarga automática con useFocusEffect
**Archivo**: `apps/mobile/src/screens/HomeScreen.tsx`

**Cambios**:
- Reemplazado `useEffect` por `useFocusEffect` de React Navigation
- Ahora los datos se recargan cada vez que la pantalla vuelve a estar en foco
- Carga paralela de prescripciones y estadísticas con `Promise.all`
- Mejor manejo de errores con try/catch

**Antes**:
```typescript
useEffect(() => {
  PrescriptionService.getAll().then(setPrescriptions);
  PrescriptionService.getStats().then(setStats);
}, []);
```

**Después**:
```typescript
const loadData = useCallback(async () => {
  try {
    const [prescriptionsData, statsData] = await Promise.all([
      PrescriptionService.getAll(),
      PrescriptionService.getStats(),
    ]);
    setPrescriptions(prescriptionsData);
    setStats(statsData);
  } catch (error) {
    console.error('Error loading home data:', error);
  }
}, []);

useFocusEffect(
  useCallback(() => {
    loadData();
  }, [loadData])
);
```

### 2. PrescriptionCreateScreen - Mejoras en UX
**Archivo**: `apps/mobile/src/screens/PrescriptionCreateScreen.tsx`

**Cambios**:
1. **Mensaje de éxito mejorado**:
   - Muestra el número de receta asignado
   - Muestra el nombre del paciente
   - Solo navega de vuelta después de que el usuario confirme

2. **Mejor manejo de errores**:
   - Muestra el mensaje de error real (no genérico)
   - Log del error en consola para debugging

3. **Warning actualizado**:
   - Texto más claro: "Sin Talonario Activo"
   - Botón navega a "PrescriptionBlocks" (no Settings)
   - Explicación más precisa del problema

4. **Recarga de estado con useFocusEffect**:
   - Verifica si hay talonario activo cada vez que la pantalla está en foco
   - Útil cuando el usuario va a importar/activar un talonario y vuelve

## Flujo Completo

1. Usuario crea nueva prescripción
2. Se muestra alert con número de receta asignado
3. Usuario presiona OK
4. Navega de vuelta a Home
5. `useFocusEffect` detecta que Home está en foco
6. Recarga automáticamente prescripciones y estadísticas
7. La nueva prescripción aparece en la lista

## Beneficios

- ✅ Las prescripciones se actualizan automáticamente al volver a Home
- ✅ Las estadísticas se actualizan en tiempo real
- ✅ Mejor feedback al usuario con mensajes de éxito/error
- ✅ Navegación más intuitiva al gestionar talonarios
- ✅ No requiere pull-to-refresh manual

## Testing

Para verificar:
1. Importar y activar un talonario
2. Crear una nueva prescripción
3. Verificar que aparece el alert con el número de receta
4. Presionar OK
5. Verificar que la prescripción aparece en Home
6. Verificar que las estadísticas se actualizan

## Archivos Modificados

- `apps/mobile/src/screens/HomeScreen.tsx`
- `apps/mobile/src/screens/PrescriptionCreateScreen.tsx`
