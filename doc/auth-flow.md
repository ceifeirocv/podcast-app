# Auth flow

This document describes the current Clerk auth setup in the Expo Router app. It is based on the current implementation in:

- `src/app/_layout.tsx`
- `src/app/(auth)/_layout.tsx`
- `src/app/(auth)/sign-in.tsx`
- `src/app/(auth)/sign-up.tsx`
- `src/app/profile.tsx`
- `src/app/oauth-native-callback.tsx`
- `src/app/sso-callback.tsx`
- `src/components/sign-out-button.tsx`
- `app.json`

## Required environment variable

The app requires:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

`src/app/_layout.tsx` reads `process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` at module scope and throws immediately if it is missing. In practice, auth cannot boot at all without this value.

## Root provider and native configuration

Auth is initialized in `src/app/_layout.tsx`:

- `ClerkProvider` wraps the app.
- `tokenCache` is imported from `@clerk/expo/token-cache` and passed into `ClerkProvider`.
- `QueryClientProvider` sits above Clerk so the app can use React Query after auth is ready.

`app.json` currently includes the native pieces Clerk depends on:

- `scheme: "podcast-app"` for native deep linking
- plugins:
  - `expo-router`
  - `expo-secure-store`
  - `@clerk/expo`

This is the current native auth baseline for the app.

## Route structure and guards

The app uses guard-based routing in `src/app/_layout.tsx`.

### Signed-out routes

These routes are only registered when `!isSignedIn`:

- `/(auth)` - auth screens
- `/oauth-native-callback`
- `/sso-callback`

### Signed-in routes

These routes are only registered when `isSignedIn`:

- `/` - redirect entry point
- `/(tabs)` - main signed-in app
- `/profile` - profile modal

### Additional guard behavior

- `src/app/(auth)/_layout.tsx` redirects signed-in users away from auth screens and back to `/`.
- `src/app/index.tsx` is the switch route:
  - signed out -> `/(auth)/sign-in`
  - signed in -> `/home`
- `src/app/(tabs)/_layout.tsx` also redirects signed-out users back to `/(auth)/sign-in`.

Together, those checks mean auth screens stay public-only and the main app stays signed-in-only.

## Email/password sign-in flow

`src/app/(auth)/sign-in.tsx` implements the current email/password sign-in flow:

1. Collect email address and password in local component state.
2. Call `signIn.password({ emailAddress, password })`.
3. If Clerk returns an error, show the message in the screen.
4. If `signIn.status === "complete"`, call `signIn.finalize()`.
5. Replace the current route with `/`.

After the route replace, the root index redirect and protected stack move the user into the signed-in area.

## Email/password sign-up flow

`src/app/(auth)/sign-up.tsx` implements a two-step email sign-up flow:

1. Collect email address and password.
2. Call `signUp.password({ emailAddress, password })`.
3. If account creation succeeds, call `signUp.verifications.sendEmailCode()`.
4. Switch the UI into verification mode with `awaitingVerification`.
5. Accept the email code and call `signUp.verifications.verifyEmailCode({ code })`.
6. If `signUp.status === "complete"`, call `signUp.finalize()`.
7. Replace the route with `/`.

Notes about the current screen:

- Errors are shown inline from Clerk responses.
- The sign-up screen includes `<View nativeID="clerk-captcha" />`, which is part of the current Clerk UI integration.

## Google SSO flow

Both auth screens support Google SSO through Clerk:

- `src/app/(auth)/sign-in.tsx`
- `src/app/(auth)/sign-up.tsx`

Each screen calls:

```ts
startSSOFlow({ strategy: "oauth_google" })
```

Current behavior:

1. Start the Google SSO flow.
2. Wait for Clerk to return `createdSessionId` and `setActive`.
3. If both are present, call `setActive({ session: createdSessionId })`.
4. Replace the route with `/`.

The current implementation does not add custom redirect URL arguments in the screen code. It relies on the app's Clerk/native configuration and the registered callback routes described below.

## Callback routes

The app currently includes two callback route files:

- `src/app/oauth-native-callback.tsx`
- `src/app/sso-callback.tsx`

Current behavior is intentionally minimal:

- each screen simply does `return <Redirect href="/" />`
- both routes are only exposed from the signed-out side of the root stack

These routes exist as Clerk/Expo Router callback landing points, but they are currently thin redirect shims rather than full callback handlers.

## Profile and sign-out behavior

`src/app/profile.tsx` is a signed-in-only modal screen.

Current profile behavior:

- reads the current Clerk user with `useUser()`
- shows avatar if available
- otherwise derives a fallback initial from name, username, or email
- shows the first email address
- renders the shared `SignOutButton`

`src/components/sign-out-button.tsx` handles sign-out by:

1. calling `useClerk().signOut()`
2. replacing the route with `/(auth)/sign-in`

Even without the manual redirect, the root stack guards would remove signed-in routes after sign-out. The explicit route replace makes the transition immediate.

## Native module / development build caveat

The current auth setup depends on Clerk token caching through `@clerk/expo/token-cache`, which in turn depends on `expo-secure-store`.

That means the running native binary must include the `ExpoSecureStore` native module. If the app is launched in a stale or incompatible native build, `src/app/_layout.tsx` can fail while importing the token cache before the layout renders.

Practical implication:

- after adding or changing native dependencies related to Clerk or SecureStore, rebuild the native app or development build
- use a binary produced by the current project configuration, not an older build missing the native module

If this native module is unavailable at runtime, auth can fail before route guards or screens load because the root Clerk provider never mounts.
