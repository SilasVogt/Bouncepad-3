import { Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-5xl font-bold text-foreground">Bouncepad</Text>
      <Text className="mt-4 text-xl text-gray-400">
        RSS-based livestreaming platform
      </Text>
    </View>
  );
}
