import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useTrendingPodcasts } from "@/hooks/use-trending-podcasts";
import TrendingCard from "@/components/trending-card";
import type { PodcastIndexFeed } from "@/services/podcastIndex";

export default function HomeScreen() {
  const { feeds, errorMessage, isPending, isRefetching, refetch } =
    useTrendingPodcasts();

  const { width } = useWindowDimensions();
  const columns = width >= 720 ? 3 : 2;

  const renderItem = ({ item }: { item: PodcastIndexFeed }) => {
    return (
      <View style={styles.itemWrapper}>
        <TrendingCard feed={item} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isPending ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.loadingText}>Loading trending podcasts...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refetch()}
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
          numColumns={columns}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
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
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginTop: 10,
  },
  itemWrapper: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 10,
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
