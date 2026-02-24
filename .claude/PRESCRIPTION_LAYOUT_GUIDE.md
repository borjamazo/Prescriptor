# Guía de Configuración de Posicionamiento de Recetas

## Problema
Los datos de la receta (paciente, medicamento, dosis, etc.) no se posicionan correctamente en los campos del PDF de receta.

## Soluciones Implementadas

### 1. Detección Automática de Campos de Formulario
El sistema primero intenta detectar y rellenar campos de formulario (AcroForm) si existen en el PDF.

**Patrones de nombres de campos detectados**:
- **Paciente**: "paciente", "patient", "nombre", "name", "apellidos"
- **Documento**: "dni", "documento", "document", "id", "nif", "nie"
- **Medicamento**: "medicamento", "medication", "medicine", "farmaco", "principio_activo"
- **Dosis**: "dosis", "dosage", "dose", "cantidad"
- **Instrucciones**: "posologia", "instrucciones", "instructions", "indicaciones"

Si tu PDF tiene campos con estos nombres (o similares), se rellenarán automáticamente.

### 2. Posicionamiento Manual Configurable
Si el PDF no tiene campos de formulario, el sistema superpone texto en posiciones configurables.

## Cómo Ajustar las Posiciones

### Paso 1: Verificar si hay campos de formulario

Puedes usar el método `listFormFields` para ver qué campos tiene tu PDF:

```typescript
// En el código, temporalmente:
const fields = await PdfSigner.listFormFields(block.fileUri, password);
console.log('Campos encontrados:', fields);
```

Si aparecen campos en el log, el sistema los rellenará automáticamente.

### Paso 2: Configurar posiciones manualmente

Si NO hay campos de formulario, necesitas ajustar las coordenadas en:
**`apps/mobile/src/config/prescriptionLayout.ts`**

#### Entender el sistema de coordenadas PDF:
- **Origen (0,0)**: Esquina inferior izquierda
- **Eje X**: Aumenta hacia la derecha
- **Eje Y**: Aumenta hacia ARRIBA (no hacia abajo como en pantallas)
- **Unidad**: Puntos (1 punto ≈ 0.35mm)
- **Página A4**: ~595 x 842 puntos

#### Para posicionar desde arriba:
```
Y = pageHeight - distanciaDesdeArriba
```

Ejemplo: Para poner texto a 50mm desde arriba:
```
Y = 842 - (50 * 2.83) = 842 - 141.5 = 700.5
```

### Paso 3: Método de prueba y error

1. **Imprime o visualiza tu PDF de receta** para ver dónde están los campos

2. **Mide las distancias** desde los bordes (en mm o cm)

3. **Convierte a puntos**:
   ```
   puntos = milímetros × 2.83
   ```

4. **Actualiza la configuración** en `prescriptionLayout.ts`:

```typescript
export const DEFAULT_PRESCRIPTION_LAYOUT: PrescriptionLayoutConfig = {
  fontSize: 9,           // Tamaño de fuente
  lineSpacing: 20,       // Espacio entre líneas
  leftMargin: 100,       // Distancia desde borde izquierdo
  topMargin: 100,        // Distancia desde borde superior
  maxCharsPerLine: 60,   // Caracteres por línea antes de salto
};
```

5. **Recompila y prueba**:
```bash
npm run android
```

6. **Ajusta iterativamente** hasta que quede bien posicionado

### Paso 4: Posiciones específicas por campo (Avanzado)

Si cada campo debe estar en una posición exacta diferente:

```typescript
export const DEFAULT_PRESCRIPTION_LAYOUT: PrescriptionLayoutConfig = {
  fontSize: 9,
  lineSpacing: 20,
  leftMargin: 100,
  topMargin: 100,
  maxCharsPerLine: 60,
  
  // Posiciones específicas (X, Y en puntos)
  patientNamePosition: { x: 150, y: 700 },      // Nombre del paciente
  patientDocumentPosition: { x: 150, y: 680 },  // DNI/Documento
  medicationPosition: { x: 150, y: 600 },       // Medicamento
  dosagePosition: { x: 150, y: 580 },           // Dosis
  instructionsPosition: { x: 150, y: 520 },     // Instrucciones
};
```

## Herramientas de Ayuda

### Convertir medidas:
```typescript
import { mmToPoints, pointsToMm } from '../config/prescriptionLayout';

// Convertir 50mm a puntos
const points = mmToPoints(50); // ~141.5 puntos

// Convertir 200 puntos a mm
const mm = pointsToMm(200); // ~70.6mm
```

### Ver dimensiones de la página:
Los logs en Android mostrarán:
```
Page dimensions: 595.0x842.0
```

## Ejemplos de Configuración

### Ejemplo 1: Campos en la parte superior
```typescript
{
  fontSize: 9,
  lineSpacing: 20,
  leftMargin: 120,      // ~42mm desde izquierda
  topMargin: 150,       // ~53mm desde arriba
  maxCharsPerLine: 60,
}
```

### Ejemplo 2: Campos en el centro
```typescript
{
  fontSize: 10,
  lineSpacing: 25,
  leftMargin: 100,      // ~35mm desde izquierda
  topMargin: 400,       // ~141mm desde arriba (centro aprox)
  maxCharsPerLine: 55,
}
```

### Ejemplo 3: Formulario con campos específicos
```typescript
{
  fontSize: 9,
  lineSpacing: 20,
  leftMargin: 100,
  topMargin: 100,
  maxCharsPerLine: 60,
  
  // Posiciones medidas del PDF real
  patientNamePosition: { x: 180, y: 720 },
  patientDocumentPosition: { x: 180, y: 695 },
  medicationPosition: { x: 180, y: 620 },
  dosagePosition: { x: 400, y: 620 },  // A la derecha del medicamento
  instructionsPosition: { x: 180, y: 550 },
}
```

## Debugging

### Ver logs en Android:
```bash
adb logcat | grep PdfSignerModule
```

Verás mensajes como:
```
Page dimensions: 595.0x842.0
Found field: paciente_nombre
Filled field 'paciente_nombre' with value
Text overlay completed
```

### Probar sin firmar:
Puedes comentar temporalmente la firma para solo ver el PDF generado:

```typescript
// En PrescriptionPdfService.ts
const prescriptionPdfUri = await PdfSigner.createPrescriptionPdf(...);
await PdfSigner.openPdf(prescriptionPdfUri); // Ver sin firmar
// const signedPdfUri = await PdfSigner.signPdf(prescriptionPdfUri);
```

## Próximos Pasos

1. **Verificar campos de formulario**: Ejecuta `listFormFields` para ver si tu PDF tiene campos
2. **Si tiene campos**: El sistema los rellenará automáticamente
3. **Si NO tiene campos**: Ajusta las coordenadas en `prescriptionLayout.ts`
4. **Prueba iterativa**: Ajusta, compila, prueba, repite hasta que quede perfecto

## Mejoras Futuras

- [ ] UI para ajustar posiciones visualmente
- [ ] Guardar configuración por talonario de recetas
- [ ] Preview del PDF antes de firmar
- [ ] Plantillas predefinidas para diferentes formatos de receta
- [ ] Detección automática de áreas de texto mediante OCR
