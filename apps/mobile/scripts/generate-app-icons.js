/**
 * Script para generar los iconos de la app en todos los tamaños necesarios
 * 
 * REQUISITOS:
 * 1. Tener un archivo PNG de alta resolución del logo (1024x1024px recomendado)
 * 2. Instalar sharp: npm install --save-dev sharp
 * 
 * USO:
 * node scripts/generate-app-icons.js <ruta-al-logo.png>
 * 
 * Ejemplo:
 * node scripts/generate-app-icons.js assets/app-icon-source.png
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamaños para Android
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Tamaños para iOS
const iosSizes = {
  'AppIcon-20x20@1x': 20,
  'AppIcon-20x20@2x': 40,
  'AppIcon-20x20@3x': 60,
  'AppIcon-29x29@1x': 29,
  'AppIcon-29x29@2x': 58,
  'AppIcon-29x29@3x': 87,
  'AppIcon-40x40@1x': 40,
  'AppIcon-40x40@2x': 80,
  'AppIcon-40x40@3x': 120,
  'AppIcon-60x60@2x': 120,
  'AppIcon-60x60@3x': 180,
  'AppIcon-76x76@1x': 76,
  'AppIcon-76x76@2x': 152,
  'AppIcon-83.5x83.5@2x': 167,
  'AppIcon-1024x1024@1x': 1024,
};

async function generateIcons(sourcePath) {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: No se encontró el archivo ${sourcePath}`);
    process.exit(1);
  }

  console.log('Generando iconos de Android...');
  
  // Generar iconos de Android
  for (const [folder, size] of Object.entries(androidSizes)) {
    const outputDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', folder);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Icono normal
    await sharp(sourcePath)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, 'ic_launcher.png'));

    // Icono redondo
    await sharp(sourcePath)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, 'ic_launcher_round.png'));

    console.log(`✓ Generado ${folder} (${size}x${size})`);
  }

  console.log('\nGenerando iconos de iOS...');
  
  // Generar iconos de iOS
  const iosOutputDir = path.join(__dirname, '..', 'ios', 'pdfsignpoc', 'Images.xcassets', 'AppIcon.appiconset');
  
  if (!fs.existsSync(iosOutputDir)) {
    fs.mkdirSync(iosOutputDir, { recursive: true });
  }

  for (const [name, size] of Object.entries(iosSizes)) {
    await sharp(sourcePath)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(iosOutputDir, `${name}.png`));

    console.log(`✓ Generado ${name} (${size}x${size})`);
  }

  console.log('\n✅ Todos los iconos generados correctamente!');
  console.log('\nPróximos pasos:');
  console.log('1. Android: Los iconos ya están en su lugar');
  console.log('2. iOS: Abre Xcode y verifica que los iconos estén en Images.xcassets/AppIcon.appiconset');
  console.log('3. Rebuild la app: npm run android && npm run ios');
}

// Ejecutar
const sourcePath = process.argv[2];

if (!sourcePath) {
  console.error('Error: Debes proporcionar la ruta al archivo PNG del logo');
  console.error('Uso: node scripts/generate-app-icons.js <ruta-al-logo.png>');
  process.exit(1);
}

generateIcons(sourcePath).catch(err => {
  console.error('Error generando iconos:', err);
  process.exit(1);
});
