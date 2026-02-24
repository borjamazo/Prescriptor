# Actualizar Iconos de la App con el Nuevo Logo

## ✅ ESTADO ACTUAL
- Logo SVG creado en `src/components/AppIcon.tsx`
- Logo implementado en LoginScreen y RegisterScreen
- Falta: Actualizar iconos de launcher (Android e iOS)

---

## 🚀 OPCIÓN RECOMENDADA: Usar AppIcon.co (Más Fácil)

Esta es la forma más rápida y sencilla:

### Paso 1: Crear PNG del logo (1024x1024px)

Tienes 3 opciones para crear el PNG:

**A) Usar una herramienta online (RECOMENDADO)**
1. Ve a https://react-svgr.com/playground/
2. Copia el código SVG de `AppIcon.tsx` (todo el contenido dentro de `<Svg>...</Svg>`)
3. Pégalo y descarga como SVG
4. Ve a https://svgtopng.com/
5. Sube el SVG, configura 1024x1024px
6. Descarga el PNG

**B) Tomar screenshot en el simulador**
1. Abre la app en el simulador
2. Ve a LoginScreen (donde se ve el logo grande)
3. Toma screenshot del logo
4. Recorta y redimensiona a 1024x1024px usando Preview o cualquier editor

**C) Usar el logo existente**
Si `assets/logo.png` es el logo correcto, puedes usarlo directamente (asegúrate que sea 1024x1024px)

### Paso 2: Generar iconos con AppIcon.co

1. Ve a https://www.appicon.co/
2. Arrastra tu PNG de 1024x1024px
3. Selecciona "iOS" y "Android"
4. Haz clic en "Generate"
5. Descarga el archivo ZIP

### Paso 3: Instalar los iconos

**Android:**
```bash
cd apps/mobile
# Extrae el ZIP y copia las carpetas mipmap-* a:
# android/app/src/main/res/
```

**iOS:**
```bash
# Extrae el ZIP y copia los archivos PNG a:
# ios/pdfsignpoc/Images.xcassets/AppIcon.appiconset/
```

### Paso 4: Rebuild la app

```bash
# Android
cd apps/mobile/android
./gradlew clean
cd ..
bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && npm run android'

# iOS
cd apps/mobile/ios
rm -rf build
pod install
cd ..
bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && npm run ios'
```

---

## Opción 2: Usar el Script Automático

### Paso 1: Crear una imagen PNG del logo

Necesitas convertir el logo SVG a PNG de alta resolución (1024x1024px). Puedes usar:

**Opción A: Herramienta online**
1. Ve a https://svgtopng.com/ o https://cloudconvert.com/svg-to-png
2. Sube el archivo SVG del logo (puedes exportarlo desde `AppIcon.tsx`)
3. Configura el tamaño a 1024x1024px
4. Descarga el PNG
5. Guárdalo como `apps/mobile/assets/app-icon-source.png`

**Opción B: Usando Inkscape (si lo tienes instalado)**
```bash
inkscape --export-type=png --export-width=1024 --export-height=1024 logo.svg -o app-icon-source.png
```

**Opción C: Usando ImageMagick**
```bash
convert -background none -size 1024x1024 logo.svg app-icon-source.png
```

### Paso 2: Instalar dependencias

```bash
cd apps/mobile
npm install --save-dev sharp
```

### Paso 3: Ejecutar el script

```bash
node scripts/generate-app-icons.js assets/app-icon-source.png
```

El script generará automáticamente todos los tamaños necesarios para Android e iOS.

### Paso 4: Rebuild la app

```bash
# Android
cd android
./gradlew clean
cd ..
npm run android

# iOS
cd ios
pod install
cd ..
npm run ios
```

---

## Opción 2: Manual (Si no puedes usar el script)

### Android

Los iconos de Android están en `android/app/src/main/res/mipmap-*/`

Necesitas crear estos archivos en cada carpeta:
- `ic_launcher.png` - Icono cuadrado
- `ic_launcher_round.png` - Icono redondo

**Tamaños necesarios:**
- `mipmap-mdpi/`: 48x48px
- `mipmap-hdpi/`: 72x72px
- `mipmap-xhdpi/`: 96x96px
- `mipmap-xxhdpi/`: 144x144px
- `mipmap-xxxhdpi/`: 192x192px

**Herramientas online:**
- https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- https://appicon.co/

### iOS

Los iconos de iOS están en `ios/pdfsignpoc/Images.xcassets/AppIcon.appiconset/`

**Tamaños necesarios:**
- 20x20 (@1x, @2x, @3x)
- 29x29 (@1x, @2x, @3x)
- 40x40 (@1x, @2x, @3x)
- 60x60 (@2x, @3x)
- 76x76 (@1x, @2x)
- 83.5x83.5 (@2x)
- 1024x1024 (@1x) - App Store

**Herramientas online:**
- https://appicon.co/
- https://www.appicon.build/

---

## Opción 3: Usar un Servicio Online (Más Fácil)

### Recomendado: https://www.appicon.co/

1. Ve a https://www.appicon.co/
2. Sube tu PNG de 1024x1024px
3. Selecciona "iOS" y "Android"
4. Descarga el ZIP
5. Extrae los archivos:
   - Android: Copia las carpetas `mipmap-*` a `android/app/src/main/res/`
   - iOS: Copia los archivos a `ios/pdfsignpoc/Images.xcassets/AppIcon.appiconset/`
6. Rebuild la app

---

## Crear el PNG del Logo desde el Código

Si quieres crear el PNG directamente desde el componente `AppIcon.tsx`, puedes:

### Opción A: Usar react-native-view-shot

```bash
npm install react-native-view-shot
```

Luego crear un componente temporal que renderice el logo y lo capture:

```tsx
import ViewShot from 'react-native-view-shot';
import { AppIcon } from './components/AppIcon';

<ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
  <AppIcon size={1024} />
</ViewShot>
```

### Opción B: Exportar el SVG y convertirlo

1. Copia el contenido del SVG de `AppIcon.tsx`
2. Guárdalo como `logo.svg`
3. Usa una herramienta online o de línea de comandos para convertirlo a PNG

---

## Verificar los Iconos

### Android
1. Abre Android Studio
2. Ve a `android/app/src/main/res/`
3. Verifica que todas las carpetas `mipmap-*` tengan los iconos
4. Rebuild: `./gradlew clean && ./gradlew assembleDebug`

### iOS
1. Abre Xcode
2. Ve a `pdfsignpoc/Images.xcassets/AppIcon.appiconset`
3. Verifica que todos los tamaños estén presentes
4. Rebuild desde Xcode o `npm run ios`

---

## Troubleshooting

### El icono no cambia en Android
```bash
cd android
./gradlew clean
cd ..
npm run android
# O desinstala la app del dispositivo y vuelve a instalar
```

### El icono no cambia en iOS
```bash
cd ios
rm -rf build
pod install
cd ..
npm run ios
# O borra la app del simulador/dispositivo y vuelve a instalar
```

### Error "sharp not found"
```bash
cd apps/mobile
npm install --save-dev sharp
```

---

## Características del Nuevo Logo

El logo incluye:
- ✅ Escudo de prescripción blanco
- ✅ Cruz médica en la parte superior
- ✅ Símbolo "Rx" grande
- ✅ Líneas de prescripción
- ✅ Checkmark de verificación verde
- ✅ Líneas de velocidad/digital (verde y azul)
- ✅ Pulso de salud en la parte inferior
- ✅ Fondo transparente (se adapta a cualquier tema)

---

## Recomendaciones

1. **Usa fondo blanco o de color sólido** para los iconos de la app (no transparente)
2. **Mantén el logo centrado** con padding adecuado
3. **Prueba en diferentes dispositivos** para verificar que se ve bien
4. **Considera crear una versión simplificada** para tamaños muy pequeños (20x20, 29x29)

---

**Status**: Pendiente de generar PNG y ejecutar script
**Fecha**: 24 de Febrero, 2026
