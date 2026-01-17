import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/tanstack-start";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/tanstack-start";
import { convex } from "./convex";
import { ThemeProvider } from "./theme";

interface ProvidersProps {
  children: ReactNode;
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: ProvidersProps) {
  // ThemeProvider is always available
  const themedChildren = <ThemeProvider>{children}</ThemeProvider>;

  // If Convex or Clerk is not configured, just render with theme only
  if (!convex || !publishableKey) {
    return themedChildren;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {themedChildren}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
