# Actualización de Splash Screens

## Resumen

Se han actualizado todos los splash screens de Android e iOS con el logo nuevo (`app-logo.png`).

## Archivos Actualizados

### Android (5 densidades)
- ✅ `assets/splash_screens/android/drawable-mdpi/splash.jpg` (320x480)
- ✅ `assets/splash_screens/android/drawable-hdpi/splash.jpg` (480x800)
- ✅ `assets/splash_screens/android/drawable-xhdpi/splash.jpg` (720x1280)
- ✅ `assets/splash_screens/android/drawable-xxhdpi/splash.jpg` (1080x1920)
- ✅ `assets/splash_screens/android/drawable-xxxhdpi/splash.jpg` (1440x2560)

### iOS (5 tamaños)
- ✅ `assets/splash_screens/ios/splash@1x.jpg` (320x568)
- ✅ `assets/splash_screens/ios/splash@2x.jpg` (640x1136)
- ✅ `assets/splash_screens/ios/splash@3x.jpg` (1242x2208)
- ✅ `assets/splash_screens/ios/splash_ipad@1x.jpg` (768x1024)
- ✅ `assets/splash_screens/ios/splash_ipad@2x.jpg` (1536x2048)

## Características

- **Fondo blanco**: Todos los splash screens tienen fondo blanco limpio
- **Logo centrado**: El logo está perfectamente centrado en cada splash screen
- **Tamaños proporcionales**: El logo se escala proporcionalmente según la densidad de pantalla
- **Alta calidad**: Imágenes JPEG optimizadas con calidad 85%
- **Transparencia preservada**: El logo mantiene su transparencia sobre el fondo blanco

## Script de Generación

Se creó un script Python para generar automáticamente todos los splash screens:

**Ubicación**: `apps/mobile/scripts/generate-splash-screens.py`

### Uso

```bash
# Desde la carpeta apps/mobile
npm run generate:splash

# O directamente con Python
python3 scripts/generate-splash-screens.py
```

### Requisitos

- Python 3.x
- Pillow (PIL) - Se instala automáticamente si no está disponible

### Cómo Funciona

1. **Lee el logo**: Carga `assets/app-logo.png` (2048x2048)
2. **Crea fondo blanco**: Genera un canvas blanco del tamaño especificado
3. **Redimensiona el logo**: Escala el logo manteniendo la proporción
4. **Centra el logo**: Calcula la posición central y coloca el logo
5. **Guarda como JPEG**: Exporta con calidad 85% y optimización

## Configuración de Tamaños

Los tamaños del logo se calculan proporcionalmente:

### Android
- **mdpi** (320x480): Logo 120px
- **hdpi** (480x800): Logo 180px
- **xhdpi** (720x1280): Logo 270px
- **xxhdpi** (1080x1920): Logo 400px
- **xxxhdpi** (1440x2560): Logo 540px

### iOS
- **@1x** (320x568): Logo 120px
- **@2x** (640x1136): Logo 240px
- **@3x** (1242x2208): Logo 460px
- **iPad @1x** (768x1024): Logo 280px
- **iPad @2x** (1536x2048): Logo 560px

## Regenerar Splash Screens

Si necesitas actualizar el logo en el futuro:

1. **Reemplaza el logo**: Actualiza `assets/app-logo.png` con el nuevo logo
2. **Ejecuta el script**: `npm run generate:splash`
3. **Verifica los resultados**: Los splash screens se actualizarán automáticamente

## Archivos Relacionados

- **Logo fuente**: `apps/mobile/assets/app-logo.png` (2048x2048, 383KB)
- **Script de generación**: `apps/mobile/scripts/generate-splash-screens.py`
- **Script Node.js (alternativo)**: `apps/mobile/scripts/generate-splash-screens.js`

## Notas Técnicas

### Por qué Python en lugar de Node.js

- **PIL/Pillow**: Librería madura y potente para manipulación de imágenes
- **Fácil instalación**: Se instala automáticamente si no está disponible
- **Mejor manejo de transparencia**: PIL maneja mejor las imágenes RGBA
- **Redimensionamiento de calidad**: Algoritmo LANCZOS para mejor calidad

### Formato JPEG vs PNG

- **JPEG**: Menor tamaño de archivo, suficiente para splash screens
- **Calidad 85%**: Balance óptimo entre calidad y tamaño
- **Optimización**: Flag `optimize=True` reduce aún más el tamaño

## Verificación

Para verificar que los splash screens se generaron correctamente:

```bash
# Ver tamaños de archivos
ls -lh assets/splash_screens/android/drawable-*/splash.jpg
ls -lh assets/splash_screens/ios/splash*.jpg

# Ver dimensiones de imágenes
file assets/splash_screens/android/drawable-mdpi/splash.jpg
file assets/splash_screens/ios/splash@2x.jpg
```

## Resultado

✅ **10/10 splash screens generados exitosamente**

Todos los splash screens ahora muestran el logo nuevo de Prescriptor centrado en un fondo blanco limpio.

## Próximos Pasos

1. **Probar en dispositivos**: Verifica que los splash screens se vean correctamente
2. **Ajustar tamaños si es necesario**: Modifica los valores de `logo_size` en el script
3. **Considerar colores de fondo**: Si prefieres otro color, cambia `'white'` en el script

## Comandos Útiles

```bash
# Regenerar todos los splash screens
npm run generate:splash

# Ver información de un splash screen
file assets/splash_screens/android/drawable-mdpi/splash.jpg

# Comparar tamaños antes y después
du -h assets/splash_screens/android/drawable-*/splash.jpg
du -h assets/splash_screens/ios/splash*.jpg
```

---

**Fecha de actualización**: 25 de febrero de 2026
**Logo utilizado**: `app-logo.png` (2048x2048)
**Total de archivos actualizados**: 10 (5 Android + 5 iOS)
