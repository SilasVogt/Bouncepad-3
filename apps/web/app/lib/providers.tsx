import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/tanstack-start";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/tanstack-start";
import { convex } from "./convex";

interface ProvidersProps {
  children: ReactNode;
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: ProvidersProps) {
  // If Convex or Clerk is not configured, just render children without providers
  if (!convex || !publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
