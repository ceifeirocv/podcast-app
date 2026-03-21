import { useEffect, useState, useCallback } from 'react';

export type Episode = { id: string; title: string; pubDate?: string; duration?: string; audioUrl?: string };
export type Podcast = { id: string; artworkUrl?: string; title: string; author?: string; description?: string };

type Result = {
  data?: { podcast: Podcast; episodes: Episode[] };
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
};

// Lightweight placeholder hook that returns mocked data.
export function usePodcast(feedId?: string | null): Result {
  const [data, setData] = useState<Result['data'] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(!Boolean(feedId));
  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const fetchData = useCallback(async () => {
    if (!feedId) {
      setIsLoading(false);
      return;
    }
    setIsRefetching(true);
    setIsError(false);
    try {
      // Simulate network
      await new Promise((r) => setTimeout(r, 400));
      const podcast = {
        id: feedId,
        artworkUrl: 'https://placekitten.com/300/300',
        title: `Podcast ${feedId}`,
        author: 'Sample Author',
        description: 'This is a sample podcast description provided by the placeholder hook.',
      } as Podcast;
      const episodes: Episode[] = Array.from({ length: 12 }).map((_, i) => ({
        id: `${feedId}-ep-${i + 1}`,
        title: `Episode ${i + 1} - An example episode for feed ${feedId}`,
        pubDate: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
        duration: `${30 + i} min`,
        audioUrl: `https://example.com/audio/${feedId}/ep${i + 1}.mp3`,
      }));

      setData({ podcast, episodes });
    } catch (err) {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [feedId]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, isRefetching, refetch };
}

export default usePodcast;
