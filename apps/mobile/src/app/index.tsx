import { Text, View, Pressable } from "react-native";
import {
  SignedIn,
  SignedOut,
  useUser,
  useAuth,
} from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignIn = async () => {
    // For Expo, we need to use OAuth flow
    // This is a placeholder - you'll configure OAuth in Clerk dashboard
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <Text className="text-5xl font-bold text-foreground">Bouncepad</Text>
      <Text className="mt-4 text-xl text-gray-400">
        RSS-based livestreaming platform
      </Text>

      <View className="mt-8">
        <SignedOut>
          <Text className="text-gray-400 text-center">
            Sign in via the web app to test auth
          </Text>
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
