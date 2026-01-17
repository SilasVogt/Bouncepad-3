import { Text, View } from "react-native";
import { useTheme } from "../../lib/theme";

export default function Explore() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 32, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.foreground }} className="text-3xl font-bold">Explore</Text>
      <Text style={{ color: colors.muted }} className="mt-4">Discover new streams</Text>
    </View>
  );
}
