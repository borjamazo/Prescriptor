# Fix: Error RNCWebViewModule not found

## Problema
Al intentar abrir la pantalla de firma/rúbrica, la aplicación mostraba el siguiente error:

```
Invariant Violation: TurboModuleRegistry.getEnforcing(...): 
'RNCWebViewModule' could not be found. 
Verify that a module by this name is registered in the native binary.
```

## Causa
La librería `react-native-signature-canvas` depende de `react-native-webview`, pero esta dependencia no estaba instalada en el proyecto.

## Solución

### 1. Agregar Dependencia
Se agregó `react-native-webview` al `package.json`:

```json
"react-native-webview": "^13.12.3"
```

### 2. Instalar Dependencias
```bash
cd apps/mobile
bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && npm install'
```

### 3. Limpiar y Reconstruir (Android)
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 4. Instalar Pods y Reconstruir (iOS)
```bash
cd ios
pod install
cd ..
npm run ios
```

## Dependencias de Firma/Rúbrica

La funcionalidad de firma requiere las siguientes dependencias:

1. **react-native-signature-canvas** (^4.7.2)
   - Proporciona el canvas para dibujar la firma
   - Usa WebView internamente para renderizar el canvas HTML5

2. **react-native-webview** (^13.12.3)
   - Requerido por signature-canvas
   - Proporciona el componente WebView nativo

3. **react-native-fs** (^2.20.0)
   - Ya estaba instalado
   - Usado para guardar la imagen de firma en el sistema de archivos

## Verificación

Después de instalar y reconstruir, verifica que:
- ✅ La app compila sin errores
- ✅ Puedes navegar a Settings → Firma / Rúbrica
- ✅ La pantalla de firma se abre correctamente
- ✅ Puedes dibujar con el dedo en el canvas
- ✅ El botón "Guardar Firma" funciona
- ✅ La firma se guarda correctamente

## Archivos Modificados

1. `apps/mobile/package.json`
   - Agregada dependencia `react-native-webview`

2. `apps/mobile/INSTALL_INSTRUCTIONS.md`
   - Actualizado con nueva dependencia
   - Agregadas instrucciones de troubleshooting

## Commit
```
fix: Agregar react-native-webview como dependencia requerida

- Agregar react-native-webview ^13.12.3 (requerido por signature-canvas)
- Actualizar INSTALL_INSTRUCTIONS.md con nueva dependencia
- Agregar solución para error RNCWebViewModule not found
```

## Estado
✅ Dependencia agregada
✅ Documentación actualizada
✅ Cambios pusheados a git
⚠️ Requiere `npm install` y rebuild en dispositivos de desarrollo
