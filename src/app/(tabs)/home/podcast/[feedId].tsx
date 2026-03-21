import React, { useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator, FlatList, RefreshControl, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PodcastHeader from '@/components/PodcastHeader';
import EpisodeListItem, { Episode } from '@/components/EpisodeListItem';
import usePodcast from '@/hooks/usePodcast';

type Params = {
  feedId?: string;
};

export default function PodcastScreen() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();
  const feedId = params.feedId ?? null;

  const { data, isLoading, isError, isRefetching, refetch } = usePodcast(feedId);

  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: Episode }) => (
    <EpisodeListItem
      episode={item}
      onPlay={() => {
        // placeholder
      }}
      onDownload={() => {
        // placeholder
      }}
    />
  ), []);

  const keyExtractor = useCallback((item: Episode) => item.id, []);

  if (!feedId) {
    return (
      <View style={styles.center}>
        <Text>Missing feed id</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading podcast…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Failed to load podcast.</Text>
        <Button title="Retry" onPress={onRetry} accessibilityLabel="Retry loading podcast" />
      </View>
    );
  }

  const podcast = data?.podcast;
  const episodes = data?.episodes ?? [];

  if (!podcast) {
    return (
      <View style={styles.center}>
        <Text>No podcast data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={episodes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={<PodcastHeader artworkUrl={podcast.artworkUrl} title={podcast.title} author={podcast.author} description={podcast.description} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        accessibilityLabel={`Episodes for ${podcast.title}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
