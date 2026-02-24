# Guía Rápida: Ajustar Coordenadas de Recetas

## Sistema Implementado

Cada página del PDF tiene **2 recetas**:
- **Receta SUPERIOR** (índices pares: 0, 2, 4, 6...)
- **Receta INFERIOR** (índices impares: 1, 3, 5, 7...)

## Dónde Ajustar las Coordenadas

**Archivo**: `apps/mobile/android/app/src/main/java/com/pdfsignpoc/PdfSignerModule.kt`

Busca la sección marcada con:
```kotlin
// ═══════════════════════════════════════════════════════════════════════
// COORDENADAS ESPECÍFICAS - Ajusta estos valores según tu plantilla
// ═══════════════════════════════════════════════════════════════════════
```

## Coordenadas Actuales (Valores por Defecto)

### Receta SUPERIOR (mitad superior de la página)
```kotlin
val topPatientNameX = 150.0      // X para nombre del paciente
val topPatientNameY = 700.0      // Y para nombre del paciente
val topPatientDocX = 150.0       // X para documento
val topPatientDocY = 680.0       // Y para documento
val topMedicationX = 150.0       // X para medicamento
val topMedicationY = 640.0       // Y para medicamento
val topDosageX = 150.0           // X para dosis
val topDosageY = 620.0           // Y para dosis
val topInstructionsX = 150.0     // X para instrucciones
val topInstructionsY = 580.0     // Y para instrucciones
```

### Receta INFERIOR (mitad inferior de la página)
```kotlin
val bottomPatientNameX = 150.0   // X para nombre del paciente
val bottomPatientNameY = 350.0   // Y para nombre del paciente
val bottomPatientDocX = 150.0    // X para documento
val bottomPatientDocY = 330.0    // Y para documento
val bottomMedicationX = 150.0    // X para medicamento
val bottomMedicationY = 290.0    // Y para medicamento
val bottomDosageX = 150.0        // X para dosis
val bottomDosageY = 270.0        // Y para dosis
val bottomInstructionsX = 150.0  // X para instrucciones
val bottomInstructionsY = 230.0  // Y para instrucciones
```

## Sistema de Coordenadas PDF

```
        Y aumenta ↑
                  |
    (0, 842) ────┼──── (595, 842)  ← Parte SUPERIOR
                  |
                  |  Receta SUPERIOR
                  |  (Y > 421)
    (0, 421) ────┼──── (595, 421)  ← MITAD
                  |
                  |  Receta INFERIOR
                  |  (Y < 421)
    (0, 0) ──────┼──── (595, 0)    ← Parte INFERIOR
                  
                  X aumenta →
```

**Importante**:
- **Y=0** está en la parte INFERIOR de la página
- **Y aumenta hacia ARRIBA**
- Página A4 estándar: 595 x 842 puntos

## Cómo Medir y Ajustar

### Método 1: Medición Manual

1. **Abre tu PDF de receta** en un visor que muestre coordenadas (Adobe Acrobat, etc.)

2. **Haz clic en cada campo** y anota las coordenadas X,Y

3. **Actualiza los valores** en `PdfSignerModule.kt`

4. **Recompila**:
   ```bash
   cd apps/mobile
   npm run android
   ```

### Método 2: Conversión desde Milímetros

Si mides con regla desde los bordes:

**Desde el borde IZQUIERDO** (para X):
```
X = milímetros × 2.83
```

**Desde el borde INFERIOR** (para Y):
```
Y = milímetros × 2.83
```

**Desde el borde SUPERIOR** (para Y):
```
Y = 842 - (milímetros × 2.83)
```

**Ejemplo**:
- Campo a 50mm desde izquierda: `X = 50 × 2.83 = 141.5`
- Campo a 30mm desde arriba: `Y = 842 - (30 × 2.83) = 842 - 84.9 = 757.1`

### Método 3: Prueba y Error con Logs

1. **Firma una receta** y observa dónde aparecen los datos

2. **Revisa los logs** de Android:
   ```bash
   adb logcat | grep PdfSignerModule
   ```
   
   Verás:
   ```
   Page dimensions: 595.0x842.0
   Filling TOP prescription
   Patient name at (150.0, 700.0)
   Medication at (150.0, 640.0)
   ```

3. **Ajusta las coordenadas** según lo que veas:
   - Si el texto está muy a la izquierda → aumenta X
   - Si el texto está muy a la derecha → disminuye X
   - Si el texto está muy arriba → disminuye Y
   - Si el texto está muy abajo → aumenta Y

4. **Recompila y prueba** de nuevo

## Ejemplo de Ajuste

Si tu receta tiene los campos así:

```
┌─────────────────────────────────────┐
│  Receta Superior                    │
│                                     │
│  Paciente: [____] ← 60mm izq, 50mm arriba
│  DNI: [____]      ← 60mm izq, 60mm arriba
│  Med: [____]      ← 60mm izq, 80mm arriba
│  Dosis: [____]    ← 60mm izq, 90mm arriba
│                                     │
├─────────────────────────────────────┤
│  Receta Inferior                    │
│                                     │
│  Paciente: [____] ← 60mm izq, 170mm arriba
│  DNI: [____]      ← 60mm izq, 180mm arriba
│  Med: [____]      ← 60mm izq, 200mm arriba
│  Dosis: [____]    ← 60mm izq, 210mm arriba
│                                     │
└─────────────────────────────────────┘
```

Conversión:
```kotlin
// X siempre igual (60mm desde izquierda)
val X = 60 * 2.83 = 169.8

// Receta SUPERIOR
val topPatientNameY = 842 - (50 * 2.83) = 842 - 141.5 = 700.5
val topPatientDocY = 842 - (60 * 2.83) = 842 - 169.8 = 672.2
val topMedicationY = 842 - (80 * 2.83) = 842 - 226.4 = 615.6
val topDosageY = 842 - (90 * 2.83) = 842 - 254.7 = 587.3

// Receta INFERIOR
val bottomPatientNameY = 842 - (170 * 2.83) = 842 - 481.1 = 360.9
val bottomPatientDocY = 842 - (180 * 2.83) = 842 - 509.4 = 332.6
val bottomMedicationY = 842 - (200 * 2.83) = 842 - 566.0 = 276.0
val bottomDosageY = 842 - (210 * 2.83) = 842 - 594.3 = 247.7
```

## Verificación

Después de ajustar, verifica:

1. ✅ Los datos aparecen en los campos correctos
2. ✅ La receta superior (índice 0, 2, 4...) usa las coordenadas TOP
3. ✅ La receta inferior (índice 1, 3, 5...) usa las coordenadas BOTTOM
4. ✅ El texto no se sale de los campos
5. ✅ Las instrucciones se dividen en máximo 3 líneas

## Logs de Debugging

Al firmar una receta, verás en los logs:

```
PdfSignerModule: Page dimensions: 595.0x842.0
PdfSignerModule: Filling TOP prescription
PdfSignerModule: Patient name at (150.0, 700.0)
PdfSignerModule: Patient document at (150.0, 680.0)
PdfSignerModule: Medication at (150.0, 640.0)
PdfSignerModule: Dosage at (150.0, 620.0)
PdfSignerModule: Instructions at (150.0, 580.0)
PdfSignerModule: Text overlay completed for TOP prescription
```

Usa estos logs para verificar qué coordenadas se están usando.

## Consejos

1. **Empieza con la receta superior**: Ajusta primero las coordenadas TOP
2. **Prueba con datos reales**: Usa nombres largos, medicamentos largos, etc.
3. **Verifica ambas recetas**: Crea 2 recetas consecutivas para ver ambas posiciones
4. **Ajusta de 10 en 10**: Cambia las coordenadas en incrementos de 10 puntos
5. **Guarda las coordenadas**: Una vez que funcionen, documéntalas

## Próximos Pasos

Una vez que tengas las coordenadas correctas:

1. Documenta los valores finales
2. Considera crear un archivo de configuración
3. Prueba con diferentes tipos de datos (nombres largos, instrucciones largas)
4. Verifica que funciona con todas las páginas del talonario

## Mejora Futura

En el futuro, podríamos:
- Hacer las coordenadas configurables desde la app (sin recompilar)
- Crear una UI para ajustar visualmente
- Guardar diferentes configuraciones por tipo de receta
- Detectar automáticamente las posiciones mediante OCR
