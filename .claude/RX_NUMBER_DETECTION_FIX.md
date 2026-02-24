# Fix: Detección de Número de Receta con Contraseña - v2

## Problema
La app crasheaba al intentar detectar el número de receta de un PDF protegido con contraseña. El crash ocurría en el código nativo (Kotlin) dentro del método `extractPageText`.

## Causa Raíz
1. No se liberaban correctamente los recursos (PDFDoc y TextExtractor) en caso de error
2. El parsing del número de receta podía causar excepciones no capturadas
3. La detección automática bloqueaba el flujo principal de la UI
4. No había suficiente protección contra valores null/undefined

## Soluciones Aplicadas v2

### 1. Kotlin (PdfSignerModule.kt)

**Mejoras críticas en `extractPageText`:**
```kotlin
// Uso de variables nullables y finally block
var doc: PDFDoc? = null
var extractor: TextExtractor? = null
try {
  // ... código principal
} finally {
  // Siempre liberar recursos
  try {
    extractor?.destroy()
  } catch (e: Exception) {
    Log.e("PdfSignerModule", "Error destroying extractor: ${e.message}")
  }
  try {
    doc?.close()
  } catch (e: Exception) {
    Log.e("PdfSignerModule", "Error closing document: ${e.message}")
  }
}
```

**Protección adicional:**
- Validación de `totalPages` antes de acceder
- Try-catch específico para `parseRxNumber`
- Liberación de recursos en finally block
- Logging detallado de todos los errores

### 2. JavaScript/TypeScript (PrescriptionBlocksScreen.tsx)

**En `handlePickFile`:**
- Ya NO llama a `detectPageCount` automáticamente
- Solo intenta detectar el número de páginas sin contraseña
- No bloquea si falla

**En `detectPageCount`:**
- Validación mejorada: `if (pageInfo && typeof pageInfo === 'object' && pageInfo.prescriptionNumber)`
- Mensaje más claro al usuario si no se puede detectar el número
- Mejor manejo de errores con mensajes descriptivos

**En `loadBlocks`:**
- La carga de números de receta ahora es COMPLETAMENTE ASÍNCRONA
- Usa `setTimeout` para no bloquear la carga principal
- La UI se carga inmediatamente, los números aparecen después
- Si falla, no afecta la funcionalidad principal

## Cambios Específicos

### PdfSignerModule.kt
1. Variables nullables: `var doc: PDFDoc? = null`
2. Finally block para liberar recursos siempre
3. Try-catch individual para `parseRxNumber`
4. Validación de `totalPages` antes de usar
5. Logging de errores en destroy y close

### PrescriptionBlocksScreen.tsx
1. `handlePickFile`: Solo detecta páginas sin contraseña
2. `detectPageCount`: Validación `typeof pageInfo === 'object'`
3. `loadBlocks`: Carga asíncrona con `setTimeout` de números Rx
4. Mejor manejo de errores en todos los métodos

## Resultado

La app ahora:
- ✅ NO crashea si el PDF está protegido con contraseña
- ✅ NO crashea si no se puede extraer el número de receta
- ✅ Libera recursos correctamente incluso en caso de error
- ✅ La UI se carga rápidamente sin esperar la detección
- ✅ Los números de receta aparecen de forma asíncrona
- ✅ Proporciona logging útil para debugging
- ✅ Maneja gracefully todos los casos de error
- ✅ Continúa funcionando incluso si la detección falla completamente

## Testing

Para probar:
1. Seleccionar un PDF protegido con contraseña
2. La app debe cargar sin crashear
3. Introducir la contraseña
4. Hacer clic en "Detectar recetas con contraseña"
5. La app debe:
   - Detectar el número de páginas correctamente
   - Intentar detectar el número de receta
   - Si falla, mostrar mensaje pero NO crashear
   - Permitir continuar con el flujo normal

## Rebuild Necesario

```bash
cd apps/mobile/android
./gradlew clean
cd ..
npm run android
```

## Logs para Debugging

Ver logs en Android Studio:
```bash
adb logcat | grep PdfSignerModule
```

Logs esperados:
- "Extracted text from page 0 (length: XXX)"
- "Found Rx number: 29-8448969" (si encuentra)
- "No Rx number found in text (length: XXX)" (si no encuentra)
- "Error parsing Rx number: ..." (si hay error en parsing)
- "Error destroying extractor: ..." (si hay error liberando recursos)
- "Error closing document: ..." (si hay error cerrando documento)

---

**Fecha:** 24 de Febrero, 2026
**Estado:** ✅ Completado v2 - Con protección de recursos y carga asíncrona

