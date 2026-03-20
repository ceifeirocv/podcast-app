import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import type { PodcastIndexFeed } from "@/services/podcastIndex";

export default function TrendingCard({
  feed,
  onPress,
}: {
  feed: PodcastIndexFeed;
  onPress?: () => void;
}) {
  const title = feed.title ?? "Podcast";
  const author = feed.author ?? (feed as any)?.itunes?.author ?? "Unknown author";
  const artworkUri = String(feed.artwork ?? feed.image ?? "");

  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${title} by ${author}. Trend score: ${String((feed as any).trendScore ?? 'unknown')}`}
      accessibilityHint="Opens podcast details"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => [styles.container, pressed ? styles.pressed : undefined]}
    >
      {artworkUri ? (
        <Image source={{ uri: artworkUri }} style={styles.artwork} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.artwork, styles.artworkFallback]}>
          <Text style={styles.artworkFallbackText}>No image</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2} accessibilityRole="header" allowFontScaling={true}>
          {title}
        </Text>
        <Text style={styles.meta} numberOfLines={1} allowFontScaling={true}>
          {author}
        </Text>
        <Text style={styles.meta} numberOfLines={1} allowFontScaling={true}>
          Trend score: {String((feed as any).trendScore ?? "-")}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 8,
  },
  pressed: {
    opacity: 0.95,
  },
  artwork: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  artworkFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  artworkFallbackText: {
    color: "#475569",
    fontSize: 12,
  },
  body: {
    marginTop: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  meta: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
});
