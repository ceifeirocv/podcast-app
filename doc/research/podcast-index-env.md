# Podcast Index Environment Variables and Developer Setup

This document describes the environment variables used to integrate with Podcast Index in development, how to set them locally, and security recommendations for production.

## Environment variables

- EXPO_PUBLIC_PODCAST_INDEX_KEY
- EXPO_PUBLIC_PODCAST_INDEX_SECRET

These variables are expected to be available at build/runtime in the app. They are used to authenticate requests to the Podcast Index API.

## Local development

You have two common options for supplying these variables while developing locally:

1. .env.local (recommended for single-developer local setup)

- Create a file at the project root named `.env.local` and add:

  EXPO_PUBLIC_PODCAST_INDEX_KEY=your_key_here
  EXPO_PUBLIC_PODCAST_INDEX_SECRET=your_secret_here

- Restart the Expo/dev server after adding or changing the file so the values are picked up.

2. Expo secrets (recommended for shared/team development)

- Use `expo secret` or the Expo Application Services (EAS) secrets to store environment values securely and inject them into builds.
- Example (local EAS workflow): `eas secret:create --name EXPO_PUBLIC_PODCAST_INDEX_KEY --value "your_key_here"`

Check Expo documentation for exact commands for your chosen workflow.

## Security caveat

Environment variables that begin with `EXPO_PUBLIC_` are included in the built app bundle and are therefore public. This means anyone who inspects your distributed app (or its network traffic) may be able to discover these values.

Because Podcast Index credentials should be kept private, do NOT rely on `EXPO_PUBLIC_*` keys to protect secret information in production.

Recommended production approach:

- Implement a server-side proxy for Podcast Index API requests. Keep your Podcast Index credentials on the server (not in client-side code), and have the client call your server endpoints which in turn call Podcast Index.
- This allows you to enforce rate limits, authentication, and hide credentials from the client bundle.

## Links / Further research

- See existing research notes: ../research/continue-with-the-research-comply-with-the-repo-in.md


---

Last updated: (auto)
