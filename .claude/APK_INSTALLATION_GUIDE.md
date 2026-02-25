# Guía de Instalación del APK

## APK Generado

✅ **Archivo**: `apps/mobile/PrescriptorApp-v1.0.0.apk`
✅ **Tamaño**: 302 MB
✅ **Versión**: 1.0.0
✅ **Tipo**: Release APK (sin firmar)
✅ **Fecha**: 25 de Febrero de 2026

## Ubicación del APK

El APK se encuentra en:
```
apps/mobile/PrescriptorApp-v1.0.0.apk
```

También está disponible en:
```
apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

## Cómo Compartir el APK

### Opción 1: Compartir por Email
1. Adjunta el archivo `PrescriptorApp-v1.0.0.apk` a un email
2. Envíalo a los destinatarios
3. **Nota**: Algunos servicios de email bloquean archivos APK. Si es el caso, usa otra opción.

### Opción 2: Compartir por Google Drive / Dropbox
1. Sube el archivo a Google Drive o Dropbox
2. Genera un enlace compartible
3. Envía el enlace a los destinatarios

### Opción 3: Compartir por WhatsApp / Telegram
1. Comprime el APK en un archivo ZIP si es necesario
2. Envía el archivo por WhatsApp o Telegram
3. **Nota**: WhatsApp tiene límite de 100MB, puede que necesites usar Telegram

### Opción 4: Usar ADB (para desarrolladores)
```bash
adb install apps/mobile/PrescriptorApp-v1.0.0.apk
```

## Cómo Instalar en Android

### Paso 1: Habilitar Instalación de Fuentes Desconocidas

**Android 8.0 y superior**:
1. Ve a **Configuración** → **Seguridad y privacidad**
2. Busca **Instalar apps desconocidas**
3. Selecciona la app desde la que instalarás (ej: Chrome, Gmail, Archivos)
4. Activa **Permitir de esta fuente**

**Android 7.1 y anterior**:
1. Ve a **Configuración** → **Seguridad**
2. Activa **Fuentes desconocidas**
3. Confirma el mensaje de advertencia

### Paso 2: Descargar el APK
1. Descarga el archivo `PrescriptorApp-v1.0.0.apk` en tu dispositivo Android
2. Puedes descargarlo desde email, Drive, o transferirlo por cable USB

### Paso 3: Instalar el APK
1. Abre la app **Archivos** o **Descargas** en tu dispositivo
2. Busca el archivo `PrescriptorApp-v1.0.0.apk`
3. Toca el archivo para iniciar la instalación
4. Toca **Instalar**
5. Espera a que se complete la instalación
6. Toca **Abrir** para iniciar la app

### Paso 4: Configurar la App
1. Al abrir la app por primera vez, verás la pantalla de login
2. Usa tus credenciales de Supabase para iniciar sesión
3. La app solicitará permisos para:
   - Acceso a archivos (para importar PDFs de recetas)
   - Acceso a certificados (para firmar digitalmente)

## Características de esta Versión

### ✅ Funcionalidades Implementadas
- Login con Supabase
- Importar talonarios de recetas (PDF)
- Detección automática de número de recetas por OCR
- Crear prescripciones
- Firmar prescripciones digitalmente con PAdES
- Sincronización con Supabase (estadísticas)
- Modo debug para ajustar posicionamiento de datos

### 🔧 Modo Debug Activado
Esta versión incluye el modo debug para ajustar el posicionamiento de datos en las recetas:
- Botón "Regenerar PDF" en cada receta
- Botón "Compartir" para enviar PDFs sin firmar
- Útil para probar y ajustar coordenadas

**Para desactivar el modo debug en futuras versiones**:
Edita `apps/mobile/src/config/debugConfig.ts` y cambia:
```typescript
export const DEBUG_PRESCRIPTION_POSITIONING = false;
```

### ⚠️ Limitaciones Conocidas
- PDFNet funciona en modo demo (puede mostrar marcas de agua)
- El APK no está firmado con certificado de producción
- Tamaño grande (302 MB) debido a las librerías nativas de PDFTron

## Solución de Problemas

### "No se puede instalar la app"
- Verifica que hayas habilitado "Fuentes desconocidas"
- Asegúrate de tener suficiente espacio (al menos 500 MB libres)
- Desinstala versiones anteriores si existen

### "La app se cierra al abrirla"
- Verifica que tu dispositivo tenga Android 7.0 o superior
- Limpia la caché de la app: Configuración → Apps → Prescriptor → Almacenamiento → Borrar caché
- Reinstala la app

### "No puedo importar PDFs"
- Verifica que hayas dado permisos de acceso a archivos
- Ve a Configuración → Apps → Prescriptor → Permisos → Archivos → Permitir

### "No puedo firmar recetas"
- Verifica que tengas un certificado digital instalado en tu dispositivo
- La app usa Android KeyChain para acceder a certificados
- Necesitas instalar un certificado digital válido primero

## Regenerar el APK

Si necesitas regenerar el APK con cambios:

```bash
cd apps/mobile

# Asegúrate de usar Node 20.19.3
nvm use 20.19.3

# Genera el APK de release
npx react-native build-android --mode=release

# El APK estará en:
# android/app/build/outputs/apk/release/app-release.apk
```

## Generar APK Firmado (Producción)

Para generar un APK firmado para producción:

1. **Crear keystore**:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore prescriptor-release.keystore -alias prescriptor -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configurar gradle.properties**:
```properties
PRESCRIPTOR_UPLOAD_STORE_FILE=prescriptor-release.keystore
PRESCRIPTOR_UPLOAD_KEY_ALIAS=prescriptor
PRESCRIPTOR_UPLOAD_STORE_PASSWORD=tu_password
PRESCRIPTOR_UPLOAD_KEY_PASSWORD=tu_password
```

3. **Actualizar build.gradle** para usar el keystore

4. **Generar APK firmado**:
```bash
npx react-native build-android --mode=release
```

## Información Técnica

### Arquitecturas Incluidas
- arm64-v8a (64-bit ARM)
- armeabi-v7a (32-bit ARM)
- x86 (32-bit Intel)
- x86_64 (64-bit Intel)

### Requisitos del Sistema
- Android 7.0 (API 24) o superior
- 500 MB de espacio libre
- Conexión a internet (para login y sincronización)

### Librerías Principales
- React Native 0.83.1
- PDFTron/Apryse SDK (modo demo)
- Google ML Kit (OCR)
- Supabase Client
- React Navigation

## Próximos Pasos

1. **Instalar en dispositivos de prueba**
2. **Probar todas las funcionalidades**
3. **Ajustar coordenadas de posicionamiento** usando el modo debug
4. **Desactivar modo debug** cuando esté listo
5. **Generar APK firmado** para producción
6. **Publicar en Google Play Store** (opcional)

## Soporte

Para reportar problemas o solicitar ayuda:
- Revisa los logs de Android: `adb logcat | grep PdfSignerModule`
- Verifica la configuración de Supabase
- Asegúrate de tener certificados digitales instalados para firmar

---

**Versión**: 1.0.0  
**Fecha**: 25 de Febrero de 2026  
**Build**: Release (sin firmar)  
**Modo Debug**: Activado
