import { View, StyleSheet, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DockProps, DockPosition, Spacing } from "@bouncepad/shared";
import { GlassView } from "../glass/GlassView";
import { useTheme } from "../../../lib/theme";

const paddingMap: Record<Spacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

const gapMap: Record<Spacing, number> = paddingMap;

export function Dock({
  position = "bottom",
  glass = true,
  glassIntensity = "medium",
  padding = "md",
  gap = "sm",
  safeArea = true,
  children,
}: DockProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const isHorizontal = position === "top" || position === "bottom";

  const positionStyle: ViewStyle = {
    position: "absolute",
    ...(position === "top" && { top: 0, left: 0, right: 0 }),
    ...(position === "bottom" && { bottom: 0, left: 0, right: 0 }),
    ...(position === "left" && { top: 0, bottom: 0, left: 0 }),
    ...(position === "right" && { top: 0, bottom: 0, right: 0 }),
  };

  const safeAreaPadding: ViewStyle = safeArea
    ? {
        paddingTop: position === "top" ? insets.top : 0,
        paddingBottom: position === "bottom" ? insets.bottom : 0,
        paddingLeft: position === "left" ? insets.left : 0,
        paddingRight: position === "right" ? insets.right : 0,
      }
    : {};

  const contentStyle: ViewStyle = {
    flexDirection: isHorizontal ? "row" : "column",
    alignItems: "center",
    justifyContent: "center",
    gap: gapMap[gap],
    padding: paddingMap[padding],
    ...safeAreaPadding,
  };

  if (glass) {
    return (
      <View style={positionStyle}>
        <GlassView
          intensity={glassIntensity}
          borderRadius={0}
          padding={0}
        >
          <View style={contentStyle}>{children}</View>
        </GlassView>
      </View>
    );
  }

  return (
    <View
      style={[
        positionStyle,
        contentStyle,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderTopWidth: position === "bottom" ? StyleSheet.hairlineWidth : 0,
          borderBottomWidth: position === "top" ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      {children}
    </View>
  );
}
