import { useUser } from "@clerk/expo";
import { type Href, Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { createPodcastIndexService } from "@/services/podcastIndex";

export default function HomeScreen() {
  const { user } = useUser();
  const [isCallingApi, setIsCallingApi] = useState(false);

  const handleTestPodcastIndexCall = async () => {
    setIsCallingApi(true);

    try {
      const podcastIndex = createPodcastIndexService();

      const response = await podcastIndex.searchByTerm("technology", 5);
      console.log("[PodcastIndex] searchByTerm response", response);
    } catch (error) {
      console.error("[PodcastIndex] request failed", error);
    } finally {
      setIsCallingApi(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home</Text>
      <Text style={styles.meta}>
        {user?.emailAddresses?.[0]?.emailAddress ?? "Signed in"}
      </Text>
      <Link href={"/profile" as Href} style={styles.profileLink}>
        Open profile
      </Link>
      <Pressable
        accessibilityRole="button"
        onPress={handleTestPodcastIndexCall}
        style={({ pressed }) => [
          styles.callButton,
          pressed ? styles.callButtonPressed : undefined,
          isCallingApi ? styles.callButtonDisabled : undefined,
        ]}
        disabled={isCallingApi}
      >
        <Text style={styles.callButtonLabel}>
          {isCallingApi ? "Calling API..." : "Call Podcast Index"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
  },
  meta: {
    color: "#4b5563",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  profileLink: {
    color: "#0f766e",
    fontSize: 16,
    fontWeight: "700",
  },
  callButton: {
    marginTop: 16,
    backgroundColor: "#0f766e",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  callButtonPressed: {
    opacity: 0.8,
  },
  callButtonDisabled: {
    opacity: 0.55,
  },
  callButtonLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
