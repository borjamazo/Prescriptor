# Release v0.0.3 - Nuevo Branding

## Información de la Release

- **Versión**: 0.0.3
- **Fecha**: 25 de febrero de 2026
- **Tamaño**: 302.19 MB
- **Archivo**: `apps/mobile/PrescriptorApp-v0.0.3.apk`
- **versionCode**: 3
- **versionName**: "0.0.3"

## Cambios en esta Versión

### 🎨 Actualización Completa de Branding

1. **Nuevo Logo de la App**
   - Icono actualizado en todas las densidades de Android (mdpi a xxxhdpi)
   - Icono actualizado en todos los tamaños de iOS (20px a 1024px)
   - Icono adaptativo para Android 8.0+ (foreground + background)
   - Total: 25 iconos actualizados

2. **Nuevos Splash Screens**
   - Splash screens actualizados para Android (5 densidades)
   - Splash screens actualizados para iOS (5 tamaños)
   - Fondo blanco con logo centrado
   - Total: 10 splash screens actualizados

3. **Modo Debug Desactivado**
   - El modo debug está desactivado en esta release
   - No se mostrarán los botones de "Regenerar PDF" y "Compartir" en modo debug
   - Producción lista para uso

## Instalación

### Opción 1: Instalación con ADB (Recomendado)

```bash
# Conecta tu dispositivo Android por USB
# Asegúrate de tener USB debugging habilitado

# Instalar el APK
adb install apps/mobile/PrescriptorApp-v0.0.3.apk

# Si ya tienes una versión anterior instalada, usa -r para reinstalar
adb install -r apps/mobile/PrescriptorApp-v0.0.3.apk
```

### Opción 2: Instalación Manual

1. Copia el archivo `PrescriptorApp-v0.0.3.apk` a tu dispositivo Android
2. Abre el archivo desde el explorador de archivos
3. Permite la instalación de fuentes desconocidas si es necesario
4. Sigue las instrucciones en pantalla

### Opción 3: Desinstalar e Instalar Limpio

Si tienes problemas con la actualización:

```bash
# Desinstalar versión anterior
adb uninstall com.pdfsignpoc

# Instalar nueva versión
adb install apps/mobile/PrescriptorApp-v0.0.3.apk
```

## Verificación

### 1. Verificar el Nuevo Icono

- **Launcher**: Abre el drawer de apps y busca "Prescriptor"
- **Icono**: Deberías ver el nuevo logo de Prescriptor
- **Android 8.0+**: El icono adaptativo debería verse bien en diferentes formas (círculo, cuadrado, etc.)

### 2. Verificar el Splash Screen

- **Abre la app**: Al abrir, deberías ver el splash screen con el nuevo logo
- **Fondo blanco**: El splash screen tiene fondo blanco con el logo centrado
- **Transición**: Debería haber una transición suave al contenido de la app

### 3. Verificar Modo Debug

- **Crea una receta**: Ve a "Crear Receta" y crea una nueva
- **Verifica la card**: En la lista de recetas, NO deberías ver la sección amarilla "🔧 DEBUG MODE"
- **Botones**: Solo deberías ver los botones "Firmar" y "Compartir" (no "Regenerar PDF")

### 4. Verificar Funcionalidad

- ✅ Crear recetas
- ✅ Firmar recetas
- ✅ Compartir recetas firmadas
- ✅ Gestionar talonarios
- ✅ Ver estadísticas
- ✅ Sincronización con Supabase

## Comparación con Versiones Anteriores

| Característica | v0.0.2 | v0.0.3 |
|----------------|--------|--------|
| Icono de la app | Logo antiguo | ✅ Logo nuevo |
| Splash screens | Logo antiguo | ✅ Logo nuevo |
| Modo debug | Activo | ✅ Desactivado |
| versionCode | 2 | 3 |
| Tamaño APK | 302 MB | 302 MB |

## Problemas Conocidos

Ninguno reportado en esta versión.

## Solución de Problemas

### El icono no cambia después de instalar

1. Desinstala completamente la app anterior:
   ```bash
   adb uninstall com.pdfsignpoc
   ```

2. Reinicia el dispositivo

3. Instala la nueva versión:
   ```bash
   adb install apps/mobile/PrescriptorApp-v0.0.3.apk
   ```

### El splash screen no se ve

- Asegúrate de que la app se instaló correctamente
- Cierra completamente la app y ábrela de nuevo
- Verifica que no haya errores en los logs

### La app no se instala

- Verifica que tienes espacio suficiente (al menos 500 MB libres)
- Asegúrate de que USB debugging está habilitado
- Intenta desinstalar la versión anterior primero

## Logs y Debugging

Si encuentras problemas, puedes ver los logs con:

```bash
# Ver logs en tiempo real
adb logcat | grep -E "PdfSignPOC|ReactNative"

# Ver logs de la app
adb logcat -s ReactNativeJS:V

# Limpiar logs y ver solo nuevos
adb logcat -c && adb logcat
```

## Archivos de la Release

```
apps/mobile/
├── PrescriptorApp-v0.0.3.apk          # APK de release (302 MB)
├── android/app/build/outputs/apk/release/
│   └── app-release.apk                # APK original de Gradle
└── package.json                       # version: "0.0.3"
```

## Próxima Versión

Para la próxima release (v0.0.4):

```bash
cd apps/mobile

# Incrementar versión
npm run version:patch

# Generar release
npm run build:android
```

## Notas Técnicas

### Build Configuration

- **Gradle**: 9.0.0
- **Android Gradle Plugin**: Compatible
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)
- **Compile SDK**: 34

### Optimizaciones

- **ProGuard**: Habilitado en release
- **Shrink Resources**: Habilitado
- **Minify**: Habilitado
- **Debug Mode**: Deshabilitado automáticamente

### Firma

- **Keystore**: Debug keystore (para testing)
- **Producción**: Requiere keystore de producción para Play Store

## Comandos Útiles

```bash
# Ver información del dispositivo
adb devices

# Ver versión instalada
adb shell dumpsys package com.pdfsignpoc | grep versionName

# Tomar screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# Grabar video
adb shell screenrecord /sdcard/demo.mp4
# (Ctrl+C para detener)
adb pull /sdcard/demo.mp4
```

## Checklist de Verificación

Antes de aprobar esta release, verifica:

- [ ] El icono de la app muestra el nuevo logo
- [ ] El splash screen muestra el nuevo logo con fondo blanco
- [ ] No hay sección de debug mode visible
- [ ] Se pueden crear recetas correctamente
- [ ] Se pueden firmar recetas correctamente
- [ ] Se pueden compartir recetas firmadas
- [ ] Los talonarios funcionan correctamente
- [ ] Las estadísticas se muestran correctamente
- [ ] La sincronización con Supabase funciona
- [ ] No hay crashes al abrir la app
- [ ] No hay crashes al usar funcionalidades principales

## Contacto

Si encuentras algún problema con esta release, documenta:
- Versión de Android del dispositivo
- Modelo del dispositivo
- Pasos para reproducir el problema
- Logs de la app (si es posible)

---

**Release generada**: 25 de febrero de 2026, 08:28
**Build time**: 56 segundos
**Status**: ✅ Build exitoso
**Debug mode**: ❌ Desactivado (como debe ser en release)
