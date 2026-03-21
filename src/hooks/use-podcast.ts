import { useQuery } from "@tanstack/react-query";

import { createPodcastIndexService } from "@/services/podcastIndex";
import type {
  PodcastIndexFeed,
  PodcastIndexEpisode,
  PodcastIndexError,
  PodcastIndexConfigError,
} from "@/services/podcastIndex";

/**
 * A stable, normalized Episode shape used by the app UI.
 */
export interface Episode {
  id: number;
  title: string;
  enclosureUrl?: string;
  description?: string;
  duration?: number | null;
  pubDate?: number | null;
  guid?: string | null;
  [key: string]: unknown;
}

/**
 * usePodcast hook composes two TanStack queries for a single podcast screen.
 * Returns: { podcastQuery, episodesQuery } where:
 * - podcastQuery: useQuery(['podcast', feedId], ...)
 * - episodesQuery: useQuery(['podcastEpisodes', feedId], ...)
 */
export const usePodcast = (feedId?: number | string | null) => {
  const feedIdNum =
    typeof feedId === "string"
      ? Number.parseInt(feedId, 10)
      : typeof feedId === "number"
      ? feedId
      : undefined;

  const podcastIndex = createPodcastIndexService();

  const fetchPodcast = async (): Promise<PodcastIndexFeed | null> => {
    if (!feedIdNum) return null;
    const resp = await podcastIndex.getPodcastByFeedId(feedIdNum);
    const feed = resp.feeds && resp.feeds.length > 0 ? resp.feeds[0] : null;
    return feed;
  };

  const fetchEpisodes = async (): Promise<Episode[]> => {
    if (!feedIdNum) return [];
    const resp = await podcastIndex.getEpisodesByFeedId(feedIdNum, 200);
    const items: PodcastIndexEpisode[] = resp.items ?? [];

    const normalized: Episode[] = items.map((item) => {
      // Normalize common fields available in Podcast Index responses.
      const enclosure = (item as any)["enclosureUrl"] as string | undefined;
      const altEnclosure = (item as any)["enclosure"] as string | undefined;
      const url = enclosure ?? altEnclosure ?? (item as any)["url"];

      const durationRaw = (item as any)["duration"];
      const duration =
        typeof durationRaw === "number"
          ? durationRaw
          : typeof durationRaw === "string"
          ? Number.parseFloat(durationRaw)
          : null;

      const pubDateRaw = (item as any)["datePublished"] ?? (item as any)["pubDate"] ?? (item as any)["date"];
      const pubDate = typeof pubDateRaw === "number" ? pubDateRaw : null;

      return {
        ...item,
        id: item.id,
        title: item.title ?? "",
        enclosureUrl: url,
        description: (item as any)["description"] as string | undefined,
        duration,
        pubDate,
        guid: (item as any)["guid"] as string | null,
      } as Episode;
    });

    return normalized;
  };

  const podcastQuery = useQuery<PodcastIndexFeed | null, PodcastIndexError | PodcastIndexConfigError>({
    queryKey: ["podcast", feedIdNum],
    queryFn: fetchPodcast,
    enabled: Boolean(feedIdNum),
  });

  const episodesQuery = useQuery<Episode[], PodcastIndexError | PodcastIndexConfigError>({
    queryKey: ["podcastEpisodes", feedIdNum],
    queryFn: fetchEpisodes,
    enabled: Boolean(feedIdNum),
  });

  const getQueryErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return "Unable to load podcast data right now.";
  };

  return {
    podcastQuery,
    episodesQuery,
    podcast: podcastQuery.data ?? null,
    episodes: episodesQuery.data ?? [],
    errorMessage:
      podcastQuery.error || episodesQuery.error
        ? getQueryErrorMessage(podcastQuery.error ?? episodesQuery.error)
        : null,
  };
};

export default usePodcast;
