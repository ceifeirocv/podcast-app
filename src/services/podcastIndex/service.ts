import * as Crypto from "expo-crypto";

const DEFAULT_PODCAST_INDEX_BASE_URL = "https://api.podcastindex.org/api/1.0";

// Keep Podcast Index secrets on a trusted backend in production.
// This client is useful for local/dev flows and server-side signing patterns.

type QueryValue = string | number | boolean | null | undefined;

export type PodcastIndexQuery = Record<string, QueryValue>;

export type PodcastIndexAuthConfig = {
  apiKey: string;
  apiSecret: string;
  userAgent: string;
  baseUrl?: string;
};

export type PodcastIndexFeed = {
  id: number;
  title: string;
  url?: string;
  image?: string;
  artwork?: string;
  author?: string;
  description?: string;
  language?: string;
  trendScore?: number;
  [key: string]: unknown;
};

export type PodcastIndexEpisode = {
  id: number;
  title: string;
  enclosureUrl?: string;
  [key: string]: unknown;
};

export type PodcastIndexEnvelope = {
  status?: string;
  description?: string;
  [key: string]: unknown;
};

export type PodcastIndexFeedsResponse = PodcastIndexEnvelope & {
  feeds: PodcastIndexFeed[];
};

export type PodcastIndexTrendingQuery = {
  max?: number;
  since?: number;
  lang?: string;
  cat?: string;
  notcat?: string;
};

export type PodcastIndexTrendingResponse = PodcastIndexEnvelope & {
  feeds: PodcastIndexFeed[];
  count?: number;
  max?: number | null;
  since?: number | null;
};

export type PodcastIndexEpisodesResponse = PodcastIndexEnvelope & {
  items: PodcastIndexEpisode[];
};

export class PodcastIndexError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "PodcastIndexError";
    this.status = status;
    this.payload = payload;
  }
}

export class PodcastIndexConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PodcastIndexConfigError";
  }
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toSearchParams = (query?: PodcastIndexQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (!query) {
    return params;
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    params.append(key, String(value));
  });

  return params;
};

const buildUrl = (
  baseUrl: string,
  path: string,
  query?: PodcastIndexQuery,
): string => {
  const url = new URL(
    path.replace(/^\//, ""),
    `${baseUrl.replace(/\/$/, "")}/`,
  );
  const params = toSearchParams(query);
  const queryString = params.toString();

  if (queryString.length > 0) {
    url.search = queryString;
  }

  return url.toString();
};

const createAuthHeaders = async (
  config: PodcastIndexAuthConfig,
): Promise<Record<string, string>> => {
  const authDate = Math.floor(Date.now() / 1000).toString();
  const authorization = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    `${config.apiKey}${config.apiSecret}${authDate}`,
  );

  return {
    "User-Agent": config.userAgent,
    "X-Auth-Key": config.apiKey,
    "X-Auth-Date": authDate,
    Authorization: authorization,
  };
};

const parseJsonSafe = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const createPodcastIndexService = (config?: PodcastIndexAuthConfig) => {
  const resolvedConfig: PodcastIndexAuthConfig = {
    apiKey: config?.apiKey ?? process.env.EXPO_PUBLIC_PODCAST_INDEX_KEY ?? "",
    apiSecret:
      config?.apiSecret ?? process.env.EXPO_PUBLIC_PODCAST_INDEX_SECRET ?? "",
    userAgent:
      config?.userAgent ??
      process.env.EXPO_PUBLIC_PODCAST_INDEX_USER_AGENT ??
      "podcast-app/1.0",
    baseUrl: config?.baseUrl ?? process.env.EXPO_PUBLIC_PODCAST_INDEX_BASE_URL,
  };

  if (!resolvedConfig.apiKey || !resolvedConfig.apiSecret) {
    throw new PodcastIndexConfigError(
      "Missing EXPO_PUBLIC_PODCAST_INDEX_KEY or EXPO_PUBLIC_PODCAST_INDEX_SECRET.",
    );
  }

  const baseUrl = resolvedConfig.baseUrl ?? DEFAULT_PODCAST_INDEX_BASE_URL;

  const request = async <T extends PodcastIndexEnvelope>(
    path: string,
    query?: PodcastIndexQuery,
    init?: Omit<RequestInit, "headers">,
  ): Promise<T> => {
    const authHeaders = await createAuthHeaders(resolvedConfig);

    const response = await fetch(buildUrl(baseUrl, path, query), {
      method: init?.method ?? "GET",
      ...init,
      headers: {
        Accept: "application/json",
        ...authHeaders,
      },
    });

    const payload = await parseJsonSafe(response);

    if (!response.ok) {
      const description =
        isObjectRecord(payload) && typeof payload.description === "string"
          ? payload.description
          : `Request failed with status ${response.status}`;

      throw new PodcastIndexError(description, response.status, payload);
    }

    if (!isObjectRecord(payload)) {
      throw new PodcastIndexError(
        "Podcast Index returned a non-object payload.",
        response.status,
        payload,
      );
    }

    return payload as T;
  };

  return {
    request,
    searchByTerm: (term: string, max = 20) =>
      request<PodcastIndexFeedsResponse>("/search/byterm", { q: term, max }),
    searchByTitle: (title: string, max = 20) =>
      request<PodcastIndexFeedsResponse>("/search/bytitle", { q: title, max }),
    getPodcastByFeedId: (feedId: number) =>
      request<PodcastIndexFeedsResponse>("/podcasts/byfeedid", { id: feedId }),
    getTrendingPodcasts: (query: PodcastIndexTrendingQuery = {}) =>
      request<PodcastIndexTrendingResponse>("/podcasts/trending", query),
    getEpisodesByFeedId: (feedId: number, max = 20) =>
      request<PodcastIndexEpisodesResponse>("/episodes/byfeedid", {
        id: feedId,
        max,
      }),
  };
};
