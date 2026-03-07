import { QueryClient } from "@tanstack/react-query";

import {
  PodcastIndexConfigError,
  PodcastIndexError,
} from "@/services/podcastIndex";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (error instanceof PodcastIndexConfigError) {
    return false;
  }

  if (
    error instanceof PodcastIndexError &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return false;
  }

  return failureCount < 2;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES_MS,
      gcTime: THIRTY_MINUTES_MS,
      retry: shouldRetryQuery,
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});
