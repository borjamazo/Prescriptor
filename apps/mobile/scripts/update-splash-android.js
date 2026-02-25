#!/usr/bin/env node

/**
 * Update Splash Screens Android Resources
 * 
 * This script copies the splash screens from assets/splash_screens/android
 * to the Android drawable folders.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Mapping from splash_screens assets to Android drawable folders
const SPLASH_MAPPING = [
  {
    source: 'assets/splash_screens/android/drawable-mdpi/splash.jpg',
    dest: 'android/app/src/main/res/drawable-mdpi/splash.jpg',
    density: 'mdpi',
  },
  {
    source: 'assets/splash_screens/android/drawable-hdpi/splash.jpg',
    dest: 'android/app/src/main/res/drawable-hdpi/splash.jpg',
    density: 'hdpi',
  },
  {
    source: 'assets/splash_screens/android/drawable-xhdpi/splash.jpg',
    dest: 'android/app/src/main/res/drawable-xhdpi/splash.jpg',
    density: 'xhdpi',
  },
  {
    source: 'assets/splash_screens/android/drawable-xxhdpi/splash.jpg',
    dest: 'android/app/src/main/res/drawable-xxhdpi/splash.jpg',
    density: 'xxhdpi',
  },
  {
    source: 'assets/splash_screens/android/drawable-xxxhdpi/splash.jpg',
    dest: 'android/app/src/main/res/drawable-xxxhdpi/splash.jpg',
    density: 'xxxhdpi',
  },
];

function main() {
  log('\n🔄 Updating Android splash screens...', colors.blue);

  const projectDir = path.join(__dirname, '..');
  let successCount = 0;
  let totalCount = SPLASH_MAPPING.length;

  for (const mapping of SPLASH_MAPPING) {
    const sourcePath = path.join(projectDir, mapping.source);
    const destPath = path.join(projectDir, mapping.dest);

    log(`\n  Copying ${mapping.density}...`, colors.reset);
    log(`    From: ${mapping.source}`, colors.reset);
    log(`    To:   ${mapping.dest}`, colors.reset);

    if (!fs.existsSync(sourcePath)) {
      log(`    ❌ Source file not found`, colors.red);
      continue;
    }

    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      successCount++;
      log(`    ✅ Copied successfully`, colors.green);
    } catch (error) {
      log(`    ❌ Error: ${error.message}`, colors.red);
    }
  }

  log('\n' + '='.repeat(60), colors.cyan);
  log('✨ Splash screens update complete!', colors.green);
  log(`📊 Success: ${successCount}/${totalCount}`, colors.blue);
  log('='.repeat(60) + '\n', colors.cyan);

  if (successCount === totalCount) {
    log('💡 Next steps:', colors.yellow);
    log('   1. Clean build: cd android && ./gradlew clean', colors.reset);
    log('   2. Rebuild app: npm run android', colors.reset);
    log('   3. Check the splash screens on your device\n', colors.reset);
  }
}

try {
  main();
} catch (error) {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
}
