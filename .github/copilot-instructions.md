# Project Guidelines

## Stack And Scope

- This is a React Native app using Expo SDK 55 and TypeScript (`strict: true`).
- React version is `19.2.4` and React Native version is `0.83.2`.
- Router: Expo Router with typed routes enabled.
- Auth provider: Clerk (Expo-native flow).
- Content provider: Podcast Index API.
- Core user capabilities:
  - Browse and search podcasts.
  - Stream and listen to episodes.
  - Download episodes and play offline.

## Existing Repo Baseline

- Current app is a minimal Expo scaffold.
- App entry is Expo Router via `package.json` main = `expo-router/entry`.
- Routing root is `src/app/`.
- Current route files:
  - `src/app/_layout.tsx`
  - `src/app/index.tsx`
- Legacy scaffold files `index.ts` and `App.tsx` may exist, but routing/render tree comes from Expo Router.
- Config file:
  - `app.json`
- Package manager: `pnpm`.
- Available scripts:
  - `pnpm start`
  - `pnpm android`
  - `pnpm ios`
  - `pnpm web`

## Current State And Gaps

- This repository is intentionally at scaffold stage.
- Expo Router base setup is in place; route expansion should happen in `src/app/`.
- Clerk, Podcast Index proxy integration, `expo-audio`, and `expo-file-system` usage are expected future feature work, not completed integrations.
- There is no test/lint pipeline yet; do not assume `test`, `lint`, or CI scripts exist.

## Build And Validation

- Use existing scripts for run/validation.
- If no tests are present, do not invent fake test commands.
- For feature work, always do a TypeScript-safe implementation and keep changes scoped.

## Architecture Conventions To Follow

- Prefer this structure when adding new code:
  - `src/app` for Expo Router route files and layout groups.
  - `src/components` for reusable UI.
  - `src/services` for API clients and external integrations.
  - `src/hooks` for reusable stateful logic.
  - `src/store` for app state (playback queue, downloads, filters, session flags).
  - `src/types` for DTO/domain types.
  - `src/utils` for pure helpers.
  - `src/constants` for static config and keys.
- Keep API calls and storage access out of UI components.
- Keep side effects in hooks/services.

## Routing Conventions (Expo Router)

- Keep route files under `src/app/`.
- Use `_layout.tsx` files to define navigator/layout wrappers.
- Use static route files like `podcasts.tsx` and dynamic routes like `[feedId].tsx`.
- Prefer shallow route nesting unless deeper grouping is necessary.
- Use Expo Router primitives (`Link`, `useRouter`, `useLocalSearchParams`) for navigation and params.

## TypeScript Rules

- Use explicit types for API responses and domain models.
- Validate and normalize remote payloads before UI consumption.
- Avoid `any`; prefer narrow unions and type guards.
- Prefer path aliases already configured in `tsconfig.json`:
  - `@/*` -> `src/*`
  - `@assets/*` -> `assets/*`

## Environment Variables

- Use `.env.local` for local development values (already gitignored).
- Add env typings in `expo-env.d.ts` when introducing new `EXPO_PUBLIC_*` variables.
- Required for auth integration:
  - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Required once Podcast Index proxy is added:
  - Base URL for trusted backend proxy (for example, `EXPO_PUBLIC_API_BASE_URL`).
- Never store Podcast Index secret in Expo app code or public env vars.

## Clerk (Expo) Rules

- Use Clerk Expo patterns (provider at app root, hooks in components).
- Use secure token caching mechanisms recommended for Expo-native Clerk flows.
- Keep Clerk publishable key in env as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Do not hardcode keys/tokens in source files.
- For native auth UX, prefer custom screens and hook-based flows.

## Podcast Index Integration Rules

- Treat Podcast Index as a service layer concern (`src/services/podcastIndex/*`).
- Required auth headers per request include:
  - `User-Agent`
  - `X-Auth-Key`
  - `X-Auth-Date`
  - `Authorization` (SHA-1 of key + secret + epoch timestamp)
- Never expose the Podcast Index API secret in the mobile client bundle.
- Preferred approach:
  - Call Podcast Index through a trusted backend/proxy that signs requests.
  - Mobile app consumes only proxy endpoints.
- Start with endpoints aligned to user goals:
  - Search: `/search/byterm`, `/search/bytitle`
  - Feed details: `/podcasts/byfeedid` or `/podcasts/byfeedurl`
  - Episodes: `/episodes/byfeedid`, `/episodes/byfeedurl`

## Audio Playback Rules (Expo SDK 55)

- Prefer `expo-audio` patterns for playback and status handling.
- Keep one source of truth for playback state (current episode, queue, position, speed, playing).
- Handle app background behavior intentionally (audio mode + lock screen metadata where needed).
- Always handle loading/buffering/error states in player UI.

## Offline Download Rules

- Persist episode downloads with `expo-file-system` APIs.
- Store audio files in app-managed directories and keep metadata index in app storage/state.
- Metadata should include at least:
  - episode id/guid
  - feed id
  - title
  - local file uri
  - file size
  - download timestamp
  - last played position
- On playback start, prefer local file if present; otherwise stream remote URL.
- Add cleanup policies for stale/failed partial downloads.

## UX Priorities

- Fast search and browse interactions.
- Reliable player controls (play/pause/seek/speed).
- Clear download state (queued/downloading/downloaded/failed).
- Smooth resume behavior for partially played episodes.

## Safety And Secrets

- Do not commit secrets or tokens.
- Avoid logging sensitive auth values.
- If a feature requires new env vars, document names in code comments or README updates.

## Pull Request Quality Bar

- Keep changes small and focused.
- Update or add types when API shapes evolve.
- Include basic failure handling (network error, empty state, unauthorized state, missing file state).
- Preserve existing project style and keep code readable without over-commenting.

## Installed Agent Skills

- `building-native-ui`: use for Expo Router UI composition, screen patterns, and native-feeling layout decisions.
- `expo-tailwind-setup`: use only when introducing Tailwind/NativeWind setup.
- `native-data-fetching`: use for any network request, caching, and error-handling patterns.
- `tanstack-query`: use for data fetching and caching patterns if TanStack Query is introduced.
