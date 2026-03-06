---
applyTo: "src/app/**/*.tsx"
description: "Use when creating or editing Expo Router route files under src/app, including _layout.tsx files, static routes, and dynamic routes."
---

# Expo Router Route Rules

- Keep all route files under `src/app/`.
- Use `_layout.tsx` files for navigator/layout wrappers only.
- Prefer shallow route nesting; add route groups only when there is a clear feature boundary.
- Use static route files for known paths (for example, `podcasts.tsx`).
- Use dynamic route files for parameterized paths (for example, `[feedId].tsx`).
- Use Expo Router primitives for navigation and params:
  - `Link` for declarative links.
  - `useRouter()` for imperative navigation.
  - `useLocalSearchParams()` for route params.

# Screen Implementation Rules

- Keep screens focused on rendering and user interactions.
- Move API calls and side effects to hooks/services (`src/hooks`, `src/services`).
- Handle loading, error, and empty states explicitly in each route screen.
- Keep route params typed and validated before using them.

# Layout And Navigation Consistency

- Root `src/app/_layout.tsx` should define the top-level navigation container.
- Nested `_layout.tsx` files should only define local navigator options for that subtree.
- Avoid duplicating navigation logic across multiple route files.

# Import And Type Safety

- Prefer aliases from `tsconfig.json`:
  - `@/*` for `src/*`
  - `@assets/*` for `assets/*`
- Avoid `any`; use explicit types, unions, and guards for route params and data.
