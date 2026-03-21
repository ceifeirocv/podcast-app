# Research about Expo (docs.expo.dev)

Date: 2026-03-21

## Executive Summary

Saved research required by AGENTS.md into repo doc/research. Summarized Expo docs (docs.expo.dev) relevant to this codebase: Expo is a cross-platform JS/TS framework with managed tooling and EAS for builds/deploys; app configuration is controlled via app.json/app.config.js/ts and should avoid embedding secrets; Expo Router provides file-based routing (recommended for SDK 55). Recommendations align with AGENTS.md research and security rules.

## Scope & sources

- Repository guidance: `C:\code\podcast\podcast-app\AGENTS.md` (research, git, security, docs rules).
- Expo docs pages consulted (primary):
  - https://docs.expo.dev/ (homepage/overview)
  - https://docs.expo.dev/workflow/configuration/ (app config)
  - https://docs.expo.dev/router/introduction/ (Expo Router)
  - https://docs.expo.dev/eas/ (EAS overview)

## Key findings

- Single-codebase cross-platform model: Expo promotes building one JS/TS project to run on Android, iOS, and web using Expo tooling and Expo Go where appropriate.

- App configuration (app.json / app.config.js / app.config.ts):
  - Place config at project root (next to package.json); it controls prebuild generation, Expo Go loading, and OTA update manifest.
  - Static vs dynamic configs: static (app.json) vs dynamic (app.config.js/ts). Dynamic configs may export functions (synchronous only) and are serialized by CLI.
  - Access config at runtime via `Constants.expoConfig` rather than importing app.json directly. Avoid embedding sensitive secrets in public config.
  - TypeScript support: `app.config.ts` is supported for richer authoring (use `tsx` for imports when needed).

- Config plugins & prebuild: use Expo Config plugins to apply native changes at prebuild time and to extend app config for libraries.

- Expo Router: file-based routing for universal apps; routes map to files under `app/`. Docs recommend `create-expo-app --template default@sdk-55` for SDK 55 projects and highlight features like deep linking, offline-first behavior, and unified navigation.

- EAS: Expo Application Services (EAS) is the build/deploy service for production builds (build, submit, update). Docs link tutorials and EAS CLI flows.

- Developer conveniences: Snack (in-browser), tutorials, and community channels (Discord) for faster onboarding and experimentation.

## Practical implications for this repo (C:\code\podcast\podcast-app)

1. Follow AGENTS.md research rules: persist research to `doc/research/` before making dependent code changes.
2. Ensure an app config exists at the repo root. Prefer `app.config.ts` for environment-based config and keep secrets out of public config. Use `Constants.expoConfig` at runtime.
3. Keep route files under `src/app/` per Expo Router conventions.
4. Adopt EAS for production builds and add EAS notes to README when ready.
5. Add short onboarding doc (commands, SDK 55 note, how to use Expo Go vs dev builds).

## Actionable next steps

- Add `doc/research/after-read-the-agents-md-expo.md` (this file) — done.
- Create example `app.config.ts` template that sources values from env vars and documents `npx expo config --type public` for verification.
- Add a short `README-expo.md` describing local dev commands and EAS overview.

## Confidence assessment

- High confidence: app config rules, `Constants.expoConfig` guidance, Expo Router characteristics, and EAS role — all documented on docs.expo.dev.
- Medium confidence: repository-specific EAS/CI wiring; these require project-specific decisions (signing, credentials).

## Footnotes

[^1]: `C:\code\podcast\podcast-app\AGENTS.md` — research & documentation rules, planning, git hygiene, security, task discipline (see AGENTS.md in repo).

[^2]: "App config (app.json/app.config.js/app.config.ts)" — https://docs.expo.dev/workflow/configuration/ (explains location at project root, static vs dynamic configs, `Constants.expoConfig`, `extra`, config plugins, and TypeScript support).

[^3]: Expo docs homepage (overview & developer conveniences) — https://docs.expo.dev/.

[^4]: Expo Router introduction — https://docs.expo.dev/router/introduction/ (file-based routing, SDK 55 template recommendation).

[^5]: EAS overview & links — https://docs.expo.dev/eas/ (EAS references, tutorials and CLI deploy mentions).

---

_Saved to repo `doc/research` as required by AGENTS.md._
