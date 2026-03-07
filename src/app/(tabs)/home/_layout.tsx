import { UserHeaderButton } from "@/components/user-header-button";
import { Stack } from "expo-router";

export default function HomeStackLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerRight: () => <UserHeaderButton />,
        }}
      />
    </Stack>
  );
}
