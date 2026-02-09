# Fixes Applied for Node 22.22.0 Compatibility

## Summary
Fixed React Native Android build configuration to work with Node 22.22.0, resolved dependency issues, and updated PDFTron/Apryse SDK API usage for version 10.12.0.

## Changes Made

### 1. Dependencies Fixed
- ✅ Removed outdated patch: `@react-native-community/cli-tools+20.0.0.patch`
  - Reason: CLI version upgraded from 20.0.0 to 20.1.1
  - The patch was causing postinstall failures
  - Original patch handled Metro launch errors gracefully

### 2. Android Build Configuration
- ✅ Updated `android/build.gradle`:
  - Added explicit Android Gradle Plugin version: `8.10.0`
  - Prevents "Could not find com.android.tools.build:gradle" errors
  - Ensures compatibility with Gradle 9.0.0

### 3. Node Version Requirements
- ✅ Updated `package.json` engines:
  - Changed from `"node": ">=20"` to `"node": ">=20.19.4"`
  - Matches React Native 0.83.1 requirements
  - Ensures consistency across all dependencies

### 4. PDFTron/Apryse SDK API Updates (Critical Fix)
- ✅ Updated `PdfSignerModule.kt` to use PDFTron 10.12.0 custom signing API:
  - Replaced deprecated `setSubFilter()` and `setDigestAlgorithm()` methods
  - Implemented custom signing workflow using `createSigDictForCustomSigning()`
  - Added proper certificate conversion from Java X509Certificate to PDFTron X509Certificate
  - Fixed imports: `DigestAlgorithm`, `AlgorithmIdentifier`, `ObjectIdentifier` from `com.pdftron.crypto`
  - Fixed enum values: `DigestAlgorithm.e_sha256`, `ObjectIdentifier.Predefined.SHA256`
  - Fixed save mode: `SDFDoc.SaveMode.INCREMENTAL`
  - Implemented full CMS signature generation workflow for Android KeyChain integration

### 5. Build Cleanup
- ✅ Cleaned Android build artifacts
- ✅ Removed stale node_modules and package-lock.json
- ✅ Reinstalled dependencies with correct Node version requirements

## Current Configuration

### Versions
- **Node**: 22.22.0 (required)
- **React Native**: 0.83.1
- **Gradle**: 9.0.0
- **Android Gradle Plugin**: 8.10.0
- **Kotlin**: 2.1.20
- **Build Tools**: 36.0.0
- **Target SDK**: 36 (Android 15)
- **Min SDK**: 24 (Android 7.0)
- **PDFTron/Apryse SDK**: 10.12.0

### Dependencies Status
- ✅ All npm packages installed successfully
- ✅ Patches applied: `react-native-document-picker@9.3.1`
- ✅ No critical vulnerabilities blocking build
- ✅ Gradle build configuration validated
- ✅ Android APK builds successfully

## Known Issues Resolved

### Issue 1: Patch-package failure
**Error**: Failed to apply patch for @react-native-community/cli-tools
**Solution**: Removed outdated patch file (version mismatch 20.0.0 vs 20.1.1)

### Issue 2: Node version mismatch
**Error**: EBADENGINE warnings for all React Native packages
**Solution**: Updated package.json to require Node >= 20.19.4

### Issue 3: Gradle plugin version ambiguity
**Error**: Potential "Could not find com.android.tools.build:gradle" errors
**Solution**: Explicitly specified AGP version 8.10.0 in build.gradle

### Issue 4: PDFTron API compilation errors (MAJOR)
**Error**: Multiple Kotlin compilation errors in PdfSignerModule.kt
- `Unresolved reference 'setSubFilter'`
- `Unresolved reference 'setDigestAlgorithm'`
- `Unresolved reference 'DigestAlgorithm'`
- `signOnNextSave` signature mismatch with PrivateKey/X509Certificate

**Root Cause**: PDFTron SDK 10.12.0 changed the digital signature API
- Old API methods were removed or changed
- `signOnNextSave()` only accepts PKCS#12 files, not PrivateKey objects
- Custom signing workflow required for Android KeyChain integration

**Solution**: Implemented custom signing workflow
- Use `createSigDictForCustomSigning()` to prepare signature field
- Calculate PDF digest with `calculateDigest()`
- Generate PAdES ESS attributes
- Create CMS signed attributes
- Sign with Android KeyChain private key
- Generate full CMS signature
- Save with `saveCustomSignature()`

## Files Created

1. **SETUP.md**: Comprehensive setup guide with troubleshooting
2. **setup-android.sh**: Automated setup script
3. **FIXES_APPLIED.md**: This document
4. **QUICK_START.md**: Quick reference guide

## Files Modified

1. **android/build.gradle**: Added explicit AGP version
2. **package.json**: Updated Node engine requirement
3. **android/app/src/main/java/com/pdfsignpoc/PdfSignerModule.kt**: Complete rewrite of signing logic
4. **patches/**: Removed outdated cli-tools patch

## Build Verification

✅ **Build Status**: SUCCESS
- Android Debug APK built successfully
- 122 actionable tasks: 37 executed, 85 up-to-date
- No compilation errors
- All Kotlin code compiles correctly
- Native modules linked properly

## Next Steps for User

### You're now ready to run the app!

```bash
# Start Metro bundler
npm start

# In a new terminal, run on Android
npm run android
```

The app should now build and install successfully on your Android device/emulator.

## Technical Details: Custom Signing Implementation

The new signing workflow follows PDFTron's custom signing API:

1. **Prepare signature field**: `createSigDictForCustomSigning()`
2. **Set signing time**: `setSigDictTimeOfSigning()`
3. **Save incrementally**: Prepares document for signing
4. **Calculate digest**: `calculateDigest()` on prepared document
5. **Convert certificates**: Java X509Certificate → PDFTron X509Certificate
6. **Generate PAdES attribute**: `generateESSSigningCertPAdESAttribute()`
7. **Generate signed attributes**: `generateCMSSignedAttributes()`
8. **Sign with private key**: Use Java Signature API with KeyChain private key
9. **Generate CMS**: `generateCMSSignature()` with all components
10. **Save signature**: `saveCustomSignature()` embeds CMS into PDF

This approach allows using Android KeyChain certificates (which don't export private keys as PKCS#12) with PDFTron's signing API.

## Additional Notes

### Security Vulnerabilities
- 7 high severity vulnerabilities reported by npm audit
- These are in development dependencies and don't affect production
- Can be addressed with `npm audit fix` if needed
- Not blocking the build process

### Deprecated Packages
- `react-native-document-picker@9.3.1` is deprecated
  - Migration guide: https://shorturl.at/QYT4t
  - Consider upgrading in future
  - Current patch still works

### Gradle Warnings
- Configuration cache suggestion (performance optimization)
- Gradle 10 compatibility warnings (future-proofing)
- None are blocking issues

## Testing Recommendations

1. **Verify build**: Already done ✅
2. **Run linter**: `npm run lint`
3. **Run tests**: `npm test`
4. **Test on device**: `npm run android`
5. **Test PDF signing**: Use the app to sign a PDF with device certificate

## Support

If issues persist:
1. Check SETUP.md troubleshooting section
2. Clear all caches: `watchman watch-del-all && npm start -- --reset-cache`
3. Rebuild from scratch: `./setup-android.sh`
4. Check PDFTron documentation for custom signing: https://docs.apryse.com/android/guides/features/signature/custom-signing
