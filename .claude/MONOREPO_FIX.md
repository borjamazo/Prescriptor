# Solución: React Native en Monorepo Turborepo

## Problema
Después de migrar a un monorepo con Turborepo, la aplicación React Native en `apps/mobile` no se ejecutaba con `npm run android`.

### Error Original
```
Error resolving plugin [id: 'com.facebook.react.settings']
> Included build '/Users/.../apps/mobile/node_modules/@react-native/gradle-plugin' does not exist.
```

## Causa Raíz
React Native requiere que sus dependencias estén instaladas localmente en `node_modules` de la aplicación. En un monorepo con npm workspaces, las dependencias se "hoistean" al `node_modules` raíz, causando que Gradle no pueda encontrar los plugins necesarios.

El archivo `android/settings.gradle` busca las dependencias en:
```groovy
includeBuild("../node_modules/@react-native/gradle-plugin")
```

Pero con workspaces, las dependencias están en `../../node_modules` (raíz del monorepo).

## Solución Aplicada

### 1. Excluir `apps/mobile` de los workspaces
Modificamos `package.json` en la raíz del proyecto:

```json
{
  "workspaces": [
    "apps/docs",
    "packages/*"
  ]
}
```

Antes era:
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### 2. Instalar dependencias localmente
```bash
cd apps/mobile
npm install
```

Esto instala todas las dependencias de React Native localmente en `apps/mobile/node_modules`, donde Gradle puede encontrarlas.

## Resultado
✅ BUILD SUCCESSFUL in 19s
✅ APK instalado en el dispositivo
✅ Aplicación iniciada correctamente

## Por Qué Esta Solución

React Native tiene requisitos específicos sobre la ubicación de sus dependencias:
- Los scripts de Gradle buscan módulos en rutas relativas específicas
- El Metro bundler necesita acceso directo a los módulos nativos
- Los plugins de autolinking requieren una estructura de carpetas específica

Mantener `apps/mobile` fuera de los workspaces permite que funcione como una aplicación React Native standalone dentro del monorepo.

## Alternativas Consideradas

### Opción 1: Modificar settings.gradle (No recomendada)
Cambiar las rutas en `android/settings.gradle` para apuntar a `../../node_modules`. 
**Problema**: Requiere modificar múltiples archivos de configuración y puede causar problemas con otros scripts.

### Opción 2: Usar nohoist (No disponible en npm)
La opción `nohoist` de Yarn workspaces no está disponible en npm workspaces.

### Opción 3: Symlinks (Compleja)
Crear symlinks desde `apps/mobile/node_modules` al raíz.
**Problema**: Frágil y requiere mantenimiento manual.

## Comandos para Ejecutar la App

```bash
# Desde la raíz del proyecto
cd apps/mobile

# Terminal 1: Metro bundler
npm start

# Terminal 2: Ejecutar en Android
npm run android

# Terminal 2: Ejecutar en iOS
npm run ios
```

## Notas Importantes

1. **Node Version**: El proyecto requiere Node 20.19.3 (configurado en `.nvmrc`)
2. **Scripts con nvm**: Los scripts en `package.json` automáticamente usan la versión correcta de Node
3. **Dependencias separadas**: `apps/mobile` mantiene su propio `package-lock.json`
4. **Turborepo**: Aún puedes usar comandos de Turbo desde la raíz para otras apps

## Estructura Final

```
my-turborepo/
├── package.json (workspaces: apps/docs, packages/*)
├── apps/
│   ├── docs/ (en workspace)
│   │   └── node_modules/ -> ../../node_modules (hoisted)
│   └── mobile/ (NO en workspace)
│       └── node_modules/ (local, completo)
└── packages/ (en workspace)
```

## Verificación

Para verificar que todo funciona:

```bash
# Verificar que las dependencias están instaladas localmente
ls apps/mobile/node_modules/@react-native/gradle-plugin

# Verificar la versión de Node
cd apps/mobile && node --version
# Debe mostrar: v20.19.3

# Limpiar y reconstruir si es necesario
cd apps/mobile/android
./gradlew clean
cd ..
npm run android
```

---

**Status**: ✅ Resuelto
**Fecha**: 19 de Febrero, 2026
