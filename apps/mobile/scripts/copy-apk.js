#!/usr/bin/env node

/**
 * Copy APK Script
 * 
 * This script:
 * 1. Copies the release APK to the root with versioned name
 * 2. Restores debug mode from backup
 * 3. Shows build information
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

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function main() {
  log('\n📦 Finalizing release build...', colors.blue);

  // Get version from package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  // 1. Copy APK
  const sourceApkPath = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  const destApkPath = path.join(__dirname, '..', `PrescriptorApp-v${version}.apk`);

  if (fs.existsSync(sourceApkPath)) {
    fs.copyFileSync(sourceApkPath, destApkPath);
    
    const stats = fs.statSync(destApkPath);
    const fileSize = formatBytes(stats.size);
    
    log(`✅ APK copied: PrescriptorApp-v${version}.apk (${fileSize})`, colors.green);
  } else {
    log('⚠️  APK not found at expected location', colors.yellow);
  }

  // 2. Restore debug mode from backup
  const debugConfigPath = path.join(__dirname, '..', 'src', 'config', 'debugConfig.ts');
  const debugConfigBackupPath = debugConfigPath + '.backup';

  if (fs.existsSync(debugConfigBackupPath)) {
    const backupContent = fs.readFileSync(debugConfigBackupPath, 'utf8');
    fs.writeFileSync(debugConfigPath, backupContent);
    fs.unlinkSync(debugConfigBackupPath);
    log('✅ Debug mode restored', colors.green);
  }

  // 3. Show build information
  log('\n' + '='.repeat(60), colors.cyan);
  log('🎉 BUILD SUCCESSFUL!', colors.green);
  log('='.repeat(60), colors.cyan);
  log(`\n📱 App: Prescriptor`, colors.blue);
  log(`📦 Version: ${version}`, colors.blue);
  log(`📂 Location: apps/mobile/PrescriptorApp-v${version}.apk`, colors.blue);
  
  if (fs.existsSync(destApkPath)) {
    const stats = fs.statSync(destApkPath);
    log(`📏 Size: ${formatBytes(stats.size)}`, colors.blue);
  }
  
  log(`🔧 Debug Mode: Disabled in APK`, colors.blue);
  log(`\n💡 Next steps:`, colors.yellow);
  log(`   1. Test the APK on a real device`, colors.reset);
  log(`   2. Share: apps/mobile/PrescriptorApp-v${version}.apk`, colors.reset);
  log(`   3. Install: adb install apps/mobile/PrescriptorApp-v${version}.apk`, colors.reset);
  log('\n' + '='.repeat(60) + '\n', colors.cyan);
}

try {
  main();
} catch (error) {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
}
