import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  SignOutButton,
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
  ClerkLoaded,
} from "@clerk/tanstack-start";
import { useQuery, useMutation } from "convex/react";
import { api } from "@bouncepad/backend/convex/_generated/api";
import {
  Button,
  Text,
  Input,
  Card,
  Avatar,
  VStack,
  HStack,
  Divider,
} from "~/components/ui";
import { AccentColorPicker } from "~/components/AccentColorPicker";
import { useTheme } from "~/lib/theme";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <ClerkLoaded>
      <SignedIn>
        <SettingsContent />
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] gap-4">
          <Text variant="h2">Sign in to access settings</Text>
          <Text variant="body" muted>
            You need to be signed in to manage your profile and preferences.
          </Text>
          <SignInButton mode="modal">
            <Button variant="solid">Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </ClerkLoaded>
  );
}

function SettingsContent() {
  const { user } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const updateUsername = useMutation(api.users.updateUsername);
  const { setMode, mode } = useTheme();

  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize username from convex user
  useEffect(() => {
    if (convexUser?.username) {
      setUsername(convexUser.username);
    }
  }, [convexUser?.username]);

  const handleSaveUsername = async () => {
    if (!user?.id || !username.trim()) return;
    setSaving(true);
    try {
      await updateUsername({
        clerkId: user.id,
        username: username.trim().replace(/^@/, ""),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <VStack gap="xl">
        <Text variant="h1">Settings</Text>

        {/* Profile Section */}
        <Card variant="glass" padding="lg" radius="xl">
          <VStack gap="md">
            <Text variant="h3">Profile</Text>

            <HStack gap="md" align="center">
              <Avatar
                src={user?.imageUrl}
                fallback={user?.fullName || "U"}
                size="xl"
              />
              <VStack gap="xs">
                <Text variant="body" weight="semibold">
                  {convexUser?.username
                    ? `@${convexUser.username}`
                    : user?.fullName || "User"}
                </Text>
                <Text variant="caption" muted>
                  {user?.emailAddresses[0]?.emailAddress}
                </Text>
              </VStack>
            </HStack>

            <Divider />

            <VStack gap="sm">
              <Input
                label="Public Username"
                placeholder="username"
                value={username}
                onChangeText={setUsername}
                leftElement={
                  <span className="text-[var(--muted)] text-sm font-medium">@</span>
                }
              />
              <Text variant="caption" muted>
                This is your public identity. Other users will see this on your profile and activity.
              </Text>
              <HStack gap="sm" align="center">
                <Button
                  variant="solid"
                  size="sm"
                  onPress={handleSaveUsername}
                  loading={saving}
                  disabled={saving}
                >
                  {saved ? "Saved!" : "Save"}
                </Button>
                {saved && (
                  <Text variant="caption" accent>
                    Username updated
                  </Text>
                )}
              </HStack>
            </VStack>
          </VStack>
        </Card>

        {/* Appearance Section */}
        <Card variant="glass" padding="lg" radius="xl">
          <VStack gap="md">
            <Text variant="h3">Appearance</Text>

            <VStack gap="sm">
              <Text variant="label">Theme Mode</Text>
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

            <Divider />

            <VStack gap="sm">
              <Text variant="label">Accent Color</Text>
              <AccentColorPicker />
            </VStack>
          </VStack>
        </Card>

        {/* Account Section */}
        <Card variant="glass" padding="lg" radius="xl">
          <VStack gap="md">
            <Text variant="h3">Account</Text>
            <Text variant="body" muted>
              Signed in as {user?.emailAddresses[0]?.emailAddress}
            </Text>
            <SignOutButton>
              <Button
                variant="outline"
                leftIcon={<LogOut size={16} />}
              >
                Sign Out
              </Button>
            </SignOutButton>
          </VStack>
        </Card>

        {/* Footer spacing for mobile bottom nav */}
        <div className="h-24" />
      </VStack>
    </div>
  );
}
