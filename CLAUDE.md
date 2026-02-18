# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                          # Start Metro bundler
npm run android                    # Build and run on Android (Metro must be running)
npm run ios                        # Build and run on iOS (Metro must be running)
npm run lint                       # ESLint with @react-native defaults
npm test                           # Run Jest suite
npm test -- --watch                # Run Jest in watch mode
npm test -- --testPathPattern=Foo  # Run a single test file

# iOS only (first clone or after native dep changes)
bundle install
bundle exec pod install
```

After adding native modules: re-run `pod install` (iOS) and regenerate patches with `npx patch-package`. Clear stale Metro caches with `watchman watch-del-all && npm start -- --reset-cache`.

## Architecture

**React Native 0.83.1** (New Architecture / Fabric enabled) with TypeScript. The app is Android-primary for the PDF signing workflow; iOS scaffolding exists but the native `PdfSigner` module is Android-only.

### JS/TS Layer (`src/`)

| Path | Role |
|---|---|
| `App.tsx` | Root — mounts `SafeAreaProvider`, `AuthProvider`, and `RootNavigator`. Hides splash screen on mount. |
| `src/contexts/AuthContext.tsx` | In-memory auth state (`isAuthenticated`, `biometricsEnabled`). `login()`/`logout()` are stubs — there is no real auth server call yet. |
| `src/navigation/RootNavigator.tsx` | Switches between `AuthStack` and `AppStack` based on `isAuthenticated`. |
| `src/navigation/AuthStack.tsx` | Unauthenticated stack: `LoginScreen`. |
| `src/navigation/AppDrawer.tsx` | Authenticated native stack: `HomeScreen` (default), `AccountScreen`, `SettingsScreen`. Named `AppStack` despite the file name. |
| `src/screens/HomeScreen.tsx` | Core PDF signing UI. Picks a PDF via `react-native-document-picker`, calls the native `PdfSigner` module (`NativeModules.PdfSigner.signPdf`), then allows opening/sharing the result. |
| `src/services/BiometricService.ts` | Stub service that resolves `true` after 500 ms — not yet wired to a real biometrics API. |

### Native Layer (Android)

All custom native code lives in `android/app/src/main/java/com/pdfsignpoc/`:

| File | Role |
|---|---|
| `PdfSignerModule.kt` | Exposes `signPdf`, `sharePdf`/`sharePDF`, `openPdf`/`openPDF` to JS. Signing flow: prompts Android KeyChain for a certificate alias → retrieves `PrivateKey` + `X509Certificate` chain → calls `signWithApryse()`. |
| `PdfSignerPackage.kt` | Registers `PdfSignerModule` with the React Native bridge. |
| `MainApplication.kt` | Adds `PdfSignerPackage` to the package list. |

**PDF signing implementation** (`signWithApryse`): Uses the **Apryse/PDFTron SDK** (`com.pdftron:pdftron:10.12.0`). The flow is PAdES CAdES-detached (ETSI subfilter). Key steps: create/find a `DigitalSignatureField` → `createSigDictForCustomSigning` → incremental save → `calculateDigest` → build PKCS#1 DigestInfo → sign with `NONEwithRSA` → assemble full CMS via `generateCMSSignature` → `saveCustomSignature`. Signatures are saved to the device Downloads folder (scoped storage on API ≥ 29, legacy otherwise).

PDFNet is initialized lazily with an empty (demo) license key.

### Patch

`patches/react-native-document-picker+9.3.1.patch` replaces `GuardedResultAsyncTask` with plain `AsyncTask` to fix a build incompatibility with RN 0.83 New Architecture. Applied automatically via `postinstall` (`patch-package`).

## Naming & Style

- Components: PascalCase; hooks/utilities: camelCase.
- Platform-specific files: `.ios.tsx` / `.android.tsx` suffix.
- Commit style: `<scope>: <imperative>` (e.g., `pdf: wire signer picker`).
- UI strings are in Spanish (the app targets Spanish-speaking users).
