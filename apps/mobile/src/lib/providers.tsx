import type { ReactNode } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import Constants from "expo-constants";
import { tokenCache } from "./clerk";
import { convex } from "./convex";

interface ProvidersProps {
  children: ReactNode;
}

const clerkPublishableKey = Constants.expoConfig?.extra
  ?.clerkPublishableKey as string | undefined;

/**
 * Wrap your app with this component once you have Clerk and Convex configured.
 *
 * In _layout.tsx, change:
 *   <><StatusBar /><Stack /></>
 * To:
 *   <Providers><StatusBar /><Stack /></Providers>
 */
export function Providers({ children }: ProvidersProps) {
  // If Clerk or Convex is not configured, just render children without providers
  if (!clerkPublishableKey || !convex) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
