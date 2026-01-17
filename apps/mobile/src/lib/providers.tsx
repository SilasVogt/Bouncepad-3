import type { ReactNode } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import Constants from "expo-constants";
import { tokenCache } from "./clerk";
import { convex } from "./convex";
import { ThemeProvider } from "./theme";

interface ProvidersProps {
  children: ReactNode;
}

const clerkPublishableKey = Constants.expoConfig?.extra
  ?.clerkPublishableKey as string | undefined;

export function Providers({ children }: ProvidersProps) {
  // ThemeProvider is always available
  const themedChildren = <ThemeProvider>{children}</ThemeProvider>;

  // If Clerk or Convex is not configured, just render with theme only
  if (!clerkPublishableKey || !convex) {
    return themedChildren;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {themedChildren}
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
