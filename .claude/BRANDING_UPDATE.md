# Actualización Completa de Branding

## Resumen

Se ha actualizado completamente el branding de la app Prescriptor con el nuevo logo en todos los componentes visuales.

## Logo Nuevo

**Archivo**: `apps/mobile/assets/app-logo.png`
- **Tamaño**: 2048x2048 píxeles
- **Formato**: PNG con transparencia (RGBA)
- **Peso**: 383KB
- **Fecha**: 24 de febrero de 2026

## Componentes Actualizados

### 1. Splash Screens ✅

**Total**: 10 archivos (5 Android + 5 iOS)

- Fondo blanco con logo centrado
- Tamaños proporcionales según densidad de pantalla
- Formato JPEG optimizado

**Documentación**: [SPLASH_SCREENS_UPDATE.md](./SPLASH_SCREENS_UPDATE.md)

**Comando**: `npm run generate:splash`

### 2. Iconos de la App ✅

**Total**: 25 archivos (7 Android + 18 iOS)

- Android: 5 densidades mipmap + 2 componentes adaptativos
- iOS: 18 tamaños diferentes (20px a 1024px)
- Alta calidad con algoritmo LANCZOS

**Documentación**: [APP_ICONS_UPDATE.md](./APP_ICONS_UPDATE.md)

**Comando**: `npm run generate:icons`

### 3. Bootsplash ✅

**Total**: 5 archivos

- Logo para react-native-bootsplash
- Múltiples densidades (@1x, @1.5x, @2x, @3x, @4x)
- Ya estaba actualizado previamente

**Ubicación**: `apps/mobile/assets/bootsplash/`

## Scripts de Generación

Se crearon dos scripts Python para automatizar la generación de assets:

### 1. generate-splash-screens.py

Genera splash screens para Android e iOS:
- Crea fondos blancos del tamaño correcto
- Centra el logo proporcionalmente
- Exporta como JPEG optimizado (calidad 85%)

### 2. generate-app-icons.py

Genera iconos de la app para Android e iOS:
- Redimensiona con algoritmo LANCZOS (alta calidad)
- Android: RGBA (con transparencia)
- iOS: RGB (sin transparencia, según requerimientos de Apple)
- Genera componentes adaptativos para Android 8.0+

## Comandos NPM

Se agregaron dos comandos al `package.json`:

```json
{
  "scripts": {
    "generate:splash": "python3 scripts/generate-splash-screens.py",
    "generate:icons": "python3 scripts/generate-app-icons.py"
  }
}
```

## Uso

### Regenerar Splash Screens

```bash
cd apps/mobile
npm run generate:splash
```

### Regenerar Iconos de la App

```bash
cd apps/mobile
npm run generate:icons
```

### Regenerar Todo

```bash
cd apps/mobile
npm run generate:splash
npm run generate:icons
```

## Después de Actualizar

Para ver los cambios en la app:

1. **Limpiar build de Android**:
   ```bash
   cd apps/mobile/android
   ./gradlew clean
   cd ..
   ```

2. **Recompilar la app**:
   ```bash
   npm run android
   ```

3. **Verificar**:
   - Icono de la app en el launcher
   - Splash screen al abrir la app
   - Bootsplash durante la carga

## Estructura de Archivos

```
apps/mobile/
├── assets/
│   ├── app-logo.png                    # Logo fuente (2048x2048)
│   ├── bootsplash/                     # Logos para bootsplash
│   │   ├── logo.png
│   │   ├── logo@1,5x.png
│   │   ├── logo@2x.png
│   │   ├── logo@3x.png
│   │   └── logo@4x.png
│   └── splash_screens/                 # Splash screens generados
│       ├── android/
│       │   ├── drawable-mdpi/splash.jpg
│       │   ├── drawable-hdpi/splash.jpg
│       │   ├── drawable-xhdpi/splash.jpg
│       │   ├── drawable-xxhdpi/splash.jpg
│       │   └── drawable-xxxhdpi/splash.jpg
│       └── ios/
│           ├── splash@1x.jpg
│           ├── splash@2x.jpg
│           ├── splash@3x.jpg
│           ├── splash_ipad@1x.jpg
│           └── splash_ipad@2x.jpg
├── android/app/src/main/res/
│   ├── mipmap-mdpi/ic_launcher.png     # Iconos Android
│   ├── mipmap-hdpi/ic_launcher.png
│   ├── mipmap-xhdpi/ic_launcher.png
│   ├── mipmap-xxhdpi/ic_launcher.png
│   ├── mipmap-xxxhdpi/ic_launcher.png
│   └── drawable/
│       ├── ic_launcher_foreground.png  # Icono adaptativo
│       └── ic_launcher_background.png
├── ios/PdfSignPOC/Images.xcassets/
│   └── AppIcon.appiconset/             # Iconos iOS (18 archivos)
│       ├── Icon-20-ipad.png
│       ├── Icon-20@2x-ipad.png
│       ├── ...
│       └── Icon-1024.png
└── scripts/
    ├── generate-splash-screens.py      # Script para splash screens
    └── generate-app-icons.py           # Script para iconos
```

## Requisitos

- **Python 3.x**: Para ejecutar los scripts
- **Pillow (PIL)**: Se instala automáticamente si no está disponible
- **Logo fuente**: `app-logo.png` debe existir en `assets/`

## Características Técnicas

### Splash Screens

- **Formato**: JPEG
- **Calidad**: 85%
- **Fondo**: Blanco (#FFFFFF)
- **Logo**: Centrado y escalado proporcionalmente
- **Optimización**: Flag `optimize=True` en PIL

### Iconos Android

- **Formato**: PNG RGBA (con transparencia)
- **Redimensionamiento**: Algoritmo LANCZOS
- **Icono adaptativo**: Foreground (432x432) + Background (432x432)
- **Área segura**: 288x288 dentro de 432x432

### Iconos iOS

- **Formato**: PNG RGB (sin transparencia)
- **Fondo**: Blanco para preservar el logo
- **Redimensionamiento**: Algoritmo LANCZOS
- **App Store**: Icono de 1024x1024 incluido

## Verificación

### Verificar que los archivos existen

```bash
# Splash screens
ls -1 apps/mobile/assets/splash_screens/android/drawable-*/splash.jpg
ls -1 apps/mobile/assets/splash_screens/ios/splash*.jpg

# Iconos Android
ls -1 apps/mobile/android/app/src/main/res/mipmap-*/ic_launcher.png

# Iconos iOS
ls -1 apps/mobile/ios/PdfSignPOC/Images.xcassets/AppIcon.appiconset/Icon-*.png
```

### Verificar dimensiones

```bash
# Splash screen
file apps/mobile/assets/splash_screens/android/drawable-mdpi/splash.jpg

# Icono Android
file apps/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png

# Icono iOS
file apps/mobile/ios/PdfSignPOC/Images.xcassets/AppIcon.appiconset/Icon-1024.png
```

## Resultado Final

✅ **35 archivos actualizados en total**

- 10 splash screens (5 Android + 5 iOS)
- 25 iconos de app (7 Android + 18 iOS)
- 5 logos bootsplash (ya actualizados)

## Próximos Pasos

1. ✅ Splash screens actualizados
2. ✅ Iconos de la app actualizados
3. ✅ Scripts de generación creados
4. ✅ Comandos npm agregados
5. ✅ Documentación completa

**Pendiente**:
- Probar en dispositivo real
- Verificar icono adaptativo en Android 8.0+
- Verificar splash screens en diferentes densidades
- Generar release build con nuevo branding

## Solución de Problemas

### Los cambios no se ven en la app

```bash
# Desinstalar app del dispositivo
adb uninstall com.pdfsignpoc

# Limpiar build
cd apps/mobile/android
./gradlew clean
cd ..

# Recompilar
npm run android
```

### Error al ejecutar scripts Python

```bash
# Instalar Pillow manualmente
python3 -m pip install --user --break-system-packages Pillow

# Ejecutar script
python3 scripts/generate-splash-screens.py
python3 scripts/generate-app-icons.py
```

### Logo fuente no encontrado

Asegúrate de que `apps/mobile/assets/app-logo.png` existe y es de alta resolución (mínimo 1024x1024, recomendado 2048x2048).

## Documentación Relacionada

- [SPLASH_SCREENS_UPDATE.md](./SPLASH_SCREENS_UPDATE.md) - Detalles de splash screens
- [APP_ICONS_UPDATE.md](./APP_ICONS_UPDATE.md) - Detalles de iconos de la app
- [RELEASE_BUILD_GUIDE.md](./RELEASE_BUILD_GUIDE.md) - Cómo generar release build

## Comandos Rápidos

```bash
# Regenerar todo el branding
cd apps/mobile
npm run generate:splash && npm run generate:icons

# Limpiar y recompilar
cd android && ./gradlew clean && cd .. && npm run android

# Verificar archivos generados
ls -lh assets/splash_screens/android/drawable-*/splash.jpg
ls -lh android/app/src/main/res/mipmap-*/ic_launcher.png
ls -lh ios/PdfSignPOC/Images.xcassets/AppIcon.appiconset/Icon-*.png
```

---

**Fecha de actualización**: 25 de febrero de 2026
**Logo utilizado**: `app-logo.png` (2048x2048, 383KB)
**Total de archivos actualizados**: 35
**Scripts creados**: 2
**Comandos npm agregados**: 2
