import { useAuth } from "@clerk/expo";
import { type Href, Redirect } from "expo-router";

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return <Redirect href={(isSignedIn ? "/home" : "/(auth)/sign-in") as Href} />;
}
