# React Native Android Setup Guide

## Prerequisites

### Required Software
- **Node.js**: 22.22.0 (or >= 20.19.4)
- **Java JDK**: 17 or higher
- **Android Studio**: Latest version with Android SDK
- **Watchman**: For file watching (macOS)

## Node Version Setup

You're currently on Node 16.13.0, but this project requires Node 22.22.0.

### Switch to Node 22.22.0

Using **nvm** (recommended):
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 22.22.0
nvm install 22.22.0
nvm use 22.22.0
nvm alias default 22.22.0
```

Using **Homebrew** (macOS):
```bash
brew install node@22
brew link --overwrite node@22
```

Verify installation:
```bash
node --version  # Should show v22.22.0
```

## Installation Steps

### 1. Clean Previous Installation
```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Clean Android build
cd android && ./gradlew clean && cd ..

# Clear Metro cache
watchman watch-del-all
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
```

### 2. Install Dependencies
```bash
# Install npm packages
npm install

# Verify patches applied successfully
# Should see: react-native-document-picker@9.3.1 ✔
```

### 3. Android Environment Setup

Ensure these environment variables are set in `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export JAVA_HOME=$(/usr/libexec/java_home)
```

Apply changes:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### 4. Verify Android SDK
```bash
# Check SDK installation
sdkmanager --list | grep "build-tools;36"

# Install if missing
sdkmanager "build-tools;36.0.0" "platforms;android-36"
```

## Running the App

### Start Metro Bundler
```bash
npm start
```

### Run on Android (in a new terminal)
```bash
# List available devices/emulators
adb devices

# Run the app
npm run android
```

## Troubleshooting

### Issue: "Unsupported engine" warnings
**Solution**: Upgrade to Node 22.22.0 as shown above.

### Issue: Gradle build fails
**Solution**: Clean and rebuild
```bash
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

### Issue: Metro bundler cache issues
**Solution**: Reset cache
```bash
watchman watch-del-all
npm start -- --reset-cache
```

### Issue: Native module linking errors
**Solution**: Rebuild native modules
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
npm run android
```

### Issue: "Could not find com.android.tools.build:gradle"
**Solution**: Already fixed in `android/build.gradle` with explicit AGP version.

### Issue: Patch-package fails
**Solution**: Outdated patches have been removed. If you need to create new patches:
```bash
# Make changes to node_modules
npx patch-package <package-name>
```

## Build Configuration

### Current Setup
- **React Native**: 0.83.1
- **Gradle**: 9.0.0
- **Android Gradle Plugin**: 8.10.0
- **Kotlin**: 2.1.20
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 15)
- **Compile SDK**: 36
- **NDK**: 27.1.12297006

### Key Dependencies
- `react-native-document-picker`: 9.3.1 (with patch)
- `react-native-safe-area-context`: 5.5.2
- `pdftron`: 10.12.0 (native PDF library)

## Development Workflow

1. **Start Metro**: `npm start`
2. **Run Android**: `npm run android` (in new terminal)
3. **Lint**: `npm run lint`
4. **Test**: `npm test`

## Next Steps

After switching to Node 22.22.0:
1. Run `npm install` to reinstall dependencies
2. Run `npm run android` to build and launch the app
3. Verify the app runs without errors

## Additional Notes

- The project uses Hermes engine (enabled in `gradle.properties`)
- Patches are managed via `patch-package` (runs on postinstall)
- Native modules require rebuilding after dependency changes
- Keep Watchman running for optimal development experience
