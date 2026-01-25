import type { ReactNode } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { ClerkProvider, ClerkLoaded, ClerkLoading, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { tokenCache } from "./clerk";
import { convex } from "./convex";
import { ThemeProvider } from "./theme";
import { PlayerProvider } from "./player-context";

interface ProvidersProps {
  children: ReactNode;
}

// In Expo SDK 50+, EXPO_PUBLIC_* env vars are available directly via process.env
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Debug logging
console.log("🔑 Clerk key exists:", !!clerkPublishableKey);
console.log("📦 Convex client exists:", !!convex);

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0a0a" }}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={{ color: "#fff", marginTop: 16 }}>Loading...</Text>
    </View>
  );
}

export function Providers({ children }: ProvidersProps) {
  // ThemeProvider and PlayerProvider are always available
  const coreProviders = (
    <ThemeProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </ThemeProvider>
  );

  // If Clerk or Convex is not configured, just render with core providers only
  if (!clerkPublishableKey || !convex) {
    console.log("⚠️ Running without Clerk/Convex - missing config");
    return coreProviders;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoading>
        <LoadingScreen />
      </ClerkLoading>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {coreProviders}
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
