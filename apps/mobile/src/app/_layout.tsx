import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import Constants from "expo-constants";
import { tokenCache } from "../lib/clerk";
import { convex } from "../lib/convex";

const clerkPublishableKey = Constants.expoConfig?.extra
  ?.clerkPublishableKey as string;

if (!clerkPublishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#0a0a0a",
              },
              headerTintColor: "#ededed",
              contentStyle: {
                backgroundColor: "#0a0a0a",
              },
            }}
          />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
