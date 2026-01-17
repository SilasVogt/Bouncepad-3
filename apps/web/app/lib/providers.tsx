import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/tanstack-start";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/tanstack-start";
import { convex } from "./convex";
import { ThemeProvider, ThemeProviderBasic } from "./theme";

interface ProvidersProps {
  children: ReactNode;
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: ProvidersProps) {
  // If Convex or Clerk is not configured, use basic theme (no Convex sync)
  if (!convex || !publishableKey) {
    return <ThemeProviderBasic>{children}</ThemeProviderBasic>;
  }

  // Full providers with Convex sync
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider>{children}</ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
