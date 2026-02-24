# Solución OCR para Detección de Número de Receta

## Problema Original
La extracción de texto usando PDFTron/Apryse causaba crashes constantes en la app, haciendo imposible detectar el número de receta de forma confiable.

## Nueva Solución: Google ML Kit Vision + OCR

### Enfoque
En lugar de extraer texto directamente del PDF (que causaba crashes), ahora:
1. Generamos una imagen (thumbnail) de la primera página del PDF
2. Usamos Google ML Kit Vision para hacer OCR sobre la imagen
3. Parseamos el número de receta del texto extraído

### Ventajas
✅ **Mucho más estable** - ML Kit está diseñado específicamente para React Native
✅ **No causa crashes** - No depende de PDFTron para extracción de texto
✅ **Mejor precisión** - ML Kit es muy bueno reconociendo texto en imágenes
✅ **Funciona con PDFs protegidos** - Genera thumbnail sin necesidad de contraseña
✅ **Más rápido** - No necesita abrir y parsear todo el PDF

### Librerías Instaladas
```json
{
  "@react-native-ml-kit/text-recognition": "^2.0.0",
  "react-native-pdf-thumbnail": "^1.3.1"
}
```

## Implementación

### 1. Nuevo Servicio: OcrService.ts

```typescript
export const OcrService = {
  async extractPrescriptionNumberFromPdf(pdfUri: string) {
    // 1. Generar imagen de la primera página
    const thumbnail = await generateThumbnail({
      source: pdfUri,
      page: 0,
      quality: 100,
      maxWidth: 2000,
      maxHeight: 2000,
    });

    // 2. Hacer OCR sobre la imagen
    const result = await TextRecognition.recognize(thumbnail.uri);

    // 3. Parsear número de receta
    const prescriptionNumber = this.parsePrescriptionNumber(result.text);

    return { prescriptionNumber, success: prescriptionNumber.length > 0 };
  }
}
```

### 2. Patrones de Detección

El servicio busca estos patrones en el texto OCR:
- `Nº de Receta: 29-8448969`
- `Nº Receta: 29-8448969`
- `Numero de Receta: 29-8448969`
- `Receta: 29-8448969`
- `29-8448969` (formato directo)

### 3. Flujo de Usuario

1. Usuario selecciona PDF
2. Usuario introduce contraseña (opcional)
3. Usuario hace clic en "Detectar datos del PDF"
4. App intenta detectar número de páginas (PDFTron - puede fallar con PDFs protegidos)
5. App genera thumbnail de primera página y hace OCR (ML Kit - más estable)
6. App muestra resultados de lo que pudo detectar
7. Usuario completa manualmente lo que no se detectó

## Mejoras Recientes (24 Feb 2026)

### Problema: Botones Duplicados y Crashes
- Había 2 botones duplicados con el mismo propósito
- Ambos causaban crashes al intentar detectar datos

### Solución Aplicada
1. **Eliminado botón duplicado** - Solo queda un botón: "Detectar datos del PDF"
2. **Detección independiente** - Cada método (page count y OCR) tiene su propio try-catch
3. **Continúa si falla uno** - Si falla la detección de páginas, aún intenta OCR
4. **Mensajes claros** - Indica qué se detectó y qué debe introducirse manualmente
5. **Sin requisito de contraseña** - OCR funciona sin contraseña (genera thumbnail directamente)

### Código Mejorado

```typescript
const detectPageCount = async (fileUri: string, password: string) => {
  setDetectingPages(true);
  let pageCountDetected = false;
  let rxNumberDetected = false;
  
  try {
    // Step 1: Try page count (may fail with protected PDFs)
    try {
      const count = await PdfReaderService.getPageCount(fileUri, password);
      if (count > 0) {
        setTotalStr(String(count));
        pageCountDetected = true;
      }
    } catch (pageCountError) {
      console.error('Error detecting page count:', pageCountError);
      // Continue to OCR even if this fails
    }

    // Step 2: Try OCR (more stable, works without password)
    try {
      const result = await OcrService.extractPrescriptionNumberFromPdf(fileUri);
      if (result.success && result.prescriptionNumber) {
        setBlockSerial(result.prescriptionNumber);
        rxNumberDetected = true;
      }
    } catch (ocrError) {
      console.error('Error with OCR:', ocrError);
      // Continue even if OCR fails
    }

    // Show what was detected
    if (pageCountDetected || rxNumberDetected) {
      // Show success message with detected data
    } else {
      throw new Error('No se pudo detectar ningún dato del PDF');
    }
  } catch (error) {
    // Show error and ask user to enter manually
  } finally {
    setDetectingPages(false);
  }
};
```

## Archivos Modificados

### Nuevos
- `apps/mobile/src/services/OcrService.ts` - Servicio de OCR

### Modificados
- `apps/mobile/src/screens/PrescriptionBlocksScreen.tsx` - Usa OcrService, botón único, detección robusta
- `apps/mobile/package.json` - Nuevas dependencias

## Testing

Para probar:

```bash
cd apps/mobile
npm run android
```

Luego:
1. Ir a "Bloques de Recetas"
2. Hacer clic en "+"
3. Seleccionar un PDF
4. Introducir contraseña si es necesario (opcional para OCR)
5. Hacer clic en "Detectar datos del PDF"
6. Debería detectar lo que pueda SIN crashear
7. Completar manualmente lo que no se detectó

## Ventajas Técnicas

### ML Kit vs PDFTron
| Característica | ML Kit | PDFTron |
|---|---|---|
| Estabilidad | ✅ Muy estable | ❌ Crashes frecuentes |
| Velocidad | ✅ Rápido | ⚠️ Lento |
| Precisión OCR | ✅ Excelente | ⚠️ Variable |
| Tamaño | ✅ Pequeño | ❌ Grande |
| Mantenimiento | ✅ Google | ⚠️ Tercero |
| PDFs protegidos | ✅ Funciona | ❌ Requiere contraseña |

### Limitaciones

- ⚠️ Requiere que el PDF tenga texto legible (no funciona con PDFs escaneados de mala calidad)
- ⚠️ La precisión depende de la calidad de la imagen generada
- ⚠️ Puede no detectar números de receta con formatos muy diferentes

### Mejoras Futuras

Si la detección no es suficientemente precisa, se puede:
1. Aumentar la calidad del thumbnail (maxWidth/maxHeight)
2. Agregar más patrones de detección
3. Usar preprocesamiento de imagen (contraste, brillo)
4. Implementar corrección de perspectiva
5. Usar múltiples páginas si la primera no tiene el número

## Logs para Debugging

```bash
adb logcat | grep -E "OcrService|TextRecognition|detectPageCount"
```

Logs esperados:
- "Detecting page count..."
- "Page count detected: X"
- "Using OCR to extract prescription number..."
- "OcrService: Generating thumbnail from PDF first page..."
- "OcrService: Thumbnail generated: file://..."
- "OcrService: Performing OCR..."
- "OcrService: OCR completed. Text length: XXX"
- "OcrService: Found prescription number: 29-8448969"
- "Prescription number detected: 29-8448969"

---

**Fecha:** 24 de Febrero, 2026
**Estado:** ✅ Implementado y mejorado - Listo para testing
**Prioridad:** CRÍTICA - Reemplaza solución inestable
**Última actualización:** Eliminados botones duplicados, detección robusta con fallback
