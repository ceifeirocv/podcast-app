import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { createPodcastIndexService } from "@/services/podcastIndex";
import type { PodcastIndexFeed } from "@/services/podcastIndex";

export default function HomeScreen() {
  const [feeds, setFeeds] = useState<PodcastIndexFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTrending = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage(null);

    try {
      const podcastIndex = createPodcastIndexService();
      const response = await podcastIndex.getTrendingPodcasts({
        max: 20,
        lang: "en",
      });

      setFeeds(response.feeds ?? []);
    } catch (error) {
      console.error("[PodcastIndex] request failed", error);
      setErrorMessage("Unable to load trending podcasts right now.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTrending();
  }, [loadTrending]);

  const renderItem = ({ item }: { item: PodcastIndexFeed }) => {
    return (
      <View style={styles.card}>
        {item.artwork || item.image ? (
          <Image
            source={{ uri: String(item.artwork ?? item.image) }}
            style={styles.artwork}
          />
        ) : (
          <View style={styles.artworkFallback}>
            <Text style={styles.artworkFallbackText}>No image</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {item.author || "Unknown author"}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            Trend score: {item.trendScore ?? "-"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Trending Podcasts</Text>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.loadingText}>Loading trending podcasts...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadTrending()}
            style={({ pressed }) => [
              styles.retryButton,
              pressed ? styles.retryButtonPressed : undefined,
            ]}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={feeds}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={() => void loadTrending(true)}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No trending podcasts found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#475569",
    fontSize: 14,
  },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    flexDirection: "row",
    gap: 10,
  },
  artwork: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  artworkFallback: {
    width: 76,
    height: 76,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  artworkFallbackText: {
    fontSize: 11,
    color: "#475569",
  },
  cardBody: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardMeta: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: "#0f766e",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 24,
    fontSize: 14,
  },
});
