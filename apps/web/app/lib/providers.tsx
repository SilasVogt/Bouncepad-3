import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/tanstack-start";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/tanstack-start";
import { convex } from "./convex";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Wrap your app with this component once you have Clerk and Convex configured.
 *
 * In __root.tsx, change:
 *   <RootDocument><Outlet /></RootDocument>
 * To:
 *   <Providers><RootDocument><Outlet /></RootDocument></Providers>
 */
export function Providers({ children }: ProvidersProps) {
  // If Convex is not configured, just render children without providers
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
