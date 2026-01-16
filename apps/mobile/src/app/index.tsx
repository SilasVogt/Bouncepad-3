import { Text, View, Pressable } from "react-native";
import { SignedIn, SignedOut, useUser, useAuth, useOAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "@bouncepad/backend/convex/_generated/api";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const convexStatus = useQuery(api.test.ping);
  const createUser = useMutation(api.users.create);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

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

  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <Text className="text-5xl font-bold text-foreground">Bouncepad</Text>
      <Text className="mt-4 text-xl text-gray-400">
        RSS-based livestreaming platform
      </Text>

      <Text className="mt-2 text-sm text-gray-500">
        Convex: {convexStatus ? "Connected" : "Loading..."}
      </Text>

      <View className="mt-8">
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
            <Text className="text-green-400">
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
  );
}
