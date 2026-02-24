# Solución de Posicionamiento de Datos en Recetas

## Problema Resuelto
Los datos de la receta (paciente, medicamento, dosis, etc.) no se posicionaban correctamente en los campos del PDF.

## Solución Implementada

### Sistema de Doble Estrategia

#### 1. Detección Automática de Campos de Formulario (Primera Opción)
El sistema primero intenta detectar y rellenar campos AcroForm si existen en el PDF.

**Archivo**: `PdfSignerModule.kt` - Método `tryFillFormFields()`

**Patrones detectados**:
- Paciente: "paciente", "patient", "nombre", "name", "apellidos"
- Documento: "dni", "documento", "document", "id", "nif", "nie"  
- Medicamento: "medicamento", "medication", "medicine", "farmaco", "principio_activo"
- Dosis: "dosis", "dosage", "dose", "cantidad"
- Instrucciones: "posologia", "instrucciones", "instructions", "indicaciones"

Si el PDF tiene campos con estos nombres, se rellenan automáticamente.

#### 2. Posicionamiento Manual Configurable (Fallback)
Si no hay campos de formulario, el sistema superpone texto en posiciones configurables.

**Archivo**: `PdfSignerModule.kt` - Método `overlayPrescriptionText()`

**Características**:
- Posiciones configurables desde TypeScript
- Sistema de coordenadas PDF (Y=0 abajo, aumenta hacia arriba)
- Ajuste de márgenes y espaciado
- Soporte para posiciones específicas por campo
- Logs detallados para debugging

### Archivos Creados

#### 1. `apps/mobile/src/config/prescriptionLayout.ts`
Configuración centralizada de posicionamiento:

```typescript
export const DEFAULT_PRESCRIPTION_LAYOUT: PrescriptionLayoutConfig = {
  fontSize: 9,           // Tamaño de fuente
  lineSpacing: 20,       // Espacio entre líneas
  leftMargin: 100,       // Distancia desde borde izquierdo (puntos)
  topMargin: 100,        // Distancia desde borde superior (puntos)
  maxCharsPerLine: 60,   // Caracteres por línea
  
  // Opcional: Posiciones específicas por campo
  patientNamePosition: { x: 150, y: 700 },
  // ... más campos
};
```

**Helpers incluidos**:
- `mmToPoints(mm)`: Convierte milímetros a puntos PDF
- `pointsToMm(points)`: Convierte puntos PDF a milímetros
- `EXAMPLE_LAYOUTS`: Configuraciones de ejemplo

#### 2. `.claude/PRESCRIPTION_LAYOUT_GUIDE.md`
Guía completa de configuración con:
- Explicación del sistema de coordenadas PDF
- Instrucciones paso a paso para ajustar posiciones
- Ejemplos de configuración
- Tips de debugging
- Conversión de unidades

### Flujo de Ejecución

```
createPrescriptionPdf()
  ↓
addPrescriptionDataToPage()
  ↓
tryFillFormFields()
  ├─ ✓ Campos encontrados → Rellenar y terminar
  └─ ✗ No hay campos → overlayPrescriptionText()
      ↓
      Superponer texto en posiciones configuradas
```

### Logs de Debugging

El sistema genera logs detallados en Android:

```
Page dimensions: 595.0x842.0
Found field: paciente_nombre
Filled field 'paciente_nombre' with value
Text overlay completed
```

Ver logs:
```bash
adb logcat | grep PdfSignerModule
```

## Cómo Ajustar las Posiciones

### Opción A: Si tu PDF tiene campos de formulario

1. Ejecuta la app y firma una receta
2. Revisa los logs para ver qué campos se detectaron
3. Si los campos se rellenan correctamente, ¡listo!
4. Si no, ajusta los patrones de nombres en `tryFillFormFields()`

### Opción B: Si tu PDF NO tiene campos de formulario

1. **Abre** `apps/mobile/src/config/prescriptionLayout.ts`

2. **Mide** las posiciones en tu PDF de receta:
   - Imprime o visualiza el PDF
   - Mide distancias desde bordes (en mm)
   - Convierte a puntos: `puntos = mm × 2.83`

3. **Actualiza** la configuración:
   ```typescript
   export const DEFAULT_PRESCRIPTION_LAYOUT = {
     fontSize: 9,
     lineSpacing: 20,
     leftMargin: 120,    // Tu medida en puntos
     topMargin: 150,     // Tu medida en puntos
     maxCharsPerLine: 60,
   };
   ```

4. **Recompila**:
   ```bash
   npm run android
   ```

5. **Prueba** y ajusta iterativamente

### Opción C: Posiciones específicas por campo

Si cada campo debe estar en una posición exacta:

```typescript
export const DEFAULT_PRESCRIPTION_LAYOUT = {
  fontSize: 9,
  lineSpacing: 20,
  leftMargin: 100,
  topMargin: 100,
  maxCharsPerLine: 60,
  
  // Posiciones medidas del PDF real
  patientNamePosition: { x: 180, y: 720 },
  patientDocumentPosition: { x: 180, y: 695 },
  medicationPosition: { x: 180, y: 620 },
  dosagePosition: { x: 400, y: 620 },
  instructionsPosition: { x: 180, y: 550 },
};
```

## Herramientas de Ayuda

### Listar campos del PDF
```typescript
// En PrescriptionPdfService.ts
const fields = await PrescriptionPdfService.listPrescriptionFields(blockId);
console.log('Campos:', fields);
```

### Convertir unidades
```typescript
import { mmToPoints, pointsToMm } from '../config/prescriptionLayout';

const points = mmToPoints(50);  // 50mm → ~141.5 puntos
const mm = pointsToMm(200);     // 200 puntos → ~70.6mm
```

### Ver PDF sin firmar (para pruebas rápidas)
```typescript
// Comentar temporalmente la firma
const prescriptionPdfUri = await PdfSigner.createPrescriptionPdf(...);
await PdfSigner.openPdf(prescriptionPdfUri); // Ver resultado
// const signedPdfUri = await PdfSigner.signPdf(prescriptionPdfUri);
```

## Sistema de Coordenadas PDF

```
        Y aumenta ↑
                  |
    (0, 842) ────┼──── (595, 842)  ← Esquina superior
                  |
                  |
                  |
    (0, 0) ──────┼──── (595, 0)    ← Esquina inferior
                  
                  X aumenta →
```

**Para posicionar desde arriba**:
```
Y = pageHeight - distanciaDesdeArriba
Y = 842 - (mm × 2.83)
```

## Estado Actual

✅ Sistema de doble estrategia implementado
✅ Detección automática de campos de formulario
✅ Posicionamiento manual configurable
✅ Archivo de configuración centralizado
✅ Helpers de conversión de unidades
✅ Logs detallados para debugging
✅ Guía completa de configuración
✅ Compilación exitosa
✅ App instalada y funcionando

## Próximos Pasos

1. **Probar** con tu PDF de receta real
2. **Verificar logs** para ver si detecta campos
3. **Ajustar configuración** si es necesario
4. **Iterar** hasta que el posicionamiento sea perfecto

## Mejoras Futuras

- [ ] UI para ajustar posiciones visualmente
- [ ] Guardar configuración por talonario
- [ ] Preview del PDF antes de firmar
- [ ] Plantillas predefinidas
- [ ] Detección automática de áreas mediante OCR
- [ ] Soporte para múltiples páginas con diferentes layouts
