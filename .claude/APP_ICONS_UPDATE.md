# Actualización de Iconos de la App

## Resumen

Se han actualizado todos los iconos de la app para Android e iOS con el logo nuevo (`app-logo.png`).

## Archivos Actualizados

### Android (5 densidades + componentes adaptativos)

#### Iconos principales (mipmap)
- ✅ `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- ✅ `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- ✅ `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- ✅ `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- ✅ `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

#### Componentes de icono adaptativo
- ✅ `android/app/src/main/res/drawable/ic_launcher_foreground.png` (432x432)
- ✅ `android/app/src/main/res/drawable/ic_launcher_background.png` (432x432)

### iOS (18 tamaños)

- ✅ `Icon-20-ipad.png` (20x20)
- ✅ `Icon-20@2x-ipad.png` (40x40)
- ✅ `Icon-20@2x.png` (40x40)
- ✅ `Icon-20@3x.png` (60x60)
- ✅ `Icon-29-ipad.png` (29x29)
- ✅ `Icon-29@2x-ipad.png` (58x58)
- ✅ `Icon-29@2x.png` (58x58)
- ✅ `Icon-29@3x.png` (87x87)
- ✅ `Icon-40-ipad.png` (40x40)
- ✅ `Icon-40@2x-ipad.png` (80x80)
- ✅ `Icon-40@2x.png` (80x80)
- ✅ `Icon-40@3x.png` (120x120)
- ✅ `Icon-60@2x.png` (120x120)
- ✅ `Icon-60@3x.png` (180x180)
- ✅ `Icon-76-ipad.png` (76x76)
- ✅ `Icon-76@2x-ipad.png` (152x152)
- ✅ `Icon-83.5@2x.png` (167x167)
- ✅ `Icon-1024.png` (1024x1024) - App Store

**Ubicación**: `ios/PdfSignPOC/Images.xcassets/AppIcon.appiconset/`

## Características

- **Alta calidad**: Redimensionamiento con algoritmo LANCZOS para máxima calidad
- **Formato correcto**: PNG optimizado para todos los iconos
- **iOS RGB**: Iconos iOS en formato RGB (sin canal alpha) según requerimientos de Apple
- **Android RGBA**: Iconos Android con transparencia preservada
- **Icono adaptativo**: Componentes foreground y background para Android 8.0+

## Script de Generación

Se creó un script Python para generar automáticamente todos los iconos:

**Ubicación**: `apps/mobile/scripts/generate-app-icons.py`

### Uso

```bash
# Desde la carpeta apps/mobile
npm run generate:icons

# O directamente con Python
python3 scripts/generate-app-icons.py
```

### Requisitos

- Python 3.x
- Pillow (PIL) - Se instala automáticamente si no está disponible

### Cómo Funciona

1. **Lee el logo**: Carga `assets/app-logo.png` (2048x2048)
2. **Genera iconos Android**: Crea 5 densidades (mdpi a xxxhdpi)
3. **Genera iconos iOS**: Crea 18 tamaños diferentes (20px a 1024px)
4. **Genera componentes adaptativos**: Foreground y background para Android
5. **Optimiza**: Guarda como PNG optimizado

## Tamaños de Iconos

### Android (mipmap)

| Densidad | Tamaño | Uso |
|----------|--------|-----|
| mdpi | 48x48 | Pantallas de densidad media (~160dpi) |
| hdpi | 72x72 | Pantallas de alta densidad (~240dpi) |
| xhdpi | 96x96 | Pantallas de extra alta densidad (~320dpi) |
| xxhdpi | 144x144 | Pantallas de extra extra alta densidad (~480dpi) |
| xxxhdpi | 192x192 | Pantallas de extra extra extra alta densidad (~640dpi) |

### Android Adaptive Icon

| Componente | Tamaño | Descripción |
|------------|--------|-------------|
| Foreground | 432x432 | Logo con padding (288x288 área segura) |
| Background | 432x432 | Fondo blanco sólido |

### iOS

| Tamaño | Uso |
|--------|-----|
| 20x20 | iPad Notifications |
| 29x29 | iPhone Settings, iPad Settings |
| 40x40 | iPhone Spotlight, iPad Spotlight |
| 60x60 | iPhone Notifications |
| 76x76 | iPad App |
| 83.5x83.5 | iPad Pro App |
| 120x120 | iPhone App (@2x) |
| 180x180 | iPhone App (@3x) |
| 1024x1024 | App Store |

## Iconos Adaptativos de Android

Los iconos adaptativos (Android 8.0+) permiten diferentes formas según el launcher:

- **Foreground**: El logo con padding transparente
- **Background**: Fondo blanco sólido
- **Resultado**: El sistema combina ambos y aplica la forma (círculo, cuadrado, etc.)

### Área Segura

El logo se coloca en un área segura de 288x288 dentro del canvas de 432x432:
- **Padding**: 72px en cada lado
- **Garantiza**: El logo siempre es visible sin importar la forma del icono

## Regenerar Iconos

Si necesitas actualizar el logo en el futuro:

1. **Reemplaza el logo**: Actualiza `assets/app-logo.png` con el nuevo logo
2. **Ejecuta el script**: `npm run generate:icons`
3. **Limpia el build**: `cd android && ./gradlew clean`
4. **Recompila**: `npm run android`

## Verificación

Para verificar que los iconos se generaron correctamente:

```bash
# Ver tamaños de archivos Android
ls -lh android/app/src/main/res/mipmap-*/ic_launcher.png

# Ver tamaños de archivos iOS
ls -lh ios/PdfSignPOC/Images.xcassets/AppIcon.appiconset/Icon-*.png

# Ver dimensiones de un icono
file android/app/src/main/res/mipmap-mdpi/ic_launcher.png
file ios/PdfSignPOC/Images.xcassets/AppIcon.appiconset/Icon-1024.png
```

## Resultado

✅ **25/25 iconos generados exitosamente**

- 5 iconos Android (mipmap)
- 2 componentes adaptativos Android
- 18 iconos iOS

## Próximos Pasos

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

3. **Verificar en dispositivo**: El nuevo icono debería aparecer en el launcher

4. **Probar icono adaptativo**: En Android 8.0+, verifica que el icono se vea bien en diferentes formas

## Notas Técnicas

### Por qué RGB para iOS

Apple requiere que los iconos de la app NO tengan canal alpha (transparencia):
- **Formato**: RGB (sin alpha)
- **Fondo**: El script coloca el logo sobre fondo blanco
- **Resultado**: Iconos que cumplen con las guías de Apple

### Por qué RGBA para Android

Android soporta transparencia en iconos:
- **Formato**: RGBA (con alpha)
- **Transparencia**: Preservada del logo original
- **Resultado**: Iconos con bordes suaves y transparencia

### Icono Adaptativo vs Icono Legacy

- **Android 8.0+**: Usa icono adaptativo (foreground + background)
- **Android 7.1 y anteriores**: Usa iconos mipmap tradicionales
- **Ambos generados**: El script crea ambos tipos

## Solución de Problemas

### El icono no cambia después de recompilar

```bash
# Desinstala la app del dispositivo
adb uninstall com.pdfsignpoc

# Limpia el build
cd android && ./gradlew clean && cd ..

# Recompila e instala
npm run android
```

### El icono se ve pixelado

- Verifica que el logo fuente (`app-logo.png`) sea de alta resolución (2048x2048)
- Regenera los iconos: `npm run generate:icons`

### El icono adaptativo se ve cortado

- El área segura es 288x288 dentro de 432x432
- Si el logo tiene detalles importantes en los bordes, considera agregar más padding

## Archivos Relacionados

- **Logo fuente**: `apps/mobile/assets/app-logo.png` (2048x2048, 383KB)
- **Script de generación**: `apps/mobile/scripts/generate-app-icons.py`
- **Configuración iOS**: `ios/PdfSignPOC/Images.xcassets/AppIcon.appiconset/Contents.json`
- **Configuración Android**: `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`

## Comandos Útiles

```bash
# Regenerar todos los iconos
npm run generate:icons

# Limpiar build de Android
cd android && ./gradlew clean && cd ..

# Recompilar app
npm run android

# Ver información de un icono
file android/app/src/main/res/mipmap-mdpi/ic_launcher.png

# Comparar tamaños
du -h android/app/src/main/res/mipmap-*/ic_launcher.png
du -h ios/PdfSignPOC/Images.xcassets/AppIcon.appiconset/Icon-*.png
```

## Guías de Diseño

### Android
- [Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Icon Design Guidelines](https://material.io/design/iconography/product-icons.html)

### iOS
- [App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Icon Sizes](https://developer.apple.com/design/human-interface-guidelines/app-icons#App-icon-sizes)

---

**Fecha de actualización**: 25 de febrero de 2026
**Logo utilizado**: `app-logo.png` (2048x2048)
**Total de archivos actualizados**: 25 (7 Android + 18 iOS)

## Ver También

- [Actualización de Splash Screens](./SPLASH_SCREENS_UPDATE.md) - Cómo se actualizaron las pantallas de splash
