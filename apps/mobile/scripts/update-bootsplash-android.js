#!/usr/bin/env node

/**
 * Update Bootsplash Android Resources
 * 
 * This script copies the bootsplash logos from assets/bootsplash
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

// Mapping from bootsplash assets to Android drawable folders
const LOGO_MAPPING = [
  {
    source: 'assets/bootsplash/logo.png',
    dest: 'android/app/src/main/res/drawable-mdpi/bootsplash_logo.png',
    density: 'mdpi (1x)',
  },
  {
    source: 'assets/bootsplash/logo@1,5x.png',
    dest: 'android/app/src/main/res/drawable-hdpi/bootsplash_logo.png',
    density: 'hdpi (1.5x)',
  },
  {
    source: 'assets/bootsplash/logo@2x.png',
    dest: 'android/app/src/main/res/drawable-xhdpi/bootsplash_logo.png',
    density: 'xhdpi (2x)',
  },
  {
    source: 'assets/bootsplash/logo@3x.png',
    dest: 'android/app/src/main/res/drawable-xxhdpi/bootsplash_logo.png',
    density: 'xxhdpi (3x)',
  },
  {
    source: 'assets/bootsplash/logo@4x.png',
    dest: 'android/app/src/main/res/drawable-xxxhdpi/bootsplash_logo.png',
    density: 'xxxhdpi (4x)',
  },
];

function main() {
  log('\n🔄 Updating Android bootsplash logos...', colors.blue);

  const projectDir = path.join(__dirname, '..');
  let successCount = 0;
  let totalCount = LOGO_MAPPING.length;

  for (const mapping of LOGO_MAPPING) {
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
  log('✨ Bootsplash update complete!', colors.green);
  log(`📊 Success: ${successCount}/${totalCount}`, colors.blue);
  log('='.repeat(60) + '\n', colors.cyan);

  if (successCount === totalCount) {
    log('💡 Next steps:', colors.yellow);
    log('   1. Clean build: cd android && ./gradlew clean', colors.reset);
    log('   2. Rebuild app: npm run android', colors.reset);
    log('   3. Check the bootsplash logo on your device\n', colors.reset);
  }
}

try {
  main();
} catch (error) {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
}
