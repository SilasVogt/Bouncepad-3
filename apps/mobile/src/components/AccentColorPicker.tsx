import { View, Pressable, StyleSheet } from "react-native";
import { accentColors, accentColorKeys, type AccentColorKey } from "@bouncepad/shared";
import { useTheme } from "../lib/theme";

export function AccentColorPicker() {
  const { accentColor, setAccentColor, colors } = useTheme();

  return (
    <View style={styles.container}>
      {accentColorKeys.map((key) => {
        const color = accentColors[key];
        const isSelected = key === accentColor;

        return (
          <Pressable
            key={key}
            onPress={() => setAccentColor(key)}
            style={[
              styles.colorButton,
              { backgroundColor: color[500] },
              isSelected && [
                styles.selected,
                { borderColor: colors.foreground },
              ],
            ]}
            accessibilityLabel={`Select ${color.name} accent color`}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selected: {
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
});
