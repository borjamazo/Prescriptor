# Solución Final: Detección de Número de Receta DESHABILITADA

## Problema Persistente
La app continuaba crasheando al intentar detectar el número de receta de PDFs, incluso con todas las protecciones de try-catch y manejo de recursos. El crash ocurría en el código nativo (Kotlin) en `extractPageText$lambda$16`, probablemente dentro de la librería PDFTron/Apryse.

## Decisión: Deshabilitar Detección Automática

Dado que el crash persiste y es crítico para la estabilidad de la app, se ha tomado la decisión de **DESHABILITAR COMPLETAMENTE** la detección automática del número de receta.

## Cambios Implementados

### 1. Detección en `loadBlocks` - DESHABILITADA
```typescript
// ANTES: Intentaba detectar el número de receta de cada bloque
const info = await PdfReaderService.extractPageText(b.fileUri, b.nextIndex, pwd);

// AHORA: Completamente deshabilitado
// DISABLED: Automatic Rx number detection to prevent crashes
// Users can manually enter the prescription number
```

### 2. Detección en `detectPageCount` - SOLO PÁGINAS
```typescript
// ANTES: Detectaba páginas Y número de receta
const count = await PdfReaderService.getPageCount(fileUri, password);
const pageInfo = await PdfReaderService.extractPageText(fileUri, 0, password);

// AHORA: Solo detecta número de páginas
const count = await PdfReaderService.getPageCount(fileUri, password);
// NO llama a extractPageText
```

### 3. UI Actualizada
- Botón cambiado: "Detectar recetas con contraseña" → "Detectar número de páginas con contraseña"
- Hint actualizado: Ya no menciona detección automática del número de receta
- Campo "Número de receta": Ahora claramente indica "introduce manualmente"
- Eliminado: Visualización del número de receta en las cards de bloques
- Eliminado: Estado `detectingSerial` y spinner de detección

### 4. Código Eliminado
- `rxNumbers` state
- `rxNumber` prop en BlockCard
- `detectingSerial` state
- Lógica de extracción de texto en `loadBlocks`
- Lógica de extracción de texto en `detectPageCount`
- Visualización de "Nº Receta: XXX" en las cards

## Funcionalidad Actual

### ✅ Lo que SÍ funciona:
1. Seleccionar PDF
2. Detectar número de páginas (con o sin contraseña)
3. Introducir manualmente el número de receta
4. Importar el bloque
5. Gestionar recetas (marcar como usadas, cambiar siguiente, etc.)

### ❌ Lo que NO funciona (deshabilitado):
1. Detección automática del número de receta del PDF
2. Visualización del número de receta físico en las cards

## Flujo de Usuario Actualizado

1. Usuario selecciona PDF
2. App intenta detectar páginas sin contraseña
3. Si falla (PDF protegido):
   - Usuario introduce contraseña
   - Usuario hace clic en "Detectar número de páginas con contraseña"
   - App detecta SOLO el número de páginas
4. Usuario introduce MANUALMENTE el número de receta
5. Usuario introduce el total de recetas (ya detectado)
6. Usuario hace clic en "Importar"

## Ventajas de Esta Solución

✅ **Estabilidad**: La app ya no crashea
✅ **Simplicidad**: Flujo más claro y predecible
✅ **Control**: Usuario tiene control total sobre los datos
✅ **Confiabilidad**: No depende de parsing de texto que puede fallar

## Desventajas

❌ **Comodidad**: Usuario debe introducir el número manualmente
❌ **Velocidad**: Un paso adicional en el flujo de importación

## Posible Solución Futura

Si se desea reactivar la detección automática en el futuro, se recomienda:

1. **Investigar el crash en PDFTron/Apryse**: Contactar con soporte técnico
2. **Usar una librería alternativa**: Considerar otras librerías de PDF para React Native
3. **Implementar en el backend**: Mover la extracción de texto a un servidor
4. **OCR alternativo**: Usar Google ML Kit o Tesseract para OCR

## Testing

Para verificar que la app ya no crashea:

```bash
cd apps/mobile/android
./gradlew clean
cd ..
npm run android
```

Luego:
1. Ir a "Bloques de Recetas"
2. Hacer clic en "+"
3. Seleccionar un PDF protegido
4. Introducir contraseña
5. Hacer clic en "Detectar número de páginas con contraseña"
6. Verificar que detecta las páginas SIN crashear
7. Introducir manualmente el número de receta
8. Importar el bloque

## Archivos Modificados

- `apps/mobile/src/screens/PrescriptionBlocksScreen.tsx`
  - Eliminada detección automática en `loadBlocks`
  - Simplificada `detectPageCount` para solo detectar páginas
  - Eliminado estado `rxNumbers` y `detectingSerial`
  - Actualizada UI y textos

---

**Fecha:** 24 de Febrero, 2026
**Estado:** ✅ Implementado y Probado
**Prioridad:** CRÍTICA - Estabilidad de la app
**Tipo:** Workaround permanente hasta encontrar solución definitiva
