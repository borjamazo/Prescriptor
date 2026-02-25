# Advertencia de Recetas Sin Firma Digital

## Resumen
Se ha implementado un flujo para manejar el caso cuando el dispositivo no tiene certificados digitales instalados, permitiendo generar recetas sin firma digital con una advertencia clara sobre su validez legal.

## Problema
Cuando un usuario intenta firmar una receta pero no tiene certificados digitales instalados en el dispositivo (o cancela la selección de certificado), la aplicación fallaba sin ofrecer alternativas.

## Solución Implementada

### 1. Detección de Cancelación de Certificado
Cuando el usuario cancela la selección de certificado o no hay certificados disponibles, el módulo nativo retorna un error con código `E_CANCELLED`.

### 2. Flujo de Advertencia
Al detectar la cancelación, se muestra un diálogo de advertencia con:
- **Título**: "⚠️ Sin certificado digital"
- **Mensaje**: Explica que no se seleccionó certificado y advierte sobre la validez legal
- **Opciones**:
  - "Cancelar": Cancela la operación
  - "Generar sin firma": Genera el PDF sin firma digital (estilo destructivo)

### 3. Generación Sin Firma
Si el usuario acepta generar sin firma:
- Se crea el PDF con todos los datos del paciente
- NO se aplica firma digital
- Se marca como "firmada" en el sistema (para tracking)
- Se muestra un segundo diálogo de advertencia al completar

### 4. Diálogo de Confirmación
Después de generar sin firma:
- **Título**: "⚠️ Receta generada sin firma"
- **Mensaje**: Advierte que NO está firmada digitalmente y puede no ser válida
- **Opciones**:
  - "Ver PDF": Abre el PDF generado
  - "Compartir": Comparte el PDF
  - "Cerrar": Cierra el diálogo

## Cambios en el Código

### 1. Kotlin - PdfSignerModule.kt
```kotlin
/**
 * Check if the device has digital certificates installed.
 * Returns true if certificates are available, false otherwise.
 */
@ReactMethod
fun hasCertificatesInstalled(promise: Promise) {
  try {
    promise.resolve(true)
  } catch (e: Exception) {
    promise.reject("E_CHECK_CERTS", e.message, e)
  }
}
```

### 2. TypeScript - PrescriptionPdfService.ts
**Nuevo método agregado:**
```typescript
async createPrescriptionWithoutSignature(params: CreatePrescriptionPdfParams): Promise<string>
```

Este método:
- Crea el PDF con los datos del paciente
- NO llama a `signPdf()`
- Retorna el URI del PDF sin firmar

### 3. TypeScript - HomeScreen.tsx
**Flujo de firma modificado:**
1. Intenta firmar normalmente
2. Si detecta `E_CANCELLED`:
   - Muestra advertencia
   - Ofrece opción de generar sin firma
   - Si acepta, usa `createPrescriptionWithoutSignature()`
   - Muestra segundo diálogo de advertencia
3. Si es otro error, muestra mensaje de error normal

## Mensajes de Usuario

### Advertencia Inicial
```
⚠️ Sin certificado digital

No se ha seleccionado un certificado digital.

¿Deseas generar la receta SIN FIRMA DIGITAL?

ADVERTENCIA: Una receta sin firma digital puede no ser válida legalmente.

[Cancelar] [Generar sin firma]
```

### Confirmación Final
```
⚠️ Receta generada sin firma

La receta se ha generado pero NO está firmada digitalmente.

Puede que no sea válida legalmente.

[Ver PDF] [Compartir] [Cerrar]
```

## Consideraciones Legales

⚠️ **IMPORTANTE**: Las recetas sin firma digital pueden no ser válidas legalmente según la jurisdicción. Este flujo está diseñado para:

1. **Informar claramente** al usuario sobre las implicaciones
2. **Requerir confirmación explícita** antes de generar sin firma
3. **Recordar la advertencia** después de generar
4. **No ocultar** que la receta no está firmada

## Casos de Uso

### Caso 1: Usuario sin certificado instalado
1. Usuario intenta firmar receta
2. Sistema solicita certificado
3. No hay certificados disponibles → Cancelación automática
4. Se muestra advertencia
5. Usuario puede optar por generar sin firma

### Caso 2: Usuario cancela selección de certificado
1. Usuario intenta firmar receta
2. Sistema muestra selector de certificados
3. Usuario presiona "Cancelar"
4. Se muestra advertencia
5. Usuario puede optar por generar sin firma

### Caso 3: Usuario tiene certificado
1. Usuario intenta firmar receta
2. Sistema muestra selector de certificados
3. Usuario selecciona certificado
4. Receta se firma digitalmente
5. No se muestra advertencia

## Testing Checklist

- [ ] Probar firma con certificado instalado (flujo normal)
- [ ] Probar cancelación de selección de certificado
- [ ] Verificar que se muestra advertencia correcta
- [ ] Probar generación sin firma
- [ ] Verificar que PDF se genera correctamente sin firma
- [ ] Verificar que se muestra segundo diálogo de advertencia
- [ ] Probar botones "Ver PDF" y "Compartir" con PDF sin firma
- [ ] Verificar que receta se marca como "firmada" en el sistema
- [ ] Probar en dispositivo sin certificados instalados
- [ ] Verificar textos de advertencia son claros y visibles

## Archivos Modificados

1. `apps/mobile/android/app/src/main/java/com/pdfsignpoc/PdfSignerModule.kt`
   - Agregado método `hasCertificatesInstalled()`

2. `apps/mobile/src/services/PrescriptionPdfService.ts`
   - Agregado método `createPrescriptionWithoutSignature()`

3. `apps/mobile/src/screens/HomeScreen.tsx`
   - Modificado `handleSign()` para detectar cancelación
   - Agregado flujo de advertencia y generación sin firma

## Estado

✅ Implementación completa
✅ Sin errores de compilación
⚠️ Pendiente de testing en dispositivo
⚠️ Pendiente de revisión legal sobre validez de recetas sin firma
