This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Node.js Version Requirement

This project requires **Node.js 20.19.3** for compatibility with React Native 0.83 and Metro bundler.

### Using nvm (Recommended)

If you have [nvm](https://github.com/nvm-sh/nvm) installed:

```sh
# Install Node 20.19.3 if you don't have it
nvm install 20.19.3

# Use Node 20.19.3 (automatic with .nvmrc)
nvm use

# Or explicitly
nvm use 20.19.3
```

The project includes a `.nvmrc` file, so `nvm use` will automatically select the correct version.

### Automatic Node Version Switching

The npm scripts (`npm start`, `npm run android`, `npm run ios`) automatically switch to Node 20.19.3 using nvm. If you encounter issues, manually run `nvm use 20.19.3` before running commands.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

## Node.js Version Issues

If you see errors like `_os.default.availableParallelism is not a function` or `configs.toReversed is not a function`:

1. Ensure you're using Node 20.19.3:
   ```sh
   nvm use 20.19.3
   node --version  # Should show v20.19.3
   ```

2. Clear Metro cache:
   ```sh
   watchman watch-del-all
   npm start -- --reset-cache
   ```

3. Clean and rebuild:
   ```sh
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

## Metro Bundler Issues

If Metro fails to start or you see bundling errors:

```sh
# Kill any process on port 8081
lsof -ti:8081 | xargs kill -9

# Clear all caches
watchman watch-del-all
rm -rf node_modules/.cache
npm start -- --reset-cache
```

## General Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
