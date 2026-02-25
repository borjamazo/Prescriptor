# Release v0.0.5 - Splash Screens Fix (FINAL)

## Información de la Release

- **Versión**: 0.0.5
- **Fecha**: 25 de febrero de 2026
- **Tamaño**: 301.95 MB
- **Archivo**: `apps/mobile/PrescriptorApp-v0.0.5.apk`
- **versionCode**: 5
- **versionName**: "0.0.5"

## 🎯 Problema Resuelto

**Problema**: Seguía apareciendo una imagen con el logo antiguo entre el splash inicial y el login.

**Causa**: Los archivos `splash.jpg` en las carpetas `drawable-*` de Android no estaban actualizados. Estos archivos son diferentes a los `bootsplash_logo.png` y se muestran durante la transición.

**Solución**: Actualizar los archivos `splash.jpg` copiándolos desde `assets/splash_screens/android/` a las carpetas `android/app/src/main/res/drawable-*/`.

## Cambios en esta Versión

### 🔧 Fix: Splash Screens Actualizados

**Archivos actualizados**:
- `android/app/src/main/res/drawable-mdpi/splash.jpg`
- `android/app/src/main/res/drawable-hdpi/splash.jpg`
- `android/app/src/main/res/drawable-xhdpi/splash.jpg`
- `android/app/src/main/res/drawable-xxhdpi/splash.jpg`
- `android/app/src/main/res/drawable-xxxhdpi/splash.jpg`

**Antes**: Archivos del 19 de febrero (logo antiguo)
**Después**: Archivos del 25 de febrero (logo nuevo)

### 📜 Nuevo Script

**Script**: `update-splash-android.js`
- Copia automáticamente los splash screens a Android
- Mapea correctamente las densidades (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Comando: `npm run update:splash`

## Branding Completo - Resumen Final

Ahora TODOS los logos están actualizados:

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| **Icono de la app** | ✅ Actualizado | `mipmap-*/ic_launcher.png` |
| **Icono adaptativo** | ✅ Actualizado | `drawable/ic_launcher_foreground.png` |
| **Bootsplash logo** | ✅ Actualizado | `drawable-*/bootsplash_logo.png` |
| **Splash screens** | ✅ Actualizado | `drawable-*/splash.jpg` |
| **Versión en Login** | ✅ Dinámico | Desde `package.json` (0.0.5) |

## Instalación

### Opción 1: Con ADB (Recomendado)

```bash
adb install apps/mobile/PrescriptorApp-v0.0.5.apk

# Si ya tienes una versión anterior, usa -r para actualizar
adb install -r apps/mobile/PrescriptorApp-v0.0.5.apk
```

### Opción 2: Instalación Limpia (Recomendado para ver cambios)

```bash
# Desinstala la versión anterior
adb uninstall com.pdfsignpoc

# Instala la nueva versión
adb install apps/mobile/PrescriptorApp-v0.0.5.apk
```

## Verificación

### 1. Secuencia Completa de Logos

Al abrir la app, deberías ver esta secuencia:

1. **Splash inicial del sistema** → Logo nuevo (icono de la app)
2. **Bootsplash** → Logo nuevo centrado con fondo blanco
3. **Splash screen** → Logo nuevo centrado con fondo blanco (este era el problema)
4. **Login screen** → Logo nuevo + "Versión 0.0.5"

### 2. NO Deberías Ver

- ❌ Logo antiguo en ningún momento
- ❌ Transiciones con logos diferentes
- ❌ Versión hardcodeada (2.1.0)

### 3. Verificar Funcionalidad

- ✅ Crear recetas
- ✅ Firmar recetas
- ✅ Compartir recetas firmadas
- ✅ Gestionar talonarios
- ✅ Ver estadísticas
- ✅ Sincronización con Supabase

## Comparación con Versiones Anteriores

| Característica | v0.0.3 | v0.0.4 | v0.0.5 |
|----------------|--------|--------|--------|
| Icono de la app | ✅ Nuevo | ✅ Nuevo | ✅ Nuevo |
| Bootsplash logo | ❌ Antiguo | ✅ Nuevo | ✅ Nuevo |
| Splash screens | ❌ Antiguo | ❌ Antiguo | ✅ Nuevo |
| Versión en Login | ❌ Hardcoded | ✅ Dinámico | ✅ Dinámico |
| Debug Mode | ✅ Desactivado | ✅ Desactivado | ✅ Desactivado |

## Scripts Disponibles

### Actualizar Assets de Branding

```bash
cd apps/mobile

# Actualizar bootsplash logos
npm run update:bootsplash

# Actualizar splash screens
npm run update:splash

# Regenerar splash screens desde el logo
npm run generate:splash

# Regenerar iconos desde el logo
npm run generate:icons
```

## Archivos Modificados

### Scripts Nuevos
- `apps/mobile/scripts/update-splash-android.js` (nuevo)
- `apps/mobile/package.json` (agregado comando `update:splash`)

### Recursos Android Actualizados
- `android/app/src/main/res/drawable-mdpi/splash.jpg` (actualizado)
- `android/app/src/main/res/drawable-hdpi/splash.jpg` (actualizado)
- `android/app/src/main/res/drawable-xhdpi/splash.jpg` (actualizado)
- `android/app/src/main/res/drawable-xxhdpi/splash.jpg` (actualizado)
- `android/app/src/main/res/drawable-xxxhdpi/splash.jpg` (actualizado)

## Comandos Útiles

### Verificar que los Archivos Están Actualizados

```bash
cd apps/mobile

# Ver fechas de modificación
ls -lh android/app/src/main/res/drawable-*/splash.jpg

# Comparar MD5 (deben ser iguales)
md5 assets/splash_screens/android/drawable-mdpi/splash.jpg
md5 android/app/src/main/res/drawable-mdpi/splash.jpg
```

### Generar Nueva Release

```bash
cd apps/mobile

# Incrementar versión
npm run version:patch  # 0.0.5 → 0.0.6

# Generar APK
npm run build:android
```

## Solución de Problemas

### Sigue apareciendo el logo antiguo

1. **Desinstala completamente la app**:
   ```bash
   adb uninstall com.pdfsignpoc
   ```

2. **Limpia el build**:
   ```bash
   cd apps/mobile/android
   ./gradlew clean
   cd ..
   ```

3. **Verifica que los splash screens están actualizados**:
   ```bash
   ls -lh android/app/src/main/res/drawable-*/splash.jpg
   # Todos deben ser del 25 de febrero
   ```

4. **Instala la nueva versión**:
   ```bash
   adb install apps/mobile/PrescriptorApp-v0.0.5.apk
   ```

5. **Reinicia el dispositivo** (opcional pero recomendado)

### Los splash screens no se actualizaron

```bash
cd apps/mobile

# Ejecutar el script de actualización
npm run update:splash

# Verificar que se copiaron
ls -lh android/app/src/main/res/drawable-*/splash.jpg
```

## Notas Técnicas

### Diferencia entre Bootsplash y Splash Screens

| Archivo | Formato | Uso | Cuándo se muestra |
|---------|---------|-----|-------------------|
| `bootsplash_logo.png` | PNG | Logo de bootsplash | Durante la carga inicial de React Native |
| `splash.jpg` | JPEG | Splash screen completo | Durante la transición al login |

Ambos deben estar actualizados para que no aparezca el logo antiguo.

### Flujo de Actualización de Assets

```
1. Logo fuente (app-logo.png)
   ↓
2. Generar splash screens (Python script)
   ↓ npm run generate:splash
3. Splash screens en assets/splash_screens/
   ↓
4. Copiar a Android (Node script)
   ↓ npm run update:splash
5. Splash screens en drawable-*/
   ↓
6. Build APK
   ↓
7. APK con logos nuevos
```

## Checklist Final de Branding

Antes de aprobar esta release, verifica:

- [x] Icono de la app muestra el logo nuevo
- [x] Bootsplash muestra el logo nuevo
- [x] Splash screens muestran el logo nuevo
- [x] Login/Register muestran "Versión 0.0.5"
- [x] No aparece el logo antiguo en ningún momento
- [x] Transiciones suaves entre pantallas
- [x] Funcionalidad completa de la app
- [x] Debug mode desactivado

## Próxima Versión (v0.0.6)

Para la próxima release:

```bash
cd apps/mobile

# Incrementar versión
npm run version:patch

# Generar release
npm run build:android
```

La versión en Login/Register se actualizará automáticamente a "0.0.6".

## Documentación Relacionada

- [BRANDING_UPDATE.md](.claude/BRANDING_UPDATE.md) - Resumen completo de branding
- [APP_ICONS_UPDATE.md](.claude/APP_ICONS_UPDATE.md) - Detalles de iconos
- [SPLASH_SCREENS_UPDATE.md](.claude/SPLASH_SCREENS_UPDATE.md) - Detalles de splash screens
- [VERSION_SYNC.md](.claude/VERSION_SYNC.md) - Sincronización de versión

---

**Release generada**: 25 de febrero de 2026, 10:50
**Build time**: 2m 36s
**Status**: ✅ Build exitoso
**Branding**: ✅ 100% actualizado
**Logo antiguo**: ❌ Eliminado completamente
