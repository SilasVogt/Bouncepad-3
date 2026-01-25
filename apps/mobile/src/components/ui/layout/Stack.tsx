import { View, StyleSheet, type ViewStyle, type FlexAlignType } from "react-native";
import type { VStackProps, HStackProps, Spacing, Alignment, JustifyContent } from "@bouncepad/shared";

const gapMap: Record<Spacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

const paddingMap: Record<Spacing, number> = gapMap;

const alignMap: Record<Alignment, FlexAlignType> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

const justifyMap: Record<JustifyContent, ViewStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

export function VStack({
  gap = "md",
  align = "stretch",
  justify = "start",
  padding = "none",
  wrap = false,
  children,
}: VStackProps) {
  return (
    <View
      style={[
        styles.vstack,
        {
          gap: gapMap[gap],
          alignItems: alignMap[align],
          justifyContent: justifyMap[justify],
          padding: paddingMap[padding],
          flexWrap: wrap ? "wrap" : "nowrap",
        },
      ]}
    >
      {children}
    </View>
  );
}

export function HStack({
  gap = "md",
  align = "center",
  justify = "start",
  padding = "none",
  wrap = false,
  children,
}: HStackProps) {
  return (
    <View
      style={[
        styles.hstack,
        {
          gap: gapMap[gap],
          alignItems: alignMap[align],
          justifyContent: justifyMap[justify],
          padding: paddingMap[padding],
          flexWrap: wrap ? "wrap" : "nowrap",
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  vstack: {
    flexDirection: "column",
  },
  hstack: {
    flexDirection: "row",
  },
});

export const Stack = { V: VStack, H: HStack };
