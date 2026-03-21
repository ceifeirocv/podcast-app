# Native Tabs (Expo Router) — Notes and QA

Saved from session research: "Expo Native Tabs — Research Report".

Summary

This project uses Expo Router's unstable NativeTabs API to provide a platform-native tab bar. Keep this file updated with any changes to SDK, Xcode, or Android toolchain requirements.

Quick checklist

- SDK: Expo 55+ (project uses ~55.0.8)
- Files: `src\app\(tabs)\_layout.tsx`
- Run with: `pnpm ios` / `pnpm android` / `eas build --profile development` for dev builds
- Tests: icons, badges, hide/show, pop-to-root, deep linking

Details

- See Expo docs: https://docs.expo.dev/router/advanced/native-tabs/
- Avoid dynamic removal of tabs at runtime (remounts navigator and resets state).
- Use system icons (sf/md) where possible for predictable tinting and sizing.

Manual QA steps

1. Start dev build on iOS (simulator/device). Check SF symbol icons and selected variants.
2. Start dev build on Android. Check material icons and original color rendering for image assets.
3. Test badge display for large numbers and empty badges.
4. Test `disablePopToTop` and `disableScrollToTop` props in the `NativeTabs.Trigger` to observe default behavior.
5. Test `hidden` prop and confirm navigator state effects.

Notes

- This API is unstable; wrap usage and keep it isolated.
- Update this file when Expo SDK or expo-router versions change.

Saved from: C:\Users\YasCeifa\.copilot\session-state\63b112f3-34c5-43f9-a759-83c294d54625\research\expo-native-tabs-read-the-agents-md-first.md
