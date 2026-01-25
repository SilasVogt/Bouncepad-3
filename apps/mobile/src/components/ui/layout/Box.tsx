import { View, StyleSheet, type ViewStyle } from "react-native";
import type { BoxProps, Spacing, Radius } from "@bouncepad/shared";
import { GlassView } from "../glass/GlassView";

const paddingMap: Record<Spacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

const marginMap: Record<Spacing, number> = paddingMap;

const radiusMap: Record<Radius, number> = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export function Box({
  variant = "default",
  glassIntensity = "medium",
  padding = "none",
  margin = "none",
  radius = "none",
  bg,
  flex,
  children,
}: BoxProps) {
  // Glass variant uses GlassView
  if (variant === "glass" || variant === "glow") {
    return (
      <View style={{ margin: marginMap[margin], flex: flex === true ? 1 : typeof flex === "number" ? flex : undefined }}>
        <GlassView
          intensity={glassIntensity}
          glow={variant === "glow"}
          borderRadius={radiusMap[radius]}
          padding={paddingMap[padding]}
        >
          {children}
        </GlassView>
      </View>
    );
  }

  const style: ViewStyle = {
    padding: paddingMap[padding],
    margin: marginMap[margin],
    borderRadius: radiusMap[radius],
    backgroundColor: bg,
    flex: flex === true ? 1 : typeof flex === "number" ? flex : undefined,
  };

  return <View style={style}>{children}</View>;
}
