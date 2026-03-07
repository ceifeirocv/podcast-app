import { SignOutButton } from "@/components/sign-out-button";
import { useUser } from "@clerk/expo";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const { user } = useUser();

  const fullName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "User";

  return (
    <View style={styles.container}>
      {user?.imageUrl ? (
        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackText}>
            {fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <Text style={styles.name}>{fullName}</Text>
      <Text style={styles.email}>
        {user?.emailAddresses?.[0]?.emailAddress ?? ""}
      </Text>

      <View style={styles.signOutWrap}>
        <SignOutButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarFallbackText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  email: {
    marginTop: 6,
    fontSize: 14,
    color: "#4b5563",
  },
  signOutWrap: {
    marginTop: 24,
  },
});
