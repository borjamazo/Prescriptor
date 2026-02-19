# Node.js Version Compatibility Fix

## Issue
React Native 0.83 with Node.js 22.22.0 had compatibility issues with Metro bundler due to missing polyfills for newer Node.js APIs.

## Solution
Switched to Node.js 20.19.3 which has better compatibility with React Native 0.83.

## Changes Made

### 1. Metro Config Patches
Created patches for `metro-config@0.83.3` to handle Node.js API compatibility:
- `patches/metro-config+0.83.3.patch`
  - Fixed `os.availableParallelism()` fallback to `os.cpus().length`
  - Fixed `Array.toReversed()` to use `Array.slice().reverse()`

### 2. Navigation Fixes
- Removed deleted `AppSplashScreen` import from `RootNavigator.tsx`
- Added simple loading state with `ActivityIndicator` instead

### 3. Dependencies
- Added `react-native-vector-icons@10.3.0` for icon support
- Updated `android/app/build.gradle` to include vector-icons fonts

### 4. Metro Config Enhancement
Added Node.js polyfill in `metro.config.js`:
```javascript
if (!os.availableParallelism) {
  os.availableParallelism = () => os.cpus().length;
}
```

## Commands to Run

### Automatic (Recommended)
The scripts now automatically use Node 20.19.3:

```bash
npm start
```

```bash
npm run android
```

### Manual (Alternative)
If the automatic method doesn't work:

```bash
nvm use 20.19.3
npm start
```

```bash
nvm use 20.19.3
npm run android
```

### Using .nvmrc
The project now includes a `.nvmrc` file. Simply run:

```bash
nvm use
npm run android
```

## Build Result
✅ BUILD SUCCESSFUL in 2m 24s
✅ App installed and running on device
✅ Metro bundler serving on http://localhost:8081

## Navigation Flow
1. App starts with native splash screen
2. Shows loading indicator while auth context initializes
3. Routes to LoginScreen (not authenticated)
4. After login → Bottom tab navigation with Home/Stats/Sign/Settings screens
