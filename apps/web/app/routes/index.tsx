import { createFileRoute } from "@tanstack/react-router";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useUser,
  ClerkLoaded,
} from "@clerk/tanstack-start";
import { useQuery, useMutation } from "convex/react";
import { api } from "@bouncepad/backend/convex/_generated/api";
import { useEffect } from "react";
import { AccentColorPicker } from "~/components/AccentColorPicker";
import { useTheme } from "~/lib/theme";
import { Button, Card, Text, VStack, HStack } from "~/components/ui";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <ClerkLoaded>
      <HomeContent />
    </ClerkLoaded>
  );
}

function HomeContent() {
  const { user } = useUser();
  const convexStatus = useQuery(api.test.ping);
  const createUser = useMutation(api.users.create);
  const { setMode, mode } = useTheme();

  // Sync Clerk user to Convex when signed in
  useEffect(() => {
    if (user) {
      createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: user.fullName ?? undefined,
        imageUrl: user.imageUrl ?? undefined,
      });
    }
  }, [user, createUser]);

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[80vh]">
      <h1 className="text-5xl font-bold motion-preset-slide-down">Bouncepad</h1>
      <p className="mt-4 text-xl text-[var(--muted)] motion-preset-fade motion-delay-200">
        RSS-based livestreaming platform
      </p>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Convex: {convexStatus ? `Connected` : "Loading..."}
      </p>

      <div className="mt-8">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="solid" size="lg">Sign In</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <VStack gap="md" align="center">
            <Text variant="body" accent>
              Signed in as {user?.emailAddresses[0]?.emailAddress}
            </Text>
            <SignOutButton>
              <Button variant="outline" size="lg">Sign Out</Button>
            </SignOutButton>
          </VStack>
        </SignedIn>
      </div>

      {/* Theme Settings */}
      <Card variant="glass" padding="lg" className="mt-12">
        <VStack gap="md">
          <Text variant="h4">Theme Settings</Text>

          <VStack gap="sm">
            <Text variant="label" muted>Mode</Text>
            <HStack gap="sm">
              {(["system", "light", "dark"] as const).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? "solid" : "glass"}
                  size="sm"
                  onPress={() => setMode(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Button>
              ))}
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label" muted>Accent Color</Text>
            <AccentColorPicker />
          </VStack>
        </VStack>
      </Card>
    </div>
  );
}
