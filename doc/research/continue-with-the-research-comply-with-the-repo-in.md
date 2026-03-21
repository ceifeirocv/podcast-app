# Research: Continue — Single Podcast screen and repo compliance

## Executive summary

This report continues the previous research into building a single-podcast screen using the Podcast Index API and ensures compliance with repository instructions (AGENTS.md). It documents the API endpoints to use, authentication/signing requirements, the direct client-side practice architecture currently used in this repo, data fetching/caching/playback/download recommendations, UI and routing suggestions for Expo Router, and an implementation checklist. The final report is saved both in session-state and in the repo's `doc/research` folder to follow AGENTS.md rules.

## Scope & assumptions

- Target platform: Expo SDK ~55, TypeScript, Expo Router. Project root: `C:\code\podcast\podcast-app`.
- Current repo note: `src/services/podcastIndex/service.ts` already supports direct client-side signing with `EXPO_PUBLIC_PODCAST_INDEX_KEY`, `EXPO_PUBLIC_PODCAST_INDEX_SECRET`, `EXPO_PUBLIC_PODCAST_INDEX_USER_AGENT`, and optional `EXPO_PUBLIC_PODCAST_INDEX_BASE_URL`.
- Chosen practice-project direction: keep using direct client-side Podcast Index requests from the Expo app so the project stays simple and the request-signing flow remains visible while learning.
- Explicit learning-only exception: this approach exposes sensitive values through Expo public env variables. That security risk is intentionally being ignored in this practice repo for learning purposes and should not be treated as production guidance.
- Primary endpoints: `/podcasts/byfeedid` (feed metadata) and `/episodes/byfeedid` (episodes list).
- No backend/proxy is required for the current practice setup.

## Key API details (what to call)

- GET /podcasts/byfeedid?id={feedId}
  - Required query param: `id` (integer). Optional: `pretty` for debug output.
  - Returns top-level `feed` object with properties: id, podcastGuid, title, url, originalUrl, link, description, author, ownerName, image, artwork, lastUpdateTime, episodeCount, categories, value, funding, etc.[^1][^2][^3]

- GET /episodes/byfeedid?id={feedId}
  - Returns `items` array of episode objects in reverse chronological order. Query params include `max`, `since`, `enclosure`, `fulltext`, `newest`, `pretty`.[^4][^5]
  - Episode object contains: id, title, guid, datePublished, enclosureUrl, enclosureType, enclosureLength, duration, episode/season numbers, image, chaptersUrl, transcriptUrl, persons, value, soundbites, etc.[^5][^6]

Use both endpoints to render a rich podcast screen: feed header + episodes list.

## Authentication and security (important)

Podcast Index requires per-request headers: `User-Agent`, `X-Auth-Key`, `X-Auth-Date`, and `Authorization`. `X-Auth-Date` is the current unix timestamp (seconds). `Authorization` is a SHA-1 hex digest of (apiKey + apiSecret + timestamp). Examples in multiple languages are provided in the official example-code repo.[^7][^8]

Security guidance for this repo:
- The practice project intentionally signs requests in the Expo client with `EXPO_PUBLIC_*` variables so the auth flow is easy to inspect and learn from.
- This is insecure for production because Expo public env values are bundled into the client and can be extracted.
- For this repo's current practice goal, accept that risk explicitly and continue with direct calls anyway.
- If this project ever moves beyond practice/learning, replace the public-secret approach before treating it as a real deployment design.

### Minimal direct signing example (Expo / TypeScript)

```ts
import { createPodcastIndexService } from '@/services/podcastIndex/service'

const podcastIndex = createPodcastIndexService()

export async function fetchFeedById(feedId: number) {
  const response = await podcastIndex.getPodcastByFeedId(feedId)
  return response.feeds[0] ?? null
}

export async function fetchEpisodesByFeedId(feedId: number, max = 20) {
  const response = await podcastIndex.getEpisodesByFeedId(feedId, max)
  return response.items
}
```

This keeps signing inside the app using the same official SHA-1 header pattern described in the example-code repo[^7], but without introducing a proxy layer.

## Client architecture and data flow

ASCII data flow:

```
Mobile Client (Expo Router)
  ├─> Signs request in app using expo-crypto + public env vars
  ├─> Calls PodcastIndex API directly over HTTPS
  ├─> Receives JSON response in app
  Mobile uses TanStack Query to cache and render
  Mobile uses expo-audio & expo-file-system for playback/downloads
```

Files and folders (recommended):
- src/app/podcast/[feedId].tsx  -- Expo Router screen
- src/components/PodcastHeader.tsx
- src/components/EpisodeListItem.tsx
- src/services/podcastApi.ts  -- client-facing fetchers wrapping `createPodcastIndexService()`
- src/hooks/usePodcast.ts  -- combined useQuery hooks (feed + episodes)
- src/store/playback.ts  -- single-source-of-truth for player state (Zustand or context)
- src/types/podcast.ts

## TypeScript types (suggested)

```ts
// src/types/podcast.ts
export type Feed = {
  id: number
  podcastGuid?: string
  title?: string
  description?: string
  image?: string
  artwork?: string
  link?: string
  author?: string
  episodeCount?: number
  lastUpdateTime?: number
  value?: any
  funding?: any
}

export type Episode = {
  id: number
  title?: string
  description?: string
  guid?: string
  datePublished?: number
  enclosureUrl?: string
  enclosureType?: string
  enclosureLength?: number
  duration?: number | string
  image?: string
  feedId?: number
  chaptersUrl?: string
  transcriptUrl?: string
}
```

Map additional fields as needed using the API schemas (`feed_podcast.yaml`, `item_podcast.yaml`)[^2][^6].

## Data fetching pattern (TanStack Query)

- Provide two queries: `['feed', feedId]` and `['episodes', feedId]`.
- Feed query staleTime: 5-15 minutes (feeds change less frequently).
- Episodes query staleTime: 1-5 minutes; support pagination via `max` and `since` query params.
- Prefetch episodes when navigating to feed screen from search results.
- Use query error handling for 401/429 to show appropriate UI and optionally retry/backoff.

Example fetchers (direct Podcast Index usage):

```ts
// src/services/podcastApi.ts
import { createPodcastIndexService } from '@/services/podcastIndex/service'

const podcastIndex = createPodcastIndexService()

export async function fetchFeedById(id:number) {
  const json = await podcastIndex.getPodcastByFeedId(id)
  return json.feeds[0] ?? null
}

export async function fetchEpisodesByFeedId(id:number, opts?:{max?:number}) {
  const json = await podcastIndex.getEpisodesByFeedId(id, opts?.max ?? 20)
  return json.items || []
}
```

## Example Expo Router screen (src/app/podcast/[feedId].tsx)

The route should use `useLocalSearchParams` and `useQuery` hooks and render header + FlatList.

```tsx
import React from 'react'
import { View, Text, Image, FlatList } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFeedById, fetchEpisodesByFeedId } from '@/services/podcastApi'

export default function PodcastScreen() {
  const { feedId } = useLocalSearchParams()
  const id = Number(feedId)
  const { data: feed, isLoading } = useQuery(['feed', id], () => fetchFeedById(id))
  const { data: episodes } = useQuery(['episodes', id], () => fetchEpisodesByFeedId(id))

  if (isLoading) return <Text>Loading...</Text>

  return (
    <View style={{flex:1}}>
      {feed?.artwork && <Image source={{uri:feed.artwork}} style={{width:120,height:120}} />}
      <Text>{feed?.title}</Text>
      <Text>{feed?.description}</Text>
      <FlatList data={episodes} keyExtractor={e => String(e.id)} renderItem={({item}) => (
        <View>
          <Text>{item.title}</Text>
        </View>
      )} />
    </View>
  )
}
```

Follow project routing rules by placing this file under `src/app` as `src/app/podcast/[feedId].tsx` to keep route params typed and managed by Expo Router.

## Playback & downloads

- Playback: use `expo-audio` hooks `useAudioPlayer`, `useAudioPlayerStatus` for per-episode playback or `useAudioPlaylist` for queue support. Configure `setAudioModeAsync({ shouldPlayInBackground: true })` and enable the config plugin `enableBackgroundPlayback: true` in app.json for native background playback controls and lock-screen metadata.[^9]

- Downloading: use `expo-file-system` (Paths.cache, Paths.document) and `File.downloadAsync` or `createDownloadResumable`. Save metadata (episode id, feed id, localUri, fileSize, downloadedAt, lastPlayedPosition) in local storage (AsyncStorage) or a small SQLite DB for indexation. Use `FileSystem.getInfoAsync(localUri)` to validate local files before playback.[^10]

- Prefer local file when present; otherwise stream `enclosureUrl`.

Example download flow:

```ts
import * as FileSystem from 'expo-file-system'

async function downloadEpisode(enclosureUrl, fileName) {
  const local = FileSystem.cacheDirectory + fileName
  const { uri } = await FileSystem.downloadAsync(enclosureUrl, local)
  // store metadata in AsyncStorage or SQLite
  return uri
}
```

## Offline & sync considerations

- Keep a downloads index with metadata for all downloaded episodes.
- Provide cleanup policy: LRU or manual delete and limit total storage usage.
- On app boot, validate files exist and remove broken entries.
- For episodes list caching, persist the last successful API response in storage (fallback to that when offline).

## UI/UX recommendations

- Show a sticky header with artwork, title, author, and subscribe/share actions.
- Display episode list grouped by season/newest and include duration and download status.
- Provide a download button with progress; show toast/snackbar on success/failure.
- Provide skeleton loaders and explicit empty states.
- Respect explicit content flags and provide content warnings if needed (the API returns `explicit` fields).[ ^2][^6]

## Testing & verification

- Add developer-only stub data for UI tests if network coupling becomes a problem.
- Run the Expo app with the required Podcast Index env vars to validate signing and API responses.
- Validate direct requests from app code or with a small Node/Expo script that reproduces the same signed headers:

```ts
const podcastIndex = createPodcastIndexService()
const feed = await podcastIndex.getPodcastByFeedId(75075)
console.log(feed.feeds[0]?.title)
```

- Test background playback on both iOS and Android devices (emulators often behave differently for background playback).

## Implementation checklist (concrete todos)

1. Keep `src/services/podcastIndex/service.ts` as the low-level signed client and reuse it instead of adding a proxy.
2. Implement higher-level fetchers in `src/services/podcastApi.ts` and types in `src/types/podcast.ts`.
3. Add `src/app/podcast/[feedId].tsx` screen and small presentational components in `src/components`.
4. Add React Query provider (QueryClientProvider) to app root if not present and pick reasonable cache settings.
5. Integrate `expo-audio` and `expo-file-system` for playback and downloads; add background playback config plugin in `app.json`.
6. Add downloads metadata storage (AsyncStorage or SQLite) and UI for managing downloads.
7. Add error and rate-limit handling UI. Test across devices with the direct client-side API flow.

## Recommended libraries

- @tanstack/react-query (data fetching, caching)[^11]
- expo-audio (playback, background controls)[^9]
- expo-file-system (downloads, file information)[^10]
- react-native-async-storage/async-storage or expo-sqlite for persisted metadata

## Confidence assessment

- High confidence: API endpoints and signing method (based on official OpenAPI spec and example-code README)[^1][^7].
- Medium confidence: Specific UX choices (grouping, caching policy), which are recommendations not strict rules.
- Low confidence: Any future production-hardening decisions, because this document intentionally prioritizes a learning-oriented direct-client setup over a secure deployment architecture.

## Footnotes & citations

[^1]: `Podcastindex-org/docs-api/api_src/root.yaml` (commit: 8dc8430f3466ea25b3514f14a6162c8000c0abe0) — OpenAPI root listing paths used by the API.

[^2]: `Podcastindex-org/docs-api/api_src/paths/podcasts/byfeedid.yaml` (commit: 6d07a87980f75e730c8e0efdf3b556adc43dbc28) — endpoint definition for `/podcasts/byfeedid`.

[^3]: `Podcastindex-org/docs-api/api_src/components/properties/feed_podcast.yaml` (commit: 892eaaa3c0334bb54c387da65f1724ead858b10a) — schema for feed (feed-level fields).

[^4]: `Podcastindex-org/docs-api/api_src/paths/episodes/byfeedid.yaml` (commit: faf46dd729a2eeda4b643a0907e13dace72d6021) — endpoint definition for `/episodes/byfeedid` and its parameters.

[^5]: `Podcastindex-org/docs-api/api_src/components/responses/episodes_byfeedid.yaml` (commit: 40b3f7e2c791afa569146d9e6b0058b9804bc219) — response schema (items, count).

[^6]: `Podcastindex-org/docs-api/api_src/components/schemas/item_podcast.yaml` (commit: e46b459139cd7474e297abf45b60f0067f0cfcc3) — episode item schema describing fields like enclosureUrl, duration, chaptersUrl.

[^7]: `Podcastindex-org/example-code/README.md` (commit: ff57c83be7b891c100e9fe5e5fde6331da8cda95) — examples for Node/PHP/Swift that show how to create the `Authorization` SHA-1 header.

[^8]: Podcast Index official site: https://api.podcastindex.org/ — landing and sign-up for API keys.

[^9]: Expo audio docs: https://docs.expo.dev/versions/latest/sdk/audio/ — `useAudioPlayer`, background playback config and lock-screen metadata.

[^10]: Expo FileSystem docs: https://docs.expo.dev/versions/latest/sdk/filesystem/ — downloading, file info, and Paths (cache/document) for storing media files.

[^11]: TanStack Query docs: https://tanstack.com/query/v5/docs/react/overview — guidance on caching, query keys and background fetching.

---

*Repository compliance note:* A copy of this research file has been saved under `doc/research` as required by AGENTS.md and in the session-state research folder for sharing.
