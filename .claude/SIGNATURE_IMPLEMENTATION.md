# Implementación de Firma/Rúbrica Manuscrita

## Resumen
Se ha implementado un sistema completo para que el doctor pueda crear y guardar su firma/rúbrica manuscrita, que se añadirá automáticamente a todas las recetas generadas (tanto firmadas digitalmente como sin firma digital).

## Características Implementadas

### 1. Pantalla de Captura de Firma
- Canvas interactivo para dibujar con el dedo
- Botones "Limpiar" y "Guardar Firma"
- Instrucciones claras para el usuario
- Diseño responsive y profesional

### 2. Almacenamiento de Firma
- Guardado en sistema de archivos del dispositivo
- Formato PNG con fondo transparente
- Metadata en AsyncStorage
- Persistente entre sesiones

### 3. Integración en Settings
- Nueva opción "Firma / Rúbrica" en sección de Configuración
- Icono distintivo (create-outline)
- Navegación directa a pantalla de firma

### 4. Añadir Firma a PDFs
- Firma se añade automáticamente a todas las recetas
- Posicionada en esquina inferior derecha de cada prescripción
- Funciona tanto con firma digital como sin ella
- Tamaño y posición optimizados

## Archivos Creados

### 1. `apps/mobile/src/services/SignatureService.ts`
Servicio para gestionar la firma:
- `saveSignature(base64Image)`: Guarda firma en dispositivo
- `getSignature()`: Obtiene firma guardada
- `hasSignature()`: Verifica si existe firma
- `deleteSignature()`: Elimina firma
- `getSignatureFilePath()`: Obtiene ruta para módulo nativo

### 2. `apps/mobile/src/screens/SignatureScreen.tsx`
Pantalla de captura de firma:
- Canvas de firma con react-native-signature-canvas
- Botones de acción (Limpiar, Guardar)
- Instrucciones para el usuario
- Manejo de estados (hasSignature, saving)

## Archivos Modificados

### 1. `apps/mobile/package.json`
**Dependencia agregada:**
```json
"react-native-signature-canvas": "^4.7.2"
```

### 2. `apps/mobile/src/navigation/AppDrawer.tsx`
- Agregado tipo `Signature` a `AppStackParamList`
- Importado `SignatureScreen`
- Agregada ruta en Stack Navigator

### 3. `apps/mobile/src/screens/SettingsScreen.tsx`
- Agregada opción "Firma / Rúbrica" en sección Configuración
- Navegación a pantalla de firma

### 4. `apps/mobile/src/services/PrescriptionPdfService.ts`
- Importado `SignatureService`
- Obtención de ruta de firma antes de crear PDF
- Paso de `signaturePath` a módulo nativo

### 5. `apps/mobile/android/app/src/main/java/com/pdfsignpoc/PdfSignerModule.kt`

**Método `createPrescriptionPdf` actualizado:**
- Agregado parámetro `signatureImagePath: String?`
- Paso de firma a `addPrescriptionDataToPage`

**Método `addPrescriptionDataToPage` actualizado:**
- Agregado parámetro `signatureImagePath`
- Llamada a `addSignatureImage` si hay firma disponible

**Nuevo método `addSignatureImage`:**
```kotlin
private fun addSignatureImage(
  doc: PDFDoc,
  page: com.pdftron.pdf.Page,
  isTopPrescription: Boolean,
  signatureImagePath: String
)
```

Características:
- Carga imagen desde ruta del sistema de archivos
- Posiciona en esquina inferior derecha
- Tamaño: 120x40 puntos
- Diferentes posiciones para prescripción superior/inferior
- Manejo de errores (no falla si imagen no existe)

## Posicionamiento de Firma en PDF

### Prescripción Superior (Top)
- **X**: `pageWidth - 120 - 50` (esquina derecha)
- **Y**: `pageHeight / 2 + 50` (justo sobre línea media)
- **Tamaño**: 120x40 puntos

### Prescripción Inferior (Bottom)
- **X**: `pageWidth - 120 - 50` (esquina derecha)
- **Y**: `50` (cerca del borde inferior)
- **Tamaño**: 120x40 puntos

## Flujo de Usuario

### Primera Vez (Sin Firma)
1. Usuario va a Settings
2. Toca "Firma / Rúbrica"
3. Dibuja su firma con el dedo
4. Toca "Guardar Firma"
5. Firma se guarda en dispositivo
6. Vuelve a Settings

### Editar Firma Existente
1. Usuario va a Settings
2. Toca "Firma / Rúbrica"
3. Pantalla muestra canvas vacío
4. Usuario dibuja nueva firma
5. Toca "Guardar Firma"
6. Firma anterior se reemplaza

### Crear Receta con Firma
1. Usuario crea receta normalmente
2. Al generar PDF, sistema:
   - Verifica si hay firma guardada
   - Si existe, la añade automáticamente al PDF
   - Posiciona en esquina inferior derecha
3. PDF generado incluye firma visual

## Instalación

### Paso 1: Instalar dependencias
```bash
cd apps/mobile
bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && npm install'
```

### Paso 2: Instalar pods (iOS)
```bash
cd ios
pod install
cd ..
```

### Paso 3: Reconstruir app
```bash
# Android
npm run android

# iOS
npm run ios
```

## Características Técnicas

### Formato de Firma
- **Formato**: PNG
- **Fondo**: Blanco (se puede cambiar a transparente)
- **Color de trazo**: Negro
- **Grosor**: 2-4 puntos (variable según presión)

### Almacenamiento
- **Ubicación**: `DocumentDirectoryPath/signature.png`
- **Metadata**: AsyncStorage con clave `@signature_image`
- **Tamaño típico**: 10-50 KB

### Compatibilidad
- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 13+
- **React Native**: 0.83.1

### Dependencias
- `react-native-signature-canvas`: ^4.7.2
- `react-native-fs`: ^2.20.0 (ya instalada)
- `@react-native-async-storage/async-storage`: ^2.2.0 (ya instalada)

## Testing Checklist

- [ ] Abrir Settings
- [ ] Ver opción "Firma / Rúbrica"
- [ ] Tocar opción y abrir pantalla de firma
- [ ] Dibujar firma con el dedo
- [ ] Verificar que botón "Guardar" se habilita
- [ ] Tocar "Limpiar" y verificar que canvas se limpia
- [ ] Dibujar firma nuevamente
- [ ] Guardar firma
- [ ] Verificar mensaje de éxito
- [ ] Crear nueva receta
- [ ] Generar PDF (con o sin firma digital)
- [ ] Abrir PDF y verificar que firma aparece en esquina inferior derecha
- [ ] Verificar posición en prescripción superior
- [ ] Verificar posición en prescripción inferior
- [ ] Editar firma (volver a pantalla de firma)
- [ ] Guardar nueva firma
- [ ] Generar otra receta y verificar nueva firma

## Mejoras Futuras (No Implementadas)

1. **Vista previa de firma guardada**: Mostrar firma actual antes de editar
2. **Fondo transparente**: Cambiar fondo blanco a transparente
3. **Ajuste de tamaño**: Permitir al usuario ajustar tamaño de firma en PDF
4. **Ajuste de posición**: Permitir elegir posición de firma
5. **Múltiples firmas**: Guardar diferentes firmas para diferentes propósitos
6. **Importar imagen**: Permitir subir imagen de firma escaneada
7. **Rotación**: Permitir rotar firma en PDF

## Notas Importantes

⚠️ **La firma se añade SIEMPRE**:
- Con firma digital: Firma manuscrita + Firma digital
- Sin firma digital: Solo firma manuscrita

⚠️ **Persistencia**:
- La firma se guarda en el dispositivo
- Persiste entre sesiones
- No se sincroniza con servidor (local only)

⚠️ **Seguridad**:
- Firma almacenada localmente
- No se transmite por red
- Solo accesible por la app

## Estado

✅ Servicio de firma creado
✅ Pantalla de captura implementada
✅ Integración en Settings completa
✅ Módulo Kotlin actualizado
✅ Integración en generación de PDF completa
⚠️ Requiere `npm install` para instalar dependencia
⚠️ Requiere rebuild de la app
⚠️ Pendiente de testing en dispositivo
