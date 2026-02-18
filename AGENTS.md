# AGENTS.md

## Repository Overview

- React Native app with entry in `App.tsx` and bootstrap in `index.js`.
- App code lives under `src/` with `navigation/`, `screens/`, `contexts/`, and `services/`.
- Native scaffolding is in `android/` and `ios/`; Metro/Babel/Jest configs are in the root.
- Patches for `patch-package` live in `patches/` and are applied via `npm postinstall`.
- Jest tests live in `__tests__/` and mirror the component or hook name.

## Environment & Setup

- Node.js version must satisfy `>=20.19.4` (see `package.json`).
- Install JS deps with `npm install` (runs `patch-package` postinstall).
- For iOS local runs, install CocoaPods:
  - `bundle install`
  - `bundle exec pod install`

## Build, Lint, and Test Commands

- `npm start`: start Metro bundler.
- `npm run ios`: build/install on iOS simulator (Metro should be running).
- `npm run android`: build/install on Android device/emulator (Metro should be running).
- `npm run lint`: run ESLint using `@react-native` config.
- `npm test`: run Jest with the React Native preset.

### Running a Single Test

- Single file: `npm test -- __tests__/App.test.tsx`
- Single test name: `npm test -- __tests__/App.test.tsx -t "test name"`
- Watch mode: `npm test -- --watch`

### Debugging/Resetting the Packager

- Clear Watchman/Metro cache when bundles get stale:
  - `watchman watch-del-all && npm start -- --reset-cache`

## Code Style Guidelines

### Formatting

- Prettier is configured with:
  - `singleQuote: true`
  - `trailingComma: 'all'`
  - `arrowParens: 'avoid'`
- Indentation is two spaces (consistent with ESLint and existing files).
- Prefer ASCII text unless the file already contains localized copy.

### Imports

- Order imports top-to-bottom as:
  1. React (and hooks),
  2. React Native core,
  3. third-party libraries,
  4. local project modules.
- Keep import groups separated by a blank line.
- Prefer named imports from modules; avoid deep default exports unless required.
- Use relative paths; no path aliases are configured.

### Naming

- Components: PascalCase (e.g., `HomeScreen`, `AuthProvider`).
- Hooks and utilities: camelCase (e.g., `useAuth`, `getPdfSignerMethod`).
- Files: `SomeScreen.tsx`, `SomeService.ts`, `SomeContext.tsx`.
- Platform-specific files: `.ios.tsx` / `.android.tsx`.

### Types and TS Usage

- Use explicit types for props and context values; avoid `any`.
- Prefer `unknown` in `catch` and narrow with `instanceof Error`.
- Keep return types readable for public APIs and services.
- Avoid implicit `any` by keeping hooks typed where needed.

### Error Handling

- Favor early returns for guard conditions.
- For user-facing errors, show `Alert.alert` and update local error state.
- Provide actionable error messages (e.g., missing native module).
- Treat cancellation as a non-error when using native pickers.
- Keep error strings consistent with nearby UI language.

### React/React Native Patterns

- Use function components and hooks (`useState`, `useEffect`, etc.).
- Keep side effects in `useEffect` with explicit dependency arrays.
- Place `StyleSheet.create(...)` at the bottom of the file; keep style keys descriptive.
- Prefer `SafeAreaView`/`SafeAreaProvider` for top-level layouts.
- Prefer `StyleSheet` over inline styles for repeated or shared rules.

### State, Context, and Services

- Keep local UI state with `useState` and lift shared state into contexts.
- Context providers live in `src/contexts/` and are composed in `App.tsx`.
- Service modules in `src/services/` should expose small, typed APIs.

## Testing Guidelines

- Jest config uses the `react-native` preset (see `jest.config.js`).
- Test files belong in `__tests__/` and use `*.test.ts`/`*.test.tsx`.
- Mirror feature names in test filenames (e.g., `__tests__/HomeScreen.test.tsx`).
- Mock native modules with `jest.mock` when necessary.
- Aim for at least one test per user flow you touch.
- Use `react-test-renderer` and wrap renders in `act` when needed.

## Project Structure Details

- `src/navigation/`: navigation stacks and root navigators.
- `src/screens/`: UI screens (auth, settings, home).
- `src/contexts/`: React contexts (auth state, providers).
- `src/services/`: shared services (e.g., biometrics).

## Navigation and UI Copy

- Root navigator lives in `src/navigation/RootNavigator.tsx`; register new screens there.
- Keep navigator options close to the screen registration for readability.
- Match the language of nearby UI copy (English or Spanish) when adding text.
- Prefer inline `Text` for non-blocking errors and `Alert.alert` for blocking ones.

## Native Modules and Patches

- Native module access typically uses `NativeModules` with a defensive wrapper.
- When updating native modules, re-run CocoaPods on iOS and rebuild Android.
- If a dependency needs patching, update `patches/` via `npx patch-package`.

## Commit and PR Expectations

- Commit subjects are concise and imperative with a scope:
  - `<scope>: <imperative>` (example: `pdf: wire signer picker`).
- Keep commit body lines to 72 characters when used.
- PRs should include:
  - A summary of behavior,
  - Screenshots/recordings for UI changes,
  - Commands executed (e.g., `npm run lint`, `npm test`),
  - Notes about native changes (Pods/Gradle/patches).

## Tooling Notes

- ESLint extends `@react-native` via `.eslintrc.js`.
- TypeScript extends `@react-native/typescript-config`.
- Jest uses the `react-native` preset (see `jest.config.js`).

## Security and Configuration Notes

- Do not commit `.env` or credentials. Use native secret storage.
- Avoid checking in local machine paths or secrets in config files.

## Cursor/Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found in this repo.
