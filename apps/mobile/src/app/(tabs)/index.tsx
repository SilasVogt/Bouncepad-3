import { Text, View, Pressable, ScrollView } from "react-native";
import { SignedIn, SignedOut, useUser, useAuth, useOAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { Link } from "expo-router";
import { api } from "@bouncepad/backend/convex/_generated/api";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { AccentColorPicker } from "../../components/AccentColorPicker";
import { useTheme } from "../../lib/theme";
import type { ThemeMode } from "@bouncepad/shared";

WebBrowser.maybeCompleteAuthSession();

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const convexStatus = useQuery(api.test.ping);
  const createUser = useMutation(api.users.create);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { mode, setMode, colors } = useTheme();

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

  const handleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  // Sample colorful cards to demonstrate glass effect when scrolling
  const sampleColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      <View className="items-center mt-12 mb-8">
        <Text style={{ color: colors.foreground }} className="text-4xl font-bold">Bouncepad</Text>
        <Text style={{ color: colors.muted }} className="mt-2 text-lg">
          RSS-based livestreaming platform
        </Text>

        <Text style={{ color: colors.muted }} className="mt-2 text-sm">
          Convex: {convexStatus ? "Connected" : "Loading..."}
        </Text>

        <View className="mt-6">
          <SignedOut>
            <Pressable
              onPress={handleSignIn}
              className="px-6 py-3 bg-white rounded-lg"
            >
              <Text className="text-black font-medium">Sign In with Google</Text>
            </Pressable>
          </SignedOut>

          <SignedIn>
            <View className="items-center gap-4">
              <Text className="text-green-500">
                Signed in as {user?.emailAddresses[0]?.emailAddress}
              </Text>
              <Pressable
                onPress={() => signOut()}
                className="px-6 py-3 bg-red-600 rounded-lg"
              >
                <Text className="text-white font-medium">Sign Out</Text>
              </Pressable>
            </View>
          </SignedIn>
        </View>
      </View>

      {/* Theme Settings */}
      <View
        style={{ backgroundColor: colors.border }}
        className="p-4 rounded-2xl mb-6"
      >
        <Text style={{ color: colors.foreground }} className="text-lg font-semibold mb-4">
          Theme Settings
        </Text>

        <Text style={{ color: colors.muted }} className="text-sm mb-2">
          Mode
        </Text>
        <View className="flex-row gap-2 mb-4">
          {(["system", "light", "dark"] as ThemeMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{
                backgroundColor: mode === m ? colors.accent.main : colors.background,
              }}
              className="px-3 py-2 rounded-lg"
            >
              <Text
                style={{ color: mode === m ? "#fff" : colors.foreground }}
                className="capitalize"
              >
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: colors.muted }} className="text-sm mb-2">
          Accent Color
        </Text>
        <AccentColorPicker />
      </View>

      {/* Design System Showcase Link */}
      <Link href="/showcase" asChild>
        <Pressable
          style={{ backgroundColor: colors.accent.main }}
          className="p-4 rounded-2xl mb-6 items-center"
        >
          <Text className="text-white font-semibold text-lg">
            View Design System Showcase
          </Text>
        </Pressable>
      </Link>

      <Text style={{ color: colors.foreground }} className="text-lg font-semibold mb-4">
        Scroll to see liquid glass effect:
      </Text>

      {sampleColors.map((color, i) => (
        <View
          key={i}
          style={{ backgroundColor: color }}
          className="h-32 rounded-2xl mb-4 items-center justify-center"
        >
          <Text className="text-white text-xl font-bold">Card {i + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
