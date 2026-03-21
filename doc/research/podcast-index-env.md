# Podcast Index environment variables for this practice project

This document explains how Podcast Index is wired in the current codebase and which environment variables the Expo client currently reads for this learning/practice project.

## Current code behavior

Today, `src/services/podcastIndex/service.ts` signs Podcast Index requests directly in the Expo client.

Current client-side variables:

- `EXPO_PUBLIC_PODCAST_INDEX_KEY`
- `EXPO_PUBLIC_PODCAST_INDEX_SECRET`
- `EXPO_PUBLIC_PODCAST_INDEX_USER_AGENT`
- `EXPO_PUBLIC_PODCAST_INDEX_BASE_URL` (optional)

Behavior in the current implementation:

- If `EXPO_PUBLIC_PODCAST_INDEX_BASE_URL` is not set, the client defaults to `https://api.podcastindex.org/api/1.0`.
- The client computes Podcast Index auth headers in-app:
  - `User-Agent`
  - `X-Auth-Key`
  - `X-Auth-Date`
  - `Authorization` (SHA-1 of key + secret + timestamp)
- If the key or secret is missing, the service throws a configuration error.

This matches the current code, but it is not a safe production architecture because the app bundle can expose any `EXPO_PUBLIC_*` value.

## Security status

### Intentionally insecure for practice

The following variables are public Expo environment variables and are therefore bundled into the client:

- `EXPO_PUBLIC_PODCAST_INDEX_KEY`
- `EXPO_PUBLIC_PODCAST_INDEX_SECRET`
- `EXPO_PUBLIC_PODCAST_INDEX_USER_AGENT`
- `EXPO_PUBLIC_PODCAST_INDEX_BASE_URL`

Important:

- `EXPO_PUBLIC_PODCAST_INDEX_SECRET` must be treated as development-only.
- `EXPO_PUBLIC_PODCAST_INDEX_KEY` should also be treated as development-only when paired with direct client-side signing.
- This repo is intentionally keeping those credentials in `EXPO_PUBLIC_*` variables because the goal is hands-on learning and a simpler practice setup.
- That means the security risk is knowingly being ignored for this project.
- It is still insecure for production builds or any app distributed to real users.

If this app is ever distributed externally with the current setup, assume the Podcast Index credentials can be extracted and should be rotated.

## Local development setup for the current implementation

If you need to use the current direct-client approach during local development, add these values to `.env.local`:

```env
EXPO_PUBLIC_PODCAST_INDEX_KEY=your_key_here
EXPO_PUBLIC_PODCAST_INDEX_SECRET=your_secret_here
EXPO_PUBLIC_PODCAST_INDEX_USER_AGENT=podcast-app/1.0
# Optional. Defaults to the official Podcast Index API base URL when omitted.
EXPO_PUBLIC_PODCAST_INDEX_BASE_URL=https://api.podcastindex.org/api/1.0
```

Notes:

- Restart Expo after changing `.env.local`.
- Do not commit `.env.local`.
- Prefer using throwaway or limited-scope credentials for this workflow whenever possible.

## Practical documentation stance for this repo

This repo should document these truths clearly:

1. **Current behavior:** the Expo client reads Podcast Index credentials directly and signs requests itself.
2. **Practice-project stance:** the repo intentionally keeps that insecure setup because reducing infrastructure is part of the learning goal.
3. **Security caveat:** this should not be mistaken for a production-safe pattern.

Future docs in this repository should stay honest about the current direct-client implementation, keep the `EXPO_PUBLIC_*` setup explicit, and avoid recommending a backend proxy in this practice-project documentation.
