import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type Episode = {
  id: string;
  title: string;
  pubDate?: string;
  duration?: string;
  audioUrl?: string;
};

type Props = {
  episode: Episode;
  onPlay?: (episode: Episode) => void;
  onDownload?: (episode: Episode) => void;
};

export default function EpisodeListItem({ episode, onPlay, onDownload }: Props) {
  const subtitleParts = [] as string[];
  if (episode.pubDate) subtitleParts.push(new Date(episode.pubDate).toLocaleDateString());
  if (episode.duration) subtitleParts.push(episode.duration);
  const subtitle = subtitleParts.join(' • ');

  return (
    <View style={styles.container} accessibilityRole="button">
      <TouchableOpacity onPress={() => onPlay?.(episode)} accessibilityLabel={`Play ${episode.title}`} style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{episode.title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onPlay?.(episode)} accessibilityLabel="Play" style={styles.iconButton}>
          <Text>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDownload?.(episode)} accessibilityLabel="Download" style={styles.iconButton}>
          <Text>⬇</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  content: { flex: 1 },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '500' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', marginLeft: 8 },
  iconButton: { padding: 8 },
});
