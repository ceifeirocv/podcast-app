import { useAuth } from "@clerk/expo";
import { type Href, Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/sign-in" as Href} />;
  }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="new">
        <NativeTabs.Trigger.Label>New</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus.square.fill" md="add_box" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="books.vertical.fill" md="library_books" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
