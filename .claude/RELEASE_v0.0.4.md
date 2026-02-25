# Release v0.0.4 - Bootsplash Logo Fix + Version Sync

## Información de la Release

- **Versión**: 0.0.4
- **Fecha**: 25 de febrero de 2026
- **Tamaño**: 302.2 MB
- **Archivo**: `apps/mobile/PrescriptorApp-v0.0.4.apk`
- **versionCode**: 4
- **versionName**: "0.0.4"

## Cambios en esta Versión

### 🔧 Fix: Logo de Bootsplash Actualizado

**Problema**: Entre el splash screen inicial y el login aparecía una imagen con el logo antiguo.

**Solución**: 
- Actualizados los logos de bootsplash en las carpetas `drawable-*` de Android
- Copiados los logos correctos desde `assets/bootsplash/` a `android/app/src/main/res/drawable-*/`
- Creado script `update-bootsplash-android.js` para automatizar futuras actualizaciones

**Archivos actualizados**:
- `android/app/src/main/res/drawable-mdpi/bootsplash_logo.png`
- `android/app/src/main/res/drawable-hdpi/bootsplash_logo.png`
- `android/app/src/main/res/drawable-xhdpi/bootsplash_logo.png`
- `android/app/src/main/res/drawable-xxhdpi/bootsplash_logo.png`
- `android/app/src/main/res/drawable-xxxhdpi/bootsplash_logo.png`

### 🔄 Sincronización de Versión en Pantallas de Auth

**Problema**: Las pantallas de Login y Register mostraban "Versión 2.1.0" hardcodeado.

**Solución**:
- Importación dinámica de la versión desde `package.json`
- Actualización automática cuando se incrementa la versión
- Configuración de TypeScript para permitir importar JSON

**Cambios**:
```typescript
import { version } from '../../package.json';

<Text>© 2026 Prescriptor Pro • Versión {version}</Text>
```

**Archivos modificados**:
- `apps/mobile/src/screens/LoginScreen.tsx`
- `apps/mobile/src/screens/RegisterScreen.tsx`
- `apps/mobile/tsconfig.json` (agregado `resolveJsonModule: true`)

### 📜 Nuevo Script

**Script**: `update-bootsplash-android.js`
- Copia automáticamente los logos de bootsplash a Android
- Mapea correctamente las densidades (@1x, @1.5x, @2x, @3x, @4x)
- Comando: `npm run update:bootsplash`

## Instalación

### Opción 1: Con ADB (Recomendado)

```bash
adb install apps/mobile/PrescriptorApp-v0.0.4.apk

# Si ya tienes una versión anterior, usa -r para actualizar
adb install -r apps/mobile/PrescriptorApp-v0.0.4.apk
```

### Opción 2: Instalación Manual

1. Copia el archivo `PrescriptorApp-v0.0.4.apk` a tu dispositivo
2. Abre el archivo desde el explorador de archivos
3. Permite la instalación de fuentes desconocidas si es necesario
4. Instala la app

### Opción 3: Instalación Limpia

```bash
# Desinstala la versión anterior
adb uninstall com.pdfsignpoc

# Instala la nueva versión
adb install apps/mobile/PrescriptorApp-v0.0.4.apk
```

## Verificación

### 1. Verificar Logo de Bootsplash

- **Abre la app**: Al abrir, deberías ver el bootsplash con el nuevo logo
- **Entre splash y login**: Ya NO debería aparecer el logo antiguo
- **Transición suave**: Bootsplash → Login con logo nuevo

### 2. Verificar Versión en Login/Register

- **Abre la app**
- **Ve al LoginScreen o RegisterScreen**
- **Verifica el footer**: Debería mostrar "© 2026 Prescriptor Pro • Versión 0.0.4"

### 3. Verificar Funcionalidad

- ✅ Crear recetas
- ✅ Firmar recetas
- ✅ Compartir recetas firmadas
- ✅ Gestionar talonarios
- ✅ Ver estadísticas
- ✅ Sincronización con Supabase

## Comparación con v0.0.3

| Característica | v0.0.3 | v0.0.4 |
|----------------|--------|--------|
| Icono de la app | ✅ Logo nuevo | ✅ Logo nuevo |
| Splash screens | ✅ Logo nuevo | ✅ Logo nuevo |
| Bootsplash | ❌ Logo antiguo | ✅ Logo nuevo |
| Versión en Login | ❌ Hardcodeado (2.1.0) | ✅ Dinámico (0.0.4) |
| Debug Mode | ✅ Desactivado | ✅ Desactivado |

## Archivos Modificados

### Scripts
- `apps/mobile/scripts/update-bootsplash-android.js` (nuevo)
- `apps/mobile/package.json` (agregado comando `update:bootsplash`)

### Código
- `apps/mobile/src/screens/LoginScreen.tsx`
- `apps/mobile/src/screens/RegisterScreen.tsx`
- `apps/mobile/tsconfig.json`

### Recursos Android
- `android/app/src/main/res/drawable-mdpi/bootsplash_logo.png`
- `android/app/src/main/res/drawable-hdpi/bootsplash_logo.png`
- `android/app/src/main/res/drawable-xhdpi/bootsplash_logo.png`
- `android/app/src/main/res/drawable-xxhdpi/bootsplash_logo.png`
- `android/app/src/main/res/drawable-xxxhdpi/bootsplash_logo.png`

### Documentación
- `.claude/VERSION_SYNC.md` (nuevo)
- `.claude/RELEASE_v0.0.4.md` (este archivo)

## Comandos Útiles

### Actualizar Bootsplash en el Futuro

```bash
cd apps/mobile
npm run update:bootsplash
```

### Verificar Versión

```bash
# Ver versión en package.json
cat apps/mobile/package.json | grep version

# Ver versión en build.gradle
grep versionName apps/mobile/android/app/build.gradle
```

### Generar Nueva Release

```bash
cd apps/mobile

# Incrementar versión
npm run version:patch  # 0.0.4 → 0.0.5

# Generar APK
npm run build:android
```

## Solución de Problemas

### El bootsplash sigue mostrando el logo antiguo

1. Desinstala completamente la app:
   ```bash
   adb uninstall com.pdfsignpoc
   ```

2. Limpia el build:
   ```bash
   cd apps/mobile/android
   ./gradlew clean
   cd ..
   ```

3. Instala la nueva versión:
   ```bash
   adb install apps/mobile/PrescriptorApp-v0.0.4.apk
   ```

### La versión en Login/Register no se actualiza

- Asegúrate de que la app se instaló correctamente
- Cierra completamente la app y ábrela de nuevo
- Verifica que el APK es el v0.0.4

## Notas Técnicas

### Bootsplash Logo Mapping

| Densidad | Archivo Fuente | Destino Android |
|----------|----------------|-----------------|
| mdpi (1x) | `logo.png` | `drawable-mdpi/bootsplash_logo.png` |
| hdpi (1.5x) | `logo@1,5x.png` | `drawable-hdpi/bootsplash_logo.png` |
| xhdpi (2x) | `logo@2x.png` | `drawable-xhdpi/bootsplash_logo.png` |
| xxhdpi (3x) | `logo@3x.png` | `drawable-xxhdpi/bootsplash_logo.png` |
| xxxhdpi (4x) | `logo@4x.png` | `drawable-xxxhdpi/bootsplash_logo.png` |

### TypeScript Configuration

Para permitir importar `package.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

## Próxima Versión (v0.0.5)

Para la próxima release:

```bash
cd apps/mobile

# Incrementar versión
npm run version:patch

# Generar release
npm run build:android
```

La versión en Login/Register se actualizará automáticamente a "0.0.5".

---

**Release generada**: 25 de febrero de 2026, 10:13
**Build time**: 57 segundos
**Status**: ✅ Build exitoso
**Bootsplash**: ✅ Logo actualizado
**Versión sincronizada**: ✅ Dinámico desde package.json
