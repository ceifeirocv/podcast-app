import { useQuery } from "@tanstack/react-query";

import { createPodcastIndexService } from "@/services/podcastIndex";
import type {
  PodcastIndexConfigError,
  PodcastIndexError,
  PodcastIndexFeed,
} from "@/services/podcastIndex";

const TRENDING_QUERY_KEY = [
  "podcasts",
  "trending",
  { lang: "en", max: 20 },
] as const;

const fetchTrendingPodcasts = async (): Promise<PodcastIndexFeed[]> => {
  const podcastIndex = createPodcastIndexService();
  const response = await podcastIndex.getTrendingPodcasts({
    max: 20,
    lang: "en",
  });

  return response.feeds ?? [];
};

const getQueryErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load trending podcasts right now.";
};

export const useTrendingPodcasts = () => {
  const query = useQuery<
    PodcastIndexFeed[],
    PodcastIndexError | PodcastIndexConfigError
  >({
    queryKey: TRENDING_QUERY_KEY,
    queryFn: fetchTrendingPodcasts,
  });

  return {
    ...query,
    feeds: query.data ?? [],
    errorMessage: query.error ? getQueryErrorMessage(query.error) : null,
  };
};
