import { Text, View } from "react-native";

export default function Search() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <Text className="text-3xl font-bold text-foreground">Search</Text>
      <Text className="mt-4 text-gray-400">Find streams and creators</Text>
    </View>
  );
}
