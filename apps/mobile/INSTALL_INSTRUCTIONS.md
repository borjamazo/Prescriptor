# Instrucciones de Instalación - Dependencias Nuevas

## Nuevas Dependencias Agregadas

Se han agregado las siguientes dependencias:
1. `@react-native-community/datetimepicker` - Selector de fecha
2. `react-native-signature-canvas` - Canvas para capturar firma
3. `react-native-webview` - Requerido por signature-canvas

## Pasos de Instalación

### 1. Instalar dependencias de Node
```bash
cd apps/mobile
bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && npm install'
```

### 2. Instalar pods de iOS (solo si desarrollas para iOS)
```bash
cd ios
pod install
cd ..
```

### 3. Limpiar y reconstruir

**Para Android:**
```bash
# Limpiar build anterior
cd android
./gradlew clean
cd ..

# Ejecutar app
npm run android
```

**Para iOS:**
```bash
# Limpiar build anterior
cd ios
xcodebuild clean
cd ..

# Ejecutar app
npm run ios
```

## Verificación

Después de instalar, verifica que:
1. La app compila sin errores
2. El campo "Fecha de Nacimiento" muestra un selector de fecha al hacer clic
3. El selector es nativo del sistema (Android o iOS)
4. La fecha se formatea correctamente a DD/MM/YYYY
5. La pantalla de firma se abre sin errores
6. Puedes dibujar con el dedo en el canvas

## Problemas Comunes

### Error: "Cannot find module '@react-native-community/datetimepicker'"
**Solución:** Ejecuta `npm install` nuevamente

### Error: "Cannot find module 'react-native-webview'"
**Solución:** Ejecuta `npm install` nuevamente y reconstruye la app

### Error en iOS: "Pod not found"
**Solución:** 
```bash
cd ios
pod install --repo-update
cd ..
```

### Error en Android: "Task failed"
**Solución:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Error: "RNCWebViewModule could not be found"
**Solución:**
1. Asegúrate de haber ejecutado `npm install`
2. Limpia el build: `cd android && ./gradlew clean && cd ..`
3. Reconstruye: `npm run android`
4. Si persiste, elimina `node_modules` y reinstala:
   ```bash
   rm -rf node_modules
   npm install
   npm run android
   ```

## Notas

- Node version requerida: 20.19.3
- Las dependencias son compatibles con React Native 0.83.1
- `react-native-webview` requiere configuración automática (ya incluida)
- No requiere configuración adicional en AndroidManifest.xml o Info.plist

