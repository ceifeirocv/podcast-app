# Research: Continue — Single Podcast screen and repo compliance

## Executive summary

This report continues the previous research into building a single-podcast screen using the Podcast Index API and ensures compliance with repository instructions (AGENTS.md). It documents the API endpoints to use, authentication/signing requirements, a secure proxy pattern, client architecture (data fetching, caching, playback, downloads), UI and routing recommendations for Expo Router, and an implementation checklist. The final report is saved both in session-state and in the repo's doc/research folder to follow AGENTS.md rules.

## Scope & assumptions

- Target platform: Expo SDK ~55, TypeScript, Expo Router. Project root: `C:\code\podcast\podcast-app`.
- Podcast Index API will be consumed via a trusted backend/proxy; mobile app will not ship the API secret.
- Primary endpoints: `/podcasts/byfeedid` (feed metadata) and `/episodes/byfeedid` (episodes list).
- No production server is provided in the repo; examples use a small serverless/Node proxy pattern.

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

Security guidance (must follow):
- Never embed the API secret in the mobile app binary. Use a small backend/proxy that stores the API secret in environment variables and signs requests server-side.
- The mobile client talks to the proxy (which performs signed PodcastIndex requests) and receives JSON responses.
- Proxy allows implementing caching, rate-limit handling, and request-level logging without exposing secrets.

### Minimal serverless signing example (Node / Vercel / Netlify)

```js
// api/podcast/byfeedid.js  (serverless handler)
import crypto from 'crypto'
import fetch from 'node-fetch'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'missing id' })

  const APIKEY = process.env.PODINDEX_KEY
  const APISECRET = process.env.PODINDEX_SECRET
  const ts = Math.floor(Date.now() / 1000)
  const auth = crypto.createHash('sha1').update(APIKEY + APISECRET + String(ts)).digest('hex')

  const url = `https://api.podcastindex.org/api/1.0/podcasts/byfeedid?id=${encodeURIComponent(id)}`
  const upstream = await fetch(url, { headers: {
    'User-Agent': 'podcast-app/1.0',
    'X-Auth-Key': APIKEY,
    'X-Auth-Date': String(ts),
    'Authorization': auth
  }})
  const body = await upstream.json()
  return res.status(upstream.status).json(body)
}
```

This follows the official signing pattern in the example-code repo[^7].

## Client architecture and data flow

ASCII data flow:

```
Mobile Client (Expo Router)
  ├─> Calls Proxy (/api/proxy/podcasts/byfeedid)  --(HTTPS)-->
  Proxy Server (signs request, caches)  ──> PodcastIndex API
  Proxy returns JSON
  Mobile uses TanStack Query to cache and render
  Mobile uses expo-audio & expo-file-system for playback/downloads
```

Files and folders (recommended):
- src/app/podcast/[feedId].tsx  -- Expo Router screen
- src/components/PodcastHeader.tsx
- src/components/EpisodeListItem.tsx
- src/services/podcastApi.ts  -- client-facing fetchers talking to proxy
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

Example fetchers (talking to proxy):

```ts
// src/services/podcastApi.ts
const BASE = process.env.EXPO_PUBLIC_API_BASE_URL || ''
export async function fetchFeedById(id:number) {
  const res = await fetch(`${BASE}/proxy/podcasts/byfeedid?id=${id}`)
  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
  return json.feed
}

export async function fetchEpisodesByFeedId(id:number, opts?:{max?:number}) {
  const q = new URLSearchParams({ id: String(id) })
  if (opts?.max) q.set('max', String(opts.max))
  const res = await fetch(`${BASE}/proxy/episodes/byfeedid?${q.toString()}`)
  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
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

- Add developer-only API endpoints or stub data for UI tests.
- Run the proxy locally with environment variables to validate signing and API responses.
- Use curl to hit the proxy and verify headers:

```bash
curl -v 'http://localhost:3000/api/proxy/podcasts/byfeedid?id=75075'
```

- Test background playback on both iOS and Android devices (emulators often behave differently for background playback).

## Implementation checklist (concrete todos)

1. Create a small proxy (serverless or Node) that holds API key/secret and exposes `/proxy/podcasts/byfeedid` and `/proxy/episodes/byfeedid` endpoints (env vars: PODINDEX_KEY, PODINDEX_SECRET). [security-critical]
2. Implement client fetchers in `src/services/podcastApi.ts` and types in `src/types/podcast.ts`.
3. Add `src/app/podcast/[feedId].tsx` screen and small presentational components in `src/components`.
4. Add React Query provider (QueryClientProvider) to app root if not present and pick reasonable cache settings.
5. Integrate `expo-audio` and `expo-file-system` for playback and downloads; add background playback config plugin in app.json.
6. Add downloads metadata storage (AsyncStorage or SQLite) and UI for managing downloads.
7. Add error and rate-limit handling UI. Test across devices.

## Recommended libraries

- @tanstack/react-query (data fetching, caching)[^11]
- expo-audio (playback, background controls)[^9]
- expo-file-system (downloads, file information)[^10]
- react-native-async-storage/async-storage or expo-sqlite for persisted metadata

## Confidence assessment

- High confidence: API endpoints and signing method (based on official OpenAPI spec and example-code README)[^1][^7].
- Medium confidence: Specific UX choices (grouping, caching policy), which are recommendations not strict rules.
- Low confidence: Any project-specific integration details or CI/CD choices not present in the repo.

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
