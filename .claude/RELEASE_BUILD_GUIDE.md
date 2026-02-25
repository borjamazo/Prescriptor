# Guía de Build de Release

## Sistema de Versionado

El proyecto usa versionado semántico (Semantic Versioning): **X.Y.Z**

- **X** (Major): Cambios incompatibles con versiones anteriores
- **Y** (Minor): Nueva funcionalidad compatible con versiones anteriores
- **Z** (Patch): Correcciones de bugs compatibles

**Versión actual**: `0.0.2`

## Comandos Disponibles

### 1. Generar Release APK

```bash
cd apps/mobile
npm run build:android
```

Este comando:
1. ✅ Desactiva automáticamente el modo debug
2. ✅ Actualiza el versionCode y versionName en build.gradle
3. ✅ Genera el APK de release
4. ✅ Copia el APK con nombre versionado: `PrescriptorApp-vX.Y.Z.apk`
5. ✅ Restaura el modo debug después del build

**Resultado**: `apps/mobile/PrescriptorApp-v0.0.2.apk`

### 2. Incrementar Versión

#### Patch (0.0.2 → 0.0.3)
Para correcciones de bugs:
```bash
npm run version:patch
```

#### Minor (0.0.2 → 0.1.0)
Para nueva funcionalidad:
```bash
npm run version:minor
```

#### Major (0.0.2 → 1.0.0)
Para cambios incompatibles:
```bash
npm run version:major
```

## Flujo de Trabajo Completo

### Escenario 1: Corrección de Bug

```bash
# 1. Hacer cambios en el código
# 2. Incrementar versión patch
npm run version:patch

# 3. Generar release
npm run build:android

# 4. El APK estará en: apps/mobile/PrescriptorApp-v0.0.3.apk
```

### Escenario 2: Nueva Funcionalidad

```bash
# 1. Desarrollar nueva funcionalidad
# 2. Incrementar versión minor
npm run version:minor

# 3. Generar release
npm run build:android

# 4. El APK estará en: apps/mobile/PrescriptorApp-v0.1.0.apk
```

### Escenario 3: Cambio Mayor

```bash
# 1. Implementar cambios mayores
# 2. Incrementar versión major
npm run version:major

# 3. Generar release
npm run build:android

# 4. El APK estará en: apps/mobile/PrescriptorApp-v1.0.0.apk
```

## Qué Hace el Build de Release

### Antes del Build (prepare-release.js)

1. **Lee la versión** de `package.json`
2. **Desactiva el modo debug**:
   - Crea backup de `debugConfig.ts`
   - Cambia `DEBUG_PRESCRIPTION_POSITIONING = false`
3. **Actualiza build.gradle**:
   - `versionCode`: Calculado como `Major*10000 + Minor*100 + Patch`
   - `versionName`: Versión del package.json (ej: "0.0.2")

### Durante el Build

- Compila el código TypeScript
- Genera el bundle de JavaScript
- Compila código nativo (Kotlin/Java)
- Empaqueta recursos
- Genera APK de release

### Después del Build (copy-apk.js)

1. **Copia el APK** con nombre versionado
2. **Restaura el modo debug** desde el backup
3. **Muestra información** del build:
   - Versión
   - Ubicación del APK
   - Tamaño del archivo
   - Próximos pasos

## Ejemplo de Salida

```
🚀 Preparing release build...
📦 Version: 0.0.2
✅ Created backup of debugConfig.ts
✅ Debug mode disabled
✅ Updated build.gradle: versionCode=2, versionName="0.0.2"

✨ Release preparation complete!
📱 Building APK...

[... build output ...]

📦 Finalizing release build...
✅ APK copied: PrescriptorApp-v0.0.2.apk (302 MB)
✅ Debug mode restored

============================================================
🎉 BUILD SUCCESSFUL!
============================================================

📱 App: Prescriptor
📦 Version: 0.0.2
📂 Location: apps/mobile/PrescriptorApp-v0.0.2.apk
📏 Size: 302 MB
🔧 Debug Mode: Disabled in APK

💡 Next steps:
   1. Test the APK on a real device
   2. Share: apps/mobile/PrescriptorApp-v0.0.2.apk
   3. Install: adb install apps/mobile/PrescriptorApp-v0.0.2.apk

============================================================
```

## Verificación del APK

### Verificar que el Debug Mode está Desactivado

1. Instala el APK en un dispositivo
2. Abre la app
3. Ve a la lista de recetas
4. **No deberías ver** la sección amarilla "🔧 DEBUG MODE"

### Verificar la Versión

```bash
# Ver información del APK
aapt dump badging apps/mobile/PrescriptorApp-v0.0.2.apk | grep version

# Debería mostrar:
# versionCode='2' versionName='0.0.2'
```

## Archivos Importantes

### package.json
```json
{
  "version": "0.0.2",
  "scripts": {
    "build:android": "...",
    "version:patch": "npm version patch --no-git-tag-version",
    "version:minor": "npm version minor --no-git-tag-version",
    "version:major": "npm version major --no-git-tag-version"
  }
}
```

### build.gradle
```gradle
android {
    defaultConfig {
        versionCode 2
        versionName "0.0.2"
    }
}
```

### debugConfig.ts
```typescript
// En desarrollo (después del build)
export const DEBUG_PRESCRIPTION_POSITIONING = true;

// En el APK de release
export const DEBUG_PRESCRIPTION_POSITIONING = false;
```

## Solución de Problemas

### El build falla

```bash
# Limpiar build anterior
cd android
./gradlew clean
cd ..

# Intentar de nuevo
npm run build:android
```

### El modo debug sigue activo en el APK

- Verifica que `prepare-release.js` se ejecutó correctamente
- Revisa que no haya errores en los logs del build
- Asegúrate de que `debugConfig.ts` se modificó antes del build

### El APK no se copia

- Verifica que el build se completó exitosamente
- Revisa la ruta: `android/app/build/outputs/apk/release/app-release.apk`
- Ejecuta manualmente: `node scripts/copy-apk.js`

### La versión no se actualiza en build.gradle

- Verifica que `package.json` tiene la versión correcta
- Ejecuta manualmente: `node scripts/prepare-release.js`
- Revisa que `build.gradle` tiene los campos `versionCode` y `versionName`

## Cálculo de versionCode

El `versionCode` se calcula automáticamente:

```
versionCode = Major * 10000 + Minor * 100 + Patch
```

Ejemplos:
- `0.0.2` → versionCode = `2`
- `0.1.0` → versionCode = `100`
- `1.0.0` → versionCode = `10000`
- `1.2.3` → versionCode = `10203`

Esto asegura que cada versión tenga un código único y creciente.

## Historial de Versiones

| Versión | versionCode | Fecha | Cambios |
|---------|-------------|-------|---------|
| 0.0.1 | 1 | 2026-02-25 | Versión inicial con debug mode |
| 0.0.2 | 2 | 2026-02-25 | Sistema de build automatizado |

## Próximos Pasos

1. **Probar el APK** en dispositivos reales
2. **Ajustar coordenadas** usando el modo debug en desarrollo
3. **Generar nueva versión** cuando esté listo
4. **Firmar el APK** para producción (opcional)
5. **Publicar en Play Store** (opcional)

## Comandos Rápidos

```bash
# Build de release (versión actual)
npm run build:android

# Incrementar patch y build
npm run version:patch && npm run build:android

# Incrementar minor y build
npm run version:minor && npm run build:android

# Incrementar major y build
npm run version:major && npm run build:android

# Ver versión actual
cat package.json | grep version

# Instalar APK en dispositivo conectado
adb install apps/mobile/PrescriptorApp-v0.0.2.apk
```

---

**Nota**: El modo debug se restaura automáticamente después del build para que puedas seguir desarrollando con las herramientas de debugging activas.
