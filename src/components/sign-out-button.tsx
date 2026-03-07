import { useClerk } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in" as Href);
    } catch (error) {
      console.error("Sign-out failed", error);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={handleSignOut}
    >
      <Text style={styles.buttonText}>Sign out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
