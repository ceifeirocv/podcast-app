# Research: "Cannot find native module 'ExpoSecureStore'" + Expo Router _layout warnings

Date: 2026-03-20

## Executive Summary

While running the app in a development build the Metro logs show two correlated failures: (1) a runtime error "Cannot find native module 'ExpoSecureStore'" that originates during module import; and (2) Expo Router reporting a missing default export for `_layout.tsx` and subsequent `useAuth` errors complaining the `<ClerkProvider />` is not present. The immediate root cause is a top-level import of Clerk's token cache which pulls in `expo-secure-store` (a native module). Because the native module is missing in the running binary, the import throws during module evaluation, preventing the layout module from exporting its default component and producing the router/provider errors.

Short remediation paths (in order of recommendation):
- Install the native dependency and rebuild the development client (recommended, permanent fix).
- For faster iteration or CI-free debugging: guard/delay the tokenCache import so the module load won't throw at startup (temporary workaround).

## Symptoms (observed)

- Metro/dev-client logs include: "Cannot find native module 'ExpoSecureStore'" (stack points to `expo-secure-store` while importing Clerk's token-cache). This happens while evaluating `src\app\_layout.tsx`.
- Expo Router logs: "Route './_layout.tsx' is missing the required default export. Ensure a React component is exported as default." (caused because module evaluation aborted on import error).
- `useAuth` throws: "useAuth can only be used within the <ClerkProvider /> component", because the layout failed to initialize and wrap child routes with Clerk's provider.

(These same messages are visible in the user's runtime log that motivated this research.)

## Root cause analysis (concise)

1. `src\app\_layout.tsx` imports Clerk's tokenCache at module scope: `import { tokenCache } from "@clerk/expo/token-cache"`[^1].
2. `@clerk/expo/token-cache` (or the Clerk Expo package) imports `expo-secure-store` to implement the token cache for native platforms.
3. When the JS engine evaluates the layout module it hits that import; `expo-secure-store` internally calls `requireNativeModule('ExpoSecureStore')` which throws because the currently installed app binary does not contain the native `ExpoSecureStore` module.
4. The thrown Error stops module evaluation; the layout module never finishes evaluating and therefore the bundler/runtime sees no default export for the route file -> router warning.
5. Because the layout couldn't be initialized, child screens that call `useAuth()` execute without a Clerk provider in the component tree and throw the provider-related error.

Dependency chain (ASCII):

┌──────────────────────────┐   imports    ┌──────────────────────────┐
│ src\app\_layout.tsx     │ ───────────▶│ @clerk/expo/token-cache  │
└──────────────────────────┘              └──────────────────────────┘
                                                 │
                                                 ▼
                                      ┌──────────────────────────┐
                                      │ expo-secure-store (JS)   │
                                      └──────────────────────────┘
                                                 │
                                                 ▼
                                      ┌──────────────────────────┐
                                      │ native module: ExpoSecureStore
                                      └──────────────────────────┘

When the native module is missing, the chain fails during JS `require`/import and the top-level module throws.

## Evidence (repo + docs)

- `C:\code\podcast\podcast-app\src\app\_layout.tsx` imports `tokenCache` and passes it into `<ClerkProvider>`[^1].
- `C:\code\podcast\podcast-app\src\app\index.tsx` calls `useAuth()` at the route level[^2]; when the layout fails the screen runs outside of `<ClerkProvider />`.
- `C:\code\podcast\podcast-app\package.json` does not list `expo-secure-store` or `@clerk/expo` among dependencies (the project depends on Expo SDK 55) — this suggests either the native dependency is not installed or the running dev-client binary doesn't include the module[^3].
- `expo-secure-store` docs confirm it is a native module with config/plugin requirements and note that missing native code requires building a new binary to include it[^4].
- Clerk's official starter shows the token cache implemented with `expo-secure-store` on native platforms (tokenCache that checks Platform.OS !== 'web') — that is the same integration pattern used in this repo[^5].
- Expo/EAS docs document that adding a native module requires rebuilding the dev client / creating a development build (or using a binary that bundles the native module) so that native code is present at runtime[^6].
- Community issues show the identical runtime error pattern ("Cannot find native module 'X'") when a native module isn't present in the binary or the dev client wasn't rebuilt[^7].

## Recommended fixes (ordered)

1) Permanent (recommended): install the native dependency and rebuild a development build that includes it.

- Commands (prefer `npx expo install` to match SDK-compatibility; repo uses pnpm so `pnpm` is also acceptable):

  - Install packages:
    - npx expo install expo-secure-store
    - pnpm add @clerk/expo    # or: npm install @clerk/expo

  - Rebuild a development client so the native module exists in the device build:
    - Using EAS (recommended for managed projects):
      - npx eas build --profile development --platform android
      - npx eas build --profile development --platform ios
      - Install the generated dev-client on the device/emulator and then run `npx expo start --dev-client`.
    - For local ad-hoc builds (fast iteration):
      - npx expo prebuild    # generates native projects if you need them
      - npx expo run:android  # builds + installs locally
      - npx expo run:ios      # macOS required for iOS

  - Verify: after installing a dev-client that contains the native code, the runtime error about `ExpoSecureStore` should disappear. The layout module will evaluate successfully and the router/provider warnings should stop.

Notes: use `npx expo install` instead of directly editing `package.json` to ensure an SDK-compatible version of `expo-secure-store` is chosen[^4]. If the project already uses EAS profiles, prefer `eas build --profile development` to produce a development binary.

2) Fast temporary workaround (developer convenience)

If rebuilding a dev client isn't practical during rapid iteration, patch the layout to avoid throwing during module evaluation so the app can at least run (without persistent token storage). This is a temporary measure and reduces security/persistence of tokens.

- Replace the top-level static import of the tokenCache with a guarded/try-catch `require` or dynamic import so missing native modules don't throw at module-evaluation time.

Example (quick, synchronous guarded require):

```ts
// old (top-level static import - causes crash if native module missing)
// import { tokenCache } from "@clerk/expo/token-cache";

// new - runtime guard
let tokenCache: any;
try {
  // require is synchronous and can be caught if native module throws when required
  tokenCache = require("@clerk/expo/token-cache").tokenCache;
} catch (err) {
  console.warn("tokenCache not available (native module missing), running without secure token cache:", err);
  tokenCache = undefined;
}
```

Then continue to pass `tokenCache` into `<ClerkProvider tokenCache={tokenCache}>` — Clerk will fall back to an in-memory cache on platforms where a secure cache isn't available. This avoids a hard crash while you iterate.

Caveats:
- This is a temporary developer workaround only. It means tokens won't be persisted securely (or at all) between runs unless the native module is present.
- Prefer the rebuild solution as soon as practicable.

3) Defensive pattern (recommended if changing code): platform-check + dynamic import

- Use `Platform.OS !== 'web'` to conditionally create the secure token cache and only attempt imports on native platforms. See Clerk starter token cache for an example[^5]. Example (async/dynamic):

```ts
import { Platform } from 'react-native';
let tokenCache;
if (Platform.OS !== 'web') {
  try {
    tokenCache = require('@clerk/expo/token-cache').tokenCache;
  } catch (e) {
    console.warn('tokenCache import failed:', e);
  }
}
```

This pattern prevents web or missing-native-module crashes and mirrors the implementation in Clerk's starter cache implementation[^5].

## How to verify the fix

- After rebuilding a dev client (preferred):
  - Reinstall/run the newly built binary on your device/emulator.
  - Start Metro: `npx expo start --dev-client` and open app in the dev-client.
  - Confirm the "Cannot find native module 'ExpoSecureStore'" message is gone.
  - Confirm Expo Router no longer warns about `_layout.tsx` missing a default export and that `useAuth()` no longer throws about the Clerk provider.

- After applying the guarded-require workaround (temporary):
  - Start Metro/Expo Go as normal. The app should load though token persistence will be disabled.
  - Check device logs for the `console.warn` message emitted by the catch block above.

## Minimal code-change recommendation (if short patch is desired)

Edit `C:\code\podcast\podcast-app\src\app\_layout.tsx` and replace the top-level `import { tokenCache }` with the guarded code snippet above. This is the smallest change to avoid the fatal import-time exception while keeping the rest of the layout logic intact.

## Confidence assessment

- Confidence: High.
  - The runtime stack shown in the error (requireNativeModule → expo-secure-store → Clerk token-cache → _layout.tsx) matches the observed import chain and explains both the native-module error and the router/provider symptoms.
  - Repo files show a top-level tokenCache import and a `useAuth()` call in a route screen, which aligns exactly with the failure mode[^1][^2].
  - External docs and starter code confirm Clerk + Expo commonly use `expo-secure-store` as the native token cache and that development builds must include native modules (EAS/dev-client) for the native code to be present[^4][^5][^6].

- What is inferred vs. directly observed:
  - Directly observed: the import site in `_layout.tsx`, the useAuth usage in `index.tsx`, the package.json dependencies listing, and `expo-secure-store` docs, and Clerk starter cache implementation[^1][^2][^3][^4][^5].
  - Inferred: whether `expo-secure-store` is actually absent from the installed binary on the user's device. The error message strongly indicates this; the repo's `package.json` also does not list it so the most likely cause is either the package isn't installed or the development binary was built without it (or the running Metro session is pointing at a dev-client that lacks that native module).

## Quick checklist (actionable)

- [ ] Run: `npx expo install expo-secure-store`
- [ ] Add Clerk if missing: `pnpm add @clerk/expo` (or `npm install @clerk/expo`)
- [ ] Rebuild dev client (EAS): `npx eas build --profile development --platform android` (and/or iOS)
- [ ] Start Metro: `npx expo start --dev-client` and open the newly-installed dev client on device/emulator
- [ ] If blocked from rebuilding, apply guarded `require()` workaround in `_layout.tsx` so app can run during iteration

---

## Footnotes

[^1]: `C:\code\podcast\podcast-app\src\app\_layout.tsx:1-3,15-21` — file imports `tokenCache` and passes it to `<ClerkProvider>`.

[^2]: `C:\code\podcast\podcast-app\src\app\index.tsx:1-11` — route screen calls `useAuth()`.

[^3]: `C:\code\podcast\podcast-app\package.json:11-26` — project dependencies (SDK 55) do not list `expo-secure-store` or `@clerk/expo`.

[^4]: Expo SecureStore docs: "Expo SecureStore" — `https://docs.expo.dev/versions/latest/sdk/securestore/` (describes that SecureStore is a native module and contains installation/config notes and states it is included in Expo Go for the referenced SDK) .

[^5]: Clerk Expo starter token cache (example implementation using `expo-secure-store`): [clerk/clerk-expo-starter/cache.ts](https://github.com/clerk/clerk-expo-starter/blob/main/cache.ts) (token cache uses SecureStore and guards web platforms).

[^6]: Expo build / development-build guidance (rebuild dev client when native modules are added): `https://docs.expo.dev/build/setup/` (see "development build" / `expo-dev-client` guidance and EAS build references).

[^7]: Example community issue showing identical runtime error when dev-client/binary lacks native modules: `https://github.com/expo/expo/issues/32030`.


---

Report saved by Copilot CLI research assistant.
