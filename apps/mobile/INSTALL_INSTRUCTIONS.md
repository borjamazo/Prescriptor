# Instrucciones de Instalación - Selector de Fecha

## Nueva Dependencia Agregada

Se ha agregado `@react-native-community/datetimepicker` para el selector de fecha de nacimiento.

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

## Problemas Comunes

### Error: "Cannot find module '@react-native-community/datetimepicker'"
**Solución:** Ejecuta `npm install` nuevamente

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

## Notas

- Node version requerida: 20.19.3
- La dependencia es compatible con React Native 0.83.1
- No requiere configuración adicional en AndroidManifest.xml o Info.plist
