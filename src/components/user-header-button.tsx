import { useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export function UserHeaderButton() {
  const { user } = useUser();
  const router = useRouter();

  const initialsSource =
    user?.firstName ||
    user?.fullName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "U";

  const initial = initialsSource.charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={() => router.push("/profile" as Href)}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      {user?.imageUrl ? (
        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.fallbackAvatar}>
          <Text style={styles.fallbackText}>{initial}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 4,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  fallbackAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
