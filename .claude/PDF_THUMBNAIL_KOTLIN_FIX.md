# Fix: react-native-pdf-thumbnail Kotlin Compilation Error

## Problema

Al intentar compilar la app Android, se producía un error de compilación de Kotlin en la librería `react-native-pdf-thumbnail`:

```
e: file:///Users/.../node_modules/react-native-pdf-thumbnail/android/src/main/java/org/songsterq/pdfthumbnail/PdfThumbnailModule.kt:101:74 
Argument type mismatch: actual type is 'Bitmap.Config?', but 'Bitmap.Config' was expected.
```

## Causa

La librería `react-native-pdf-thumbnail` tiene un bug en su código Kotlin. En la línea 101 del archivo `PdfThumbnailModule.kt`, se intenta crear un Bitmap usando `bitmap.config` como parámetro, pero este valor puede ser nullable (`Bitmap.Config?`), mientras que el método `Bitmap.createBitmap()` espera un valor no-nullable (`Bitmap.Config`).

```kotlin
// Código problemático (línea 101)
val bitmapWhiteBG = Bitmap.createBitmap(bitmap.width, bitmap.height, bitmap.config)
//                                                                      ^^^^^^^^^^^^
//                                                                      Puede ser null
```

## Solución

Se creó un patch usando `patch-package` que agrega el operador Elvis (`?:`) para proporcionar un valor por defecto cuando `bitmap.config` es null:

```kotlin
// Código corregido
val bitmapWhiteBG = Bitmap.createBitmap(bitmap.width, bitmap.height, bitmap.config ?: Bitmap.Config.ARGB_8888)
//                                                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                                                      Si es null, usa ARGB_8888
```

## Pasos Realizados

1. **Modificar el archivo en node_modules:**
   ```bash
   # Editar manualmente el archivo
   apps/mobile/node_modules/react-native-pdf-thumbnail/android/src/main/java/org/songsterq/pdfthumbnail/PdfThumbnailModule.kt
   ```

2. **Crear el patch:**
   ```bash
   cd apps/mobile
   npx patch-package react-native-pdf-thumbnail
   ```

3. **Limpiar y recompilar:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

## Resultado

✅ La compilación ahora funciona correctamente
✅ El patch se aplica automáticamente en cada `npm install` gracias a `postinstall` script
✅ El archivo del patch está en: `apps/mobile/patches/react-native-pdf-thumbnail+1.3.1.patch`

## Archivos Modificados

- **Patch creado:** `apps/mobile/patches/react-native-pdf-thumbnail+1.3.1.patch`
- **Archivo original (en node_modules):** `react-native-pdf-thumbnail/android/src/main/java/org/songsterq/pdfthumbnail/PdfThumbnailModule.kt`

## Notas

- Este patch es necesario porque la librería `react-native-pdf-thumbnail` no ha sido actualizada para ser compatible con versiones recientes de Kotlin
- El patch se aplica automáticamente gracias al script `postinstall` en `package.json`:
  ```json
  {
    "scripts": {
      "postinstall": "patch-package"
    }
  }
  ```
- Si se actualiza la versión de `react-native-pdf-thumbnail`, puede ser necesario recrear el patch

## Referencias

- Issue relacionado: https://github.com/songsterq/react-native-pdf-thumbnail/issues (similar issues reported)
- Documentación de patch-package: https://github.com/ds300/patch-package

---

**Fecha:** 24 de Febrero, 2026
**Estado:** ✅ Resuelto
**Prioridad:** CRÍTICA - Bloqueaba la compilación de Android
