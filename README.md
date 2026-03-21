# Podcast App

Expo Router podcast app built with Expo SDK 55, React Native 0.83, Clerk auth, and TanStack Query. The current app is an authenticated shell with live Podcast Index data on the home tab.

## Current app

- Clerk is configured at the app root in `src/app/_layout.tsx` with protected auth and signed-in route groups.
- The index route redirects signed-out users to `/(auth)/sign-in` and signed-in users to `/home`.
- The home tab loads trending podcasts from Podcast Index through React Query (`src/app/(tabs)/home/index.tsx` + `src/hooks/use-trending-podcasts.ts`).
- A podcast detail route exists at `src/app/(tabs)/home/podcast/[feedId].tsx` and fetches feed details plus episodes by feed ID.
- The profile modal (`src/app/profile.tsx`) shows the current Clerk user and supports sign out.
- `new` and `library` tabs exist as placeholders while the broader player/offline flows are still being built.

## Implemented screens and flows

- Auth routes under `src/app/(auth)`:
  - `sign-in.tsx`: email/password sign-in and Google SSO
  - `sign-up.tsx`: email/password sign-up, email-code verification, and Google SSO
- Native auth callback routes:
  - `oauth-native-callback.tsx`
  - `sso-callback.tsx`
- Signed-in routes:
  - `src/app/(tabs)/home/index.tsx`
  - `src/app/(tabs)/new/index.tsx`
  - `src/app/(tabs)/library/index.tsx`
  - `src/app/profile.tsx`

## Setup

### Requirements

- pnpm
- Expo development environment for the platform you want to run (`android`, `ios`, or `web`)

### Install

```bash
pnpm install
```

### Environment variables used today

Add these to `.env.local` for local development:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_PODCAST_INDEX_KEY=...
EXPO_PUBLIC_PODCAST_INDEX_SECRET=...
EXPO_PUBLIC_PODCAST_INDEX_USER_AGENT=podcast-app/1.0
EXPO_PUBLIC_PODCAST_INDEX_BASE_URL=https://api.podcastindex.org/api/1.0
```

Notes:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is required now; the app throws on startup if it is missing.
- `EXPO_PUBLIC_PODCAST_INDEX_KEY` and `EXPO_PUBLIC_PODCAST_INDEX_SECRET` are required for the current client-side Podcast Index service.
- `EXPO_PUBLIC_PODCAST_INDEX_USER_AGENT` and `EXPO_PUBLIC_PODCAST_INDEX_BASE_URL` are optional overrides.
- Podcast Index credentials are currently used client-side through `EXPO_PUBLIC_*` variables, so they ship in the client bundle and are insecure for any real production app.
- For this learning/practice project, that security risk is being intentionally ignored so the app can call Podcast Index directly without extra backend setup.
- This README documents the current direct-client behavior honestly and does not recommend a proxy in this repo's practice setup.
- See `doc/research/podcast-index-env.md` for the current behavior and the explicit security caveat for this practice project.

## Scripts

- `pnpm start` - start Expo
- `pnpm android` - run the Android native app
- `pnpm ios` - run the iOS native app
- `pnpm web` - start the web target

## Navigation (Native Tabs)

This project uses Expo Router's native tabs (NativeTabs) to provide a platform-native tab bar on iOS and Android. The implementation lives at `src\app\(tabs)\_layout.tsx`.

Notes:
- Requires Expo SDK 55+ (this project uses `expo: ~55.0.8`). Native tabs are provided by `expo-router/unstable-native-tabs` and are considered alpha/unstable; APIs may change between SDK versions.
- Native tabs rely on native builds. To fully test native-tab behavior (SF Symbols, asset-catalog icons, badges), run on device/simulator with a development build or using `pnpm ios` / `pnpm android` rather than Expo Go.
- For custom icons on iOS, you can use Xcode asset catalogs (`xcasset`) and the `xcasset` prop. For cross-platform icons, use the `sf` (iOS) and `md` (Android) props as used in `src\app\(tabs)\_layout.tsx`.

Quick checklist:
- To run locally with native tabs: `pnpm install` then `pnpm ios` or `pnpm android`, or create a dev build with EAS (`eas build --profile development`).
- Test icon tinting, badge rendering, tab hide/show behavior, and pop-to-root behavior on both platforms.
- If a heavily custom tab design is needed, prefer JavaScript tabs or a custom tab bar instead of NativeTabs.

## Main dependencies

- `expo`, `expo-router`
- `@clerk/expo`
- `@tanstack/react-query`
- `expo-auth-session`, `expo-secure-store`, `expo-web-browser`
- `expo-crypto` for Podcast Index request signing
