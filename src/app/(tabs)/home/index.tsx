import { useUser } from "@clerk/expo";
import { type Href, Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home</Text>
      <Text style={styles.meta}>
        {user?.emailAddresses?.[0]?.emailAddress ?? "Signed in"}
      </Text>
      <Link href={"/profile" as Href} style={styles.profileLink}>
        Open profile
      </Link>
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
});
