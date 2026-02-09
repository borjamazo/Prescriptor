# Repository Guidelines

## Project Structure & Module Organization
App logic lives in `App.tsx` with the React Native bootstrap in `index.js`. Platform scaffolding is under `android/` and `ios/`, Metro/Babel configs sit in the project root, and reusable native patches belong in `patches/` for `patch-package`. Jest specs reside in `__tests__/`, mirroring the component or hook name (for example, `__tests__/PdfSigner.test.tsx`).

## Build, Test & Development Commands
- `npm start`: launches the Metro bundler for local development.
- `npm run android` / `npm run ios`: builds and installs the app on the selected device or simulator; ensure Metro is already running.
- `bundle install` then `bundle exec pod install`: install CocoaPods dependencies before running iOS locally.
- `npm run lint`: executes ESLint with `@react-native` defaults to catch style regressions.
- `npm test`: runs the Jest suite defined in `jest.config.js`.

## Coding Style & Naming Conventions
TypeScript is enabled via `tsconfig.json`; keep components and hooks typed with explicit props to avoid `any`. ESLint plus Prettier enforce single quotes, trailing commas, and two-space indentation. Name components in PascalCase (`PdfSignerSheet`), hooks/utilities in camelCase (`useDocumentPicker`), and keep platform-specific files suffixed with `.ios.tsx` / `.android.tsx` when diverging.

## Testing Guidelines
Write Jest tests alongside features in `__tests__/`, using the `*.test.ts` or `*.test.tsx` suffix. Target rendering of states (loading, errors, signature success) and isolate native module mocks with `jest.mock`. Aim for at least one test per user flow you touch, supplement any snapshots with behavioral assertions, and run `npm test -- --watch` while iterating plus a full run before every PR.

## Commit & Pull Request Guidelines
History in this POC favors concise, imperative subjects—continue with `<scope>: <imperative>` (e.g., `pdf: wire signer picker`). Describe platform impact, reference a Jira/GitHub issue, and limit body lines to 72 chars. Every PR should include: summary of behavior, screenshots or simulator recordings for UI tweaks, a checklist of commands executed (`npm run lint`, `npm test`), and notes about native changes (CocoaPods, Gradle, patches) so reviewers can replicate setup quickly.

## Platform & Configuration Notes
Keep `.env` or credential files out of source; use the native project secrets managers instead. After installing new native modules, re-run `pod install` and regenerate any `patches/` entries with `npx patch-package`. Watchman config (`.watchmanconfig`) and Metro cache can cause stale bundles—clear them with `watchman watch-del-all && npm start -- --reset-cache` before filing platform bugs.
