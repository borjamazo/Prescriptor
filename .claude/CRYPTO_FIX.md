# Fix: Error al Importar Talonarios de Recetas - Crypto Module

## Problema

Al intentar importar un talonario de recetas en `PrescriptionBlocksScreen`, aparece el error:

> "No se pudo importar el talonario de recetas: Native crypto module could not be used to get secure random number"

## Causa Raíz

CryptoJS necesita generar números aleatorios seguros para la encriptación AES-256, pero React Native no tiene acceso al módulo nativo `crypto` de Node.js. 

El error ocurre en `PrescriptionBlockService.encryptPwd()` cuando intenta encriptar la contraseña del PDF:

```typescript
encryptPwd(plain: string): string {
  if (!plain) return '';
  return CryptoJS.AES.encrypt(plain, AES_KEY).toString(); // ❌ Falla aquí
}
```

## Solución Aplicada

Instalamos `react-native-get-random-values` que proporciona un polyfill para `crypto.getRandomValues()` en React Native.

### 1. Dependencia Agregada

En `apps/mobile/package.json`:

```json
"dependencies": {
  ...
  "react-native-get-random-values": "^1.11.0",
  ...
}
```

### 2. Import del Polyfill

En `apps/mobile/src/services/PrescriptionBlockService.ts`:

```typescript
import 'react-native-get-random-values'; // ✅ Debe ser la primera línea
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
```

**IMPORTANTE**: El import de `react-native-get-random-values` debe ser la primera línea del archivo, antes de cualquier otro import.

### 3. Mejora del Manejo de Errores

También mejoramos el `handleImport` en `PrescriptionBlocksScreen` para mostrar errores específicos:

```typescript
try {
  console.log('Attempting to add block:', block);
  await PrescriptionBlockService.add(block);
  console.log('Block added successfully');
  
  await loadBlocks();
  setImportVisible(false);
  resetImportForm();
  Alert.alert('✓ Importado', 'talonario de recetas importado correctamente');
} catch (error) {
  console.error('Error importing block:', error);
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  Alert.alert('Error', `No se pudo importar el talonario de recetas: ${errorMessage}`);
}
```

## Cómo Aplicar

### Paso 1: Instalar Dependencias

```bash
cd apps/mobile
npm install
```

### Paso 2: Limpiar y Reconstruir (Android)

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Paso 3: Limpiar y Reconstruir (iOS)

```bash
cd ios
pod install
cd ..
npm run ios
```

## Verificación

Para verificar que funciona:

1. **Abre la app mobile**
2. **Ve a la pantalla de Bloques de Recetas**
3. **Click en "Importar"**
4. **Selecciona un PDF**
5. **Completa los campos:**
   - Número de serie del bloque: `B2024-001`
   - Total de recetas: `25`
   - Contraseña del PDF: (opcional)
6. **Click en "Importar"**
7. Deberías ver el mensaje: **"✓ Importado - talonario de recetas importado correctamente"**
8. El bloque debería aparecer en la lista

## Qué Hace react-native-get-random-values

Este paquete proporciona una implementación de `crypto.getRandomValues()` para React Native usando:

- **Android**: `java.security.SecureRandom`
- **iOS**: `SecRandomCopyBytes`

Esto permite que CryptoJS genere números aleatorios criptográficamente seguros para:
- Generar IVs (Initialization Vectors) para AES
- Generar salts para derivación de claves
- Cualquier operación que requiera aleatoriedad segura

## Seguridad

✅ **Seguro**: Usa generadores de números aleatorios nativos del sistema operativo
✅ **Criptográficamente fuerte**: Adecuado para operaciones de encriptación
✅ **Estándar**: Implementa la API estándar de Web Crypto
✅ **Mantenido**: Paquete oficial recomendado por React Native

## Alternativas Consideradas

### Opción 1: No encriptar la contraseña (descartada)
**Problema**: Compromete la seguridad, las contraseñas se guardarían en texto plano

### Opción 2: Usar otro algoritmo de encriptación (descartada)
**Problema**: CryptoJS es el estándar de facto y es más seguro

### Opción 3: Implementar nuestro propio generador de números aleatorios (descartada)
**Problema**: Difícil de hacer correctamente, riesgo de vulnerabilidades

## Otros Usos en la App

Este polyfill también beneficia a:

1. **Supabase**: Puede usar crypto para generar UUIDs
2. **Cualquier librería que use crypto**: Ahora funcionará correctamente
3. **Futuras funcionalidades**: Cualquier operación criptográfica

## Troubleshooting

### Error: "Cannot find module 'react-native-get-random-values'"
**Solución**: 
```bash
cd apps/mobile
npm install
```

### El error persiste después de instalar
**Solución**: Limpia y reconstruye:
```bash
# Android
cd android && ./gradlew clean && cd ..
npm run android

# iOS
cd ios && pod install && cd ..
npm run ios
```

### Error: "Invariant Violation: Native module cannot be null"
**Solución**: Asegúrate de que el import esté en la primera línea del archivo

### Los bloques no se guardan
1. Verifica los logs con `npx react-native log-android` o `npx react-native log-ios`
2. Verifica que AsyncStorage tenga permisos
3. Verifica que el URI del archivo sea válido

## Logs de Debugging

Para ver logs detallados:

```bash
# Android
npx react-native log-android

# iOS  
npx react-native log-ios
```

Busca estos mensajes:
- "Attempting to add block:" - Muestra los datos del bloque
- "Block added successfully" - Confirma que se guardó
- Cualquier error de CryptoJS o AsyncStorage

---

**Status**: ✅ Arreglado (requiere npm install y rebuild)
**Fecha**: 24 de Febrero, 2026
