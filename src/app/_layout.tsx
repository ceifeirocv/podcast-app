import { ClerkProvider } from "@clerk/expo";
import { useAuth } from "@clerk/expo";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { queryClient } from "@/services/query-client";
import { tokenCache } from "@clerk/expo/token-cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment.");
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <RootStack />
      </ClerkProvider>
    </QueryClientProvider>
  );
}

function RootStack() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="oauth-native-callback"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="sso-callback" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{ title: "Profile", presentation: "modal" }}
        />
      </Stack.Protected>
    </Stack>
  );
}
