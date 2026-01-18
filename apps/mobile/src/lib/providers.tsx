import type { ReactNode } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import Constants from "expo-constants";
import { tokenCache } from "./clerk";
import { convex } from "./convex";
import { ThemeProvider } from "./theme";
import { PlayerProvider } from "./player-context";

interface ProvidersProps {
  children: ReactNode;
}

const clerkPublishableKey = Constants.expoConfig?.extra
  ?.clerkPublishableKey as string | undefined;

export function Providers({ children }: ProvidersProps) {
  // ThemeProvider and PlayerProvider are always available
  const coreProviders = (
    <ThemeProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </ThemeProvider>
  );

  // If Clerk or Convex is not configured, just render with core providers only
  if (!clerkPublishableKey || !convex) {
    return coreProviders;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {coreProviders}
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
