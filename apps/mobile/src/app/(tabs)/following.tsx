import { Text, View } from "react-native";
import { useTheme } from "../../lib/theme";

export default function Following() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 32, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.foreground }} className="text-3xl font-bold">Following</Text>
      <Text style={{ color: colors.muted }} className="mt-4">Streams from people you follow</Text>
    </View>
  );
}
