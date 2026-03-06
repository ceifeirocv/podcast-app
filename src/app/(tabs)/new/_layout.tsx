import { Stack } from "expo-router";

export default function NewStackLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: "New" }} />
    </Stack>
  );
}
