#!/usr/bin/env node

/**
 * Prepare Release Script
 * 
 * This script prepares the app for a release build:
 * 1. Disables debug mode
 * 2. Updates version in build.gradle
 * 3. Creates a backup of debugConfig.ts
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
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function main() {
  log('\n🚀 Preparing release build...', colors.blue);

  // Get version from package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  log(`📦 Version: ${version}`, colors.green);

  // 1. Disable debug mode
  const debugConfigPath = path.join(__dirname, '..', 'src', 'config', 'debugConfig.ts');
  const debugConfigBackupPath = debugConfigPath + '.backup';

  if (fs.existsSync(debugConfigPath)) {
    // Create backup
    const debugConfigContent = fs.readFileSync(debugConfigPath, 'utf8');
    fs.writeFileSync(debugConfigBackupPath, debugConfigContent);
    log('✅ Created backup of debugConfig.ts', colors.green);

    // Disable debug mode
    const updatedContent = debugConfigContent.replace(
      /export const DEBUG_PRESCRIPTION_POSITIONING = true;/g,
      'export const DEBUG_PRESCRIPTION_POSITIONING = false;'
    );

    fs.writeFileSync(debugConfigPath, updatedContent);
    log('✅ Debug mode disabled', colors.green);
  }

  // 2. Update version in build.gradle
  const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
  
  if (fs.existsSync(buildGradlePath)) {
    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
    
    // Parse version (X.Y.Z)
    const [major, minor, patch] = version.split('.').map(Number);
    const versionCode = major * 10000 + minor * 100 + patch;

    // Update versionCode
    buildGradleContent = buildGradleContent.replace(
      /versionCode\s+\d+/,
      `versionCode ${versionCode}`
    );

    // Update versionName
    buildGradleContent = buildGradleContent.replace(
      /versionName\s+"[^"]+"/,
      `versionName "${version}"`
    );

    fs.writeFileSync(buildGradlePath, buildGradleContent);
    log(`✅ Updated build.gradle: versionCode=${versionCode}, versionName="${version}"`, colors.green);
  }

  log('\n✨ Release preparation complete!', colors.green);
  log('📱 Building APK...', colors.blue);
}

try {
  main();
} catch (error) {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
}
