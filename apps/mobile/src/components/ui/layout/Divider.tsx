import { View, StyleSheet } from "react-native";
import type { DividerProps, Spacing } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";

const spacingMap: Record<Spacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

export function Divider({
  orientation = "horizontal",
  spacing = "md",
  color,
}: DividerProps) {
  const { colors } = useTheme();
  const isHorizontal = orientation === "horizontal";

  return (
    <View
      style={[
        isHorizontal ? styles.horizontal : styles.vertical,
        {
          backgroundColor: color ?? colors.border,
          marginVertical: isHorizontal ? spacingMap[spacing] : 0,
          marginHorizontal: !isHorizontal ? spacingMap[spacing] : 0,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: "100%",
  },
});
