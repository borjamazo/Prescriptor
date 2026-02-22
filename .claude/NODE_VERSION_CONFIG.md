# Configuración de Node 20.19.3 para Todo el Proyecto

## Cambios Aplicados

### 1. Archivo `.nvmrc` en la Raíz
Creado `.nvmrc` con la versión de Node:
```
20.19.3
```

Este archivo permite que nvm automáticamente use la versión correcta cuando entras al directorio del proyecto.

### 2. Actualización de `package.json` Raíz
```json
{
  "engines": {
    "node": "20.19.3"
  }
}
```

### 3. Scripts Actualizados en Todas las Apps

#### apps/dashboard/package.json
```json
{
  "scripts": {
    "dev": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && remix vite:dev --port 3002'",
    "start": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && remix-serve ./build/server/index.js'"
  },
  "engines": {
    "node": "20.19.3"
  }
}
```

#### apps/docs/package.json
```json
{
  "scripts": {
    "dev": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && next dev --port 3001'",
    "build": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && next build'",
    "start": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && next start'"
  },
  "engines": {
    "node": "20.19.3"
  }
}
```

#### apps/web/package.json
```json
{
  "scripts": {
    "dev": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && next dev --port 3000'",
    "build": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && next build'",
    "start": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && next start'"
  },
  "engines": {
    "node": "20.19.3"
  }
}
```

#### apps/mobile/package.json
Ya tenía la configuración correcta:
```json
{
  "scripts": {
    "android": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && react-native run-android'",
    "ios": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && react-native run-ios'",
    "start": "bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && react-native start'"
  },
  "engines": {
    "node": "20.19.3"
  }
}
```

## Cómo Usar

### Opción 1: Usar nvm automáticamente
```bash
# Entra al directorio del proyecto
cd my-turborepo

# nvm detectará el .nvmrc y te sugerirá usar la versión correcta
nvm use

# Verifica la versión
node --version  # Debe mostrar: v20.19.3
```

### Opción 2: Los scripts ya incluyen nvm
Simplemente ejecuta los comandos normalmente:
```bash
# Dashboard (Remix)
cd apps/dashboard
npm run dev  # Automáticamente usa Node 20.19.3

# Web (Next.js)
cd apps/web
npm run dev  # Automáticamente usa Node 20.19.3

# Docs (Next.js)
cd apps/docs
npm run dev  # Automáticamente usa Node 20.19.3

# Mobile (React Native)
cd apps/mobile
npm run android  # Automáticamente usa Node 20.19.3
```

## Puertos Asignados

- **apps/web**: http://localhost:3000
- **apps/docs**: http://localhost:3001
- **apps/dashboard**: http://localhost:3002
- **apps/mobile**: Metro bundler en puerto 8081

## Verificación

Para verificar que todo está configurado correctamente:

```bash
# Verificar versión de Node en cada app
cd apps/dashboard && node --version  # v20.19.3
cd apps/web && node --version        # v20.19.3
cd apps/docs && node --version       # v20.19.3
cd apps/mobile && node --version     # v20.19.3
```

## Estado Actual

✅ **apps/dashboard**: Funcionando en http://localhost:3002
✅ **apps/mobile**: Funcionando con Android
✅ **apps/web**: Configurado
✅ **apps/docs**: Configurado

## Beneficios

1. **Consistencia**: Todos los desarrolladores usan la misma versión de Node
2. **Automatización**: Los scripts cambian automáticamente a la versión correcta
3. **Sin errores de versión**: No más warnings de EBADENGINE
4. **Compatibilidad**: React Native 0.83.1 requiere Node >= 20.19.4

## Notas Importantes

- Los scripts usan `bash -c` para ejecutar comandos en bash
- `source ~/.nvm/nvm.sh` carga nvm en el contexto del script
- `nvm use 20.19.3` cambia a la versión correcta antes de ejecutar el comando
- Esto funciona en macOS y Linux (tu sistema es macOS)

## Troubleshooting

### Si nvm no está instalado
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node 20.19.3
nvm install 20.19.3
nvm use 20.19.3
nvm alias default 20.19.3
```

### Si los scripts fallan
```bash
# Verificar que nvm está en tu PATH
which nvm

# Verificar que Node 20.19.3 está instalado
nvm list

# Instalar si no está
nvm install 20.19.3
```

---

**Status**: ✅ Configurado
**Fecha**: 22 de Febrero, 2026
