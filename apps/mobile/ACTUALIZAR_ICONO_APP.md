# 📱 Cómo Actualizar el Icono de la App

## Guía Rápida (5 minutos)

### 1️⃣ Crear PNG del Logo (1024x1024px)

**Opción más fácil - Usar herramienta online:**

1. Abre el simulador/emulador de la app
2. Ve a la pantalla de Login (donde se ve el logo grande)
3. Toma un screenshot
4. Recorta solo el logo y redimensiona a 1024x1024px
5. Guárdalo como `app-icon-source.png`

**Alternativa - Convertir SVG a PNG:**
- Ve a https://svgtopng.com/
- Sube un SVG del logo
- Configura tamaño: 1024x1024px
- Descarga el PNG

---

### 2️⃣ Generar Iconos Automáticamente

**Usa AppIcon.co (RECOMENDADO):**

1. Ve a: https://www.appicon.co/
2. Arrastra tu PNG de 1024x1024px
3. Marca las casillas: ✅ iOS y ✅ Android
4. Haz clic en "Generate"
5. Descarga el archivo ZIP

---

### 3️⃣ Instalar los Iconos

**Extrae el ZIP descargado**, encontrarás dos carpetas:

#### Para Android:
```
Copia las carpetas: mipmap-mdpi, mipmap-hdpi, mipmap-xhdpi, etc.
Pégalas en: apps/mobile/android/app/src/main/res/
(Reemplaza las carpetas existentes)
```

#### Para iOS:
```
Copia todos los archivos PNG (AppIcon-*.png)
Pégalos en: apps/mobile/ios/pdfsignpoc/Images.xcassets/AppIcon.appiconset/
(Reemplaza los archivos existentes)
```

---

### 4️⃣ Rebuild la App

**Android:**
```bash
cd apps/mobile/android
./gradlew clean
cd ..
npm run android
```

**iOS:**
```bash
cd apps/mobile/ios
rm -rf build
pod install
cd ..
npm run ios
```

---

## 🔧 Opción Alternativa: Usar el Script

Si tienes el PNG listo, puedes usar el script automático:

```bash
cd apps/mobile

# Instalar dependencia
npm install --save-dev sharp

# Ejecutar script
node scripts/generate-app-icons.js assets/app-icon-source.png
```

Esto generará todos los tamaños automáticamente.

---

## ✅ Verificar que Funcionó

1. Desinstala la app del dispositivo/simulador
2. Vuelve a instalar con `npm run android` o `npm run ios`
3. Busca el icono en el launcher/home screen
4. Debería verse el nuevo logo con el escudo médico y "Rx"

---

## 🎨 Características del Nuevo Logo

- ✅ Escudo de prescripción blanco
- ✅ Cruz médica azul en la parte superior
- ✅ Símbolo "Rx" grande
- ✅ Líneas de prescripción
- ✅ Checkmark verde de verificación
- ✅ Líneas de velocidad/digital (verde y azul)
- ✅ Pulso de salud en la parte inferior
- ✅ Fondo transparente

---

## ❓ Problemas Comunes

**El icono no cambia:**
- Desinstala completamente la app del dispositivo
- Limpia el build: `./gradlew clean` (Android) o `rm -rf build` (iOS)
- Vuelve a instalar

**Error "sharp not found":**
```bash
cd apps/mobile
npm install --save-dev sharp
```

**No tengo el PNG:**
- Usa la opción de screenshot del simulador
- O usa https://svgtopng.com/ para convertir el SVG

---

**Última actualización:** 24 de Febrero, 2026
