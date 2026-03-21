import React, { useCallback } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import usePodcast from '@/hooks/usePodcast';
import type { Episode as EpisodeType } from '@/components/EpisodeListItem';

type Params = { feedId?: string; episodeId?: string };

export default function EpisodeDetailsScreen() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();
  const feedId = params.feedId ?? null;
  const episodeId = params.episodeId;

  const { data, isLoading, isError, refetch } = usePodcast(feedId);

  const episodes: EpisodeType[] = data?.episodes ?? [];
  const episode = episodes.find((e) => e.id === episodeId);

  const onPlay = useCallback(() => {
    // placeholder for play action
    // e.g., enqueue playback or open player
  }, []);

  const onDownload = useCallback(() => {
    // placeholder for download action
  }, []);

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
        <Text>Loading episode…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Failed to load episode.</Text>
        <Button title="Retry" onPress={refetch} accessibilityLabel="Retry loading episode" />
      </View>
    );
  }

  if (!episode) {
    return (
      <View style={styles.center}>
        <Text>Episode not found.</Text>
        <Button title="Back" onPress={() => router.back()} accessibilityLabel="Go back" />
      </View>
    );
  }

  const pubDate = episode.pubDate ? new Date(episode.pubDate).toLocaleString() : 'Unknown date';
  const duration = episode.duration ?? 'Unknown duration';
  const description = episode.description ?? 'No show notes available';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} accessibilityLabel={`Episode details for ${episode.title}`}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => router.back()} accessibilityLabel="Go back" />
      </View>

      <Text style={styles.title}>{episode.title}</Text>
      <Text style={styles.meta}>{pubDate} • {duration}</Text>

      <View style={styles.actions}>
        <Button title="Play" onPress={onPlay} accessibilityLabel={`Play ${episode.title}`} />
        <View style={{ width: 12 }} />
        <Button title="Download" onPress={onDownload} accessibilityLabel={`Download ${episode.title}`} />
      </View>

      <View style={styles.notes}>
        <Text style={styles.sectionTitle}>Show Notes</Text>
        <Text>{description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  meta: { fontSize: 12, color: '#666', marginBottom: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  notes: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
});
