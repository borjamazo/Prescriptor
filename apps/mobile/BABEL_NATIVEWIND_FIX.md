# Babel & NativeWind Configuration Fix

## Problema
La app crasheaba al iniciar con error de Babel:
```
[BABEL] index.js: .plugins is not a valid Plugin property
```

## Causa
- NativeWind y Tailwind CSS estaban instalados pero mal configurados
- Referencias a `nativewind/babel` en `babel.config.js`
- Referencias a `nativewind/metro` en `metro.config.js`
- Importación de `./global.css` en `App.tsx`

## Solución

### 1. Desinstalar NativeWind y Tailwind
```bash
npm uninstall nativewind tailwindcss
```

### 2. Limpiar babel.config.js
Eliminada la referencia al plugin de NativeWind:
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
};
```

### 3. Limpiar metro.config.js
Eliminada la configuración de NativeWind:
```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const os = require('os');

// Polyfill for Node.js compatibility
if (!os.availableParallelism) {
  os.availableParallelism = () => os.cpus().length;
}

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

### 4. Eliminar importación de CSS en App.tsx
Eliminada la línea:
```javascript
import './global.css';
```

### 5. Configurar ADB reverse
Para conectar el dispositivo físico con Metro:
```bash
adb reverse tcp:8081 tcp:8081
```

## Resultado
✅ Metro bundler funcionando correctamente
✅ App cargando sin errores
✅ Bundle completado: 910 módulos
✅ Navegación con bottom tabs funcionando

## Comandos para ejecutar la app

### Iniciar Metro (con Node 20.19.3)
```bash
npm start
```

### En otra terminal, ejecutar en Android
```bash
adb reverse tcp:8081 tcp:8081
npm run android
```

O simplemente:
```bash
npm run android
```
(Los scripts ya incluyen el cambio automático a Node 20.19.3)
