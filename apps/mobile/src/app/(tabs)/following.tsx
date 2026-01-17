import { Text, View } from "react-native";

export default function Following() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <Text className="text-3xl font-bold text-foreground">Following</Text>
      <Text className="mt-4 text-gray-400">Streams from people you follow</Text>
    </View>
  );
}
