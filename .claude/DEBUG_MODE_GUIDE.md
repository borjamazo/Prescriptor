# Guía del Modo Debug para Posicionamiento de Recetas

## Activación del Modo Debug

El modo debug está **ACTIVADO** por defecto para facilitar el ajuste de coordenadas.

**Archivo**: `apps/mobile/src/config/debugConfig.ts`

```typescript
export const DEBUG_PRESCRIPTION_POSITIONING = true; // Cambiar a false para desactivar
```

## Funcionalidades del Modo Debug

Cuando el modo debug está activado, cada tarjeta de receta muestra una sección amarilla con:

### 1. Botón "Regenerar PDF"
- **Función**: Genera el PDF de la receta SIN firmar
- **Uso**: Permite probar rápidamente el posicionamiento de coordenadas
- **Ventaja**: No necesitas seleccionar certificado ni firmar cada vez
- **Resultado**: Muestra un diálogo con opciones para ver o compartir el PDF

### 2. Botón "Compartir"
- **Función**: Comparte el último PDF generado
- **Uso**: Envía el PDF a otras apps para verificar el posicionamiento
- **Ventaja**: Puedes enviar el PDF a tu email, WhatsApp, etc. para verlo en otro dispositivo

## Flujo de Trabajo para Ajustar Coordenadas

### Paso 1: Crear una Receta de Prueba
1. Crea una receta con datos reales (nombre largo, medicamento largo, etc.)
2. La receta aparecerá en la lista de Home

### Paso 2: Generar PDF sin Firmar
1. En la tarjeta de la receta, busca la sección amarilla "🔧 DEBUG MODE"
2. Toca el botón **"Regenerar PDF"**
3. Espera a que se genere (verás "Generando...")
4. Aparecerá un diálogo mostrando:
   - Número de receta
   - Posición (TOP o BOTTOM)
   - Índice de prescripción
   - Número de página

### Paso 3: Verificar el Posicionamiento
Tienes 3 opciones:

**Opción A - Ver en el dispositivo**:
- Toca "Ver PDF" en el diálogo
- Se abrirá el PDF en el visor predeterminado
- Verifica dónde aparecen los datos

**Opción B - Compartir para ver en otro dispositivo**:
- Toca "Compartir" en el diálogo
- Envía el PDF a tu email o WhatsApp
- Ábrelo en tu computadora para ver mejor

**Opción C - Compartir directamente desde la card**:
- Toca el botón "Compartir" en la sección debug
- Comparte el último PDF generado

### Paso 4: Ajustar Coordenadas
1. Abre el archivo Kotlin:
   ```
   apps/mobile/android/app/src/main/java/com/pdfsignpoc/PdfSignerModule.kt
   ```

2. Busca la sección de coordenadas (línea ~1020):
   ```kotlin
   // COORDENADAS ESPECÍFICAS - Ajusta estos valores según tu plantilla
   ```

3. Modifica los valores según lo que viste en el PDF:
   ```kotlin
   // Si el nombre está muy a la izquierda, aumenta X
   val topPatientNameX = 200.0  // Era 150.0
   
   // Si el nombre está muy arriba, disminuye Y
   val topPatientNameY = 650.0  // Era 700.0
   ```

### Paso 5: Recompilar y Probar
1. Recompila la app:
   ```bash
   cd apps/mobile
   npm run android
   ```

2. Vuelve a tocar "Regenerar PDF" en la misma receta

3. Verifica si el posicionamiento mejoró

4. Repite hasta que quede perfecto

## Información de Debug en el Diálogo

Cuando regeneras un PDF, el diálogo muestra:

```
✓ PDF Regenerado

Receta: 29-8448968
Posición: TOP
Índice: 0
Página: 0

El PDF se ha generado sin firmar para que 
puedas verificar el posicionamiento.
```

**Significado**:
- **Receta**: Número de la receta
- **Posición**: TOP (receta superior) o BOTTOM (receta inferior)
- **Índice**: Posición en el talonario (0, 1, 2, 3...)
- **Página**: Número de página del PDF (0-based)

## Logs de Debug

Los logs muestran información detallada:

```bash
adb logcat | grep DEBUG
```

Verás:
```
[DEBUG] Regenerating PDF...
[DEBUG] Page: 0, Index: 0, Position: top
[DEBUG] PDF regenerated: file:///...
PdfSignerModule: Filling TOP prescription
PdfSignerModule: Patient name at (150.0, 700.0)
```

## Consejos para Ajustar Coordenadas

### 1. Prueba con Datos Largos
Crea recetas con:
- Nombres muy largos: "María del Carmen Rodríguez García"
- Medicamentos largos: "Paracetamol 500mg + Ibuprofeno 400mg"
- Instrucciones largas: "Tomar 1 comprimido cada 8 horas después de las comidas durante 7 días"

### 2. Verifica Ambas Posiciones
- Crea 2 recetas consecutivas
- La primera será TOP (índice 0)
- La segunda será BOTTOM (índice 1)
- Verifica que ambas se posicionen correctamente

### 3. Ajusta de 10 en 10
- Cambia las coordenadas en incrementos de 10 puntos
- Esto hace más fácil ver el cambio
- Afina después con incrementos de 5 o 2 puntos

### 4. Usa el Mismo Orden
Ajusta siempre en este orden:
1. Nombre del paciente
2. Documento
3. Medicamento
4. Dosis
5. Instrucciones

## Desactivar el Modo Debug

Cuando termines de ajustar las coordenadas:

### Opción 1: Desactivar el Flag (Recomendado)
```typescript
// apps/mobile/src/config/debugConfig.ts
export const DEBUG_PRESCRIPTION_POSITIONING = false;
```

Recompila y la sección debug desaparecerá.

### Opción 2: Eliminar Todo el Código Debug

Si quieres eliminar completamente el código debug:

1. **Eliminar archivos**:
   ```bash
   rm apps/mobile/src/config/debugConfig.ts
   rm apps/mobile/src/services/PrescriptionDebugService.ts
   ```

2. **En PrescriptionCard.tsx**, eliminar:
   - Import de `debugConfig`
   - Props de debug en la interfaz
   - Sección DEBUG (marcada con comentarios)
   - Estilos de debug

3. **En HomeScreen.tsx**, eliminar:
   - Imports de debug
   - Estado de debug
   - Handlers de debug
   - Props de debug en PrescriptionCard

Todos los bloques de código debug están marcados con:
```typescript
// ═══════════════════════════════════════════════════════════════════
// DEBUG ... - Remove when debugging is complete
// ═══════════════════════════════════════════════════════════════════
```

## Ejemplo de Sesión de Ajuste

```
1. Crear receta "Juan Pérez" con "Paracetamol 500mg"
2. Tocar "Regenerar PDF"
3. Ver PDF → El nombre está muy a la izquierda
4. Ajustar: topPatientNameX = 200.0 (era 150.0)
5. Recompilar: npm run android
6. Tocar "Regenerar PDF" de nuevo
7. Ver PDF → Ahora está mejor, pero muy arriba
8. Ajustar: topPatientNameY = 680.0 (era 700.0)
9. Recompilar: npm run android
10. Tocar "Regenerar PDF" de nuevo
11. Ver PDF → ¡Perfecto!
12. Repetir para los demás campos
```

## Solución de Problemas

### El botón "Regenerar PDF" no aparece
- Verifica que `DEBUG_PRESCRIPTION_POSITIONING = true`
- Recompila la app

### Error al regenerar PDF
- Verifica que la receta tenga `blockId`
- Revisa los logs: `adb logcat | grep DEBUG`
- Verifica que el talonario esté importado correctamente

### El PDF se genera pero no se ve
- Toca "Compartir" y envíalo a tu email
- Verifica permisos de almacenamiento en Android

### Las coordenadas no cambian
- Asegúrate de recompilar después de cambiar el código Kotlin
- Verifica que estés editando el archivo correcto
- Limpia el build: `cd android && ./gradlew clean`

## Estado Actual

✅ Modo debug activado
✅ Botones "Regenerar PDF" y "Compartir" en las cards
✅ Generación de PDF sin firma
✅ Logs detallados
✅ Código bien estructurado y marcado para eliminación
✅ Listo para ajustar coordenadas

Ahora puedes crear recetas y usar "Regenerar PDF" para probar el posicionamiento rápidamente sin necesidad de firmar cada vez.
