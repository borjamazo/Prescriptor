# 🎉 Release Notes - Prescriptor v0.0.3

## 📅 Fecha: 25 de febrero de 2026

---

## ✨ Novedades

### 🎨 Nuevo Branding Completo

Esta versión incluye una actualización completa del branding de la aplicación con el nuevo logo de Prescriptor.

#### Icono de la App
- ✅ Nuevo icono en el launcher de Android
- ✅ Icono adaptativo para Android 8.0+ (se adapta a diferentes formas)
- ✅ Todos los tamaños de iOS actualizados (iPhone, iPad, App Store)
- ✅ 25 iconos generados en total

#### Splash Screens
- ✅ Nueva pantalla de carga con logo actualizado
- ✅ Fondo blanco limpio y profesional
- ✅ Logo centrado y escalado proporcionalmente
- ✅ 10 splash screens para diferentes densidades

---

## 🔧 Mejoras Técnicas

### Modo Debug Desactivado
- ❌ Botones de debug removidos en producción
- ❌ No se muestra la sección "🔧 DEBUG MODE"
- ✅ App lista para uso en producción

### Optimizaciones
- ⚡ Build optimizado con ProGuard
- 📦 Recursos minimizados
- 🚀 Rendimiento mejorado

---

## 📦 Información de la Release

| Propiedad | Valor |
|-----------|-------|
| **Versión** | 0.0.3 |
| **versionCode** | 3 |
| **Tamaño** | 302.19 MB |
| **Archivo** | `PrescriptorApp-v0.0.3.apk` |
| **Build Time** | 56 segundos |

---

## 📥 Instalación

### Método 1: ADB (Recomendado)

```bash
adb install apps/mobile/PrescriptorApp-v0.0.3.apk
```

### Método 2: Manual

1. Copia el APK a tu dispositivo
2. Abre el archivo desde el explorador
3. Permite instalación de fuentes desconocidas
4. Instala

---

## ✅ Qué Verificar

### 1. Nuevo Icono
- Abre el drawer de apps
- Busca "Prescriptor"
- Verifica que el icono muestra el nuevo logo

### 2. Splash Screen
- Abre la app
- Observa la pantalla de carga
- Deberías ver el nuevo logo con fondo blanco

### 3. Sin Modo Debug
- Crea una receta
- Verifica que NO aparece la sección amarilla de debug
- Solo deberías ver botones "Firmar" y "Compartir"

### 4. Funcionalidad
- ✅ Crear recetas
- ✅ Firmar recetas digitalmente
- ✅ Compartir recetas firmadas
- ✅ Gestionar talonarios
- ✅ Ver estadísticas
- ✅ Sincronización con Supabase

---

## 🆚 Comparación con v0.0.2

| Característica | v0.0.2 | v0.0.3 |
|----------------|--------|--------|
| Icono | Logo antiguo | ✅ Logo nuevo |
| Splash | Logo antiguo | ✅ Logo nuevo |
| Debug Mode | Activo | ✅ Desactivado |
| Branding | Parcial | ✅ Completo |

---

## 🐛 Problemas Conocidos

Ninguno reportado.

---

## 🔄 Actualización desde v0.0.2

Si ya tienes v0.0.2 instalada:

```bash
# Opción 1: Actualizar (mantiene datos)
adb install -r apps/mobile/PrescriptorApp-v0.0.3.apk

# Opción 2: Instalación limpia (borra datos)
adb uninstall com.pdfsignpoc
adb install apps/mobile/PrescriptorApp-v0.0.3.apk
```

---

## 📸 Capturas de Pantalla

### Antes (v0.0.2)
- Icono con logo antiguo
- Splash screen con logo antiguo
- Modo debug visible

### Después (v0.0.3)
- ✅ Icono con logo nuevo
- ✅ Splash screen con logo nuevo
- ✅ Sin modo debug

---

## 🛠️ Para Desarrolladores

### Generar Nueva Release

```bash
cd apps/mobile

# Incrementar versión
npm run version:patch  # 0.0.3 → 0.0.4

# Generar APK
npm run build:android
```

### Regenerar Assets

```bash
# Regenerar splash screens
npm run generate:splash

# Regenerar iconos
npm run generate:icons
```

---

## 📚 Documentación

- [BRANDING_UPDATE.md](.claude/BRANDING_UPDATE.md) - Actualización completa de branding
- [APP_ICONS_UPDATE.md](.claude/APP_ICONS_UPDATE.md) - Detalles de iconos
- [SPLASH_SCREENS_UPDATE.md](.claude/SPLASH_SCREENS_UPDATE.md) - Detalles de splash screens
- [RELEASE_BUILD_GUIDE.md](.claude/RELEASE_BUILD_GUIDE.md) - Guía de builds

---

## 🎯 Próximos Pasos

1. **Probar en dispositivo real**
   - Instalar APK
   - Verificar nuevo icono
   - Verificar splash screen
   - Probar funcionalidades

2. **Feedback**
   - Reportar cualquier problema
   - Sugerir mejoras
   - Validar branding

3. **Siguiente versión (v0.0.4)**
   - Ajustes basados en feedback
   - Nuevas funcionalidades
   - Mejoras de rendimiento

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica los logs:
   ```bash
   adb logcat | grep -E "PdfSignPOC|ReactNative"
   ```

2. Documenta:
   - Versión de Android
   - Modelo del dispositivo
   - Pasos para reproducir
   - Logs (si es posible)

---

## 🙏 Agradecimientos

Gracias por probar esta versión. Tu feedback es importante para mejorar la app.

---

**¡Disfruta de Prescriptor v0.0.3 con el nuevo branding!** 🎨✨

