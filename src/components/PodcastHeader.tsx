import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  artworkUrl?: string;
  title: string;
  author?: string;
  description?: string;
};

export default function PodcastHeader({ artworkUrl, title, author, description }: Props) {
  return (
    <View style={styles.container} accessible accessibilityRole="header">
      {artworkUrl ? (
        <Image source={{ uri: artworkUrl }} style={styles.artwork} accessibilityLabel={`${title} artwork`} />
      ) : (
        <View style={[styles.artwork, styles.artworkPlaceholder]} accessibilityLabel="No artwork" />
      )}
      <View style={styles.info}>
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        {author ? <Text style={styles.author}>{author}</Text> : null}
        {description ? <Text style={styles.description} numberOfLines={3}>{description}</Text> : null}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} accessibilityRole="button" accessibilityLabel="Subscribe">
            <Text style={styles.actionText}>Subscribe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} accessibilityRole="button" accessibilityLabel="Share">
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', alignItems: 'flex-start' },
  artwork: { width: 96, height: 96, borderRadius: 8, backgroundColor: '#eee' },
  artworkPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  author: { fontSize: 14, color: '#666', marginBottom: 6 },
  description: { fontSize: 13, color: '#444' },
  actions: { flexDirection: 'row', marginTop: 8 },
  actionButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#eee', borderRadius: 6, marginRight: 8 },
  actionText: { fontSize: 14 },
});
