---
framework: expo
applies_to: expo-sdk-50+ / react-native
---

# Glossary — Expo + React Native

> Read this file when `framework-detection` resolves to `expo`. Pair with CLAUDE.md §Ubiquitous Language.

| Term | Meaning |
|------|---------|
| **Expo Router** | File-based routing in `app/` (Expo SDK 50+). Each file is a route; `_layout.tsx` defines layout/stack/tabs. Equivalent role to React Router's Route Module. |
| **`<Stack>` / `<Tabs>` / `<Drawer>`** | Layout components from `expo-router` that wrap nested routes. Replace manual `@react-navigation` plumbing in most cases. |
| **Config Plugin** | A function in `app.json` / `app.config.ts` `plugins:` array that mutates native project files at prebuild. Example: `expo-camera` adds `NSCameraUsageDescription`. |
| **Prebuild** | `bunx expo prebuild --clean` — regenerates `ios/` / `android/` from `app.json` + plugins. Required after dependency change with native code. |
| **Dev Client** | A custom build of the Expo Go app that includes your native dependencies. Required when a library is not in vanilla Expo Go (e.g., `react-native-mmkv`). |
| **EAS Build** | Cloud build service (`eas.json`). Distinct profiles for `development` / `preview` / `production`. Triggered by `eas build`. |
| **EAS Update** | OTA update channel for JS/asset updates without a store release. Tied to a build's `runtimeVersion`. |
| **`useNavigation()` / `router`** | Two ways to navigate in Expo Router. Prefer `router.push('/path')` for explicit paths; `useNavigation()` for advanced gestures. |
| **`SafeAreaView` / `useSafeAreaInsets`** | From `react-native-safe-area-context`. Pad against notch/home-indicator. Mandatory on top-level screens. |
| **Reanimated Worklet** | A JS function with `'worklet'` directive that runs on the UI thread. Required for 60fps gesture/scroll animations. |
| **Hermes** | JS engine on iOS/Android. Already default in modern Expo. Affects stack traces and performance profiling. |
| **`expo-constants`** | Source of truth for app metadata (`Constants.expoConfig`). Read at runtime instead of hard-coding versions. |
